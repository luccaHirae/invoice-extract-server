import fs from 'fs';
import PdfParse from 'pdf-parse';
import { Request, Response } from 'express';
import { parseInvoiceData } from '../utils/invoice';
import { PrismaClient } from '@prisma/client';

export const getInvoices = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany();

    // format the invoices to add the month and year
    const formattedInvoices = invoices.map((invoice) => {
      const [month, year] = invoice.referenceMonth.split('/');
      const monthNames = {
        JAN: 'Janeiro',
        FEV: 'Fevereiro',
        MAR: 'Março',
        ABR: 'Abril',
        MAI: 'Maio',
        JUN: 'Junho',
        JUL: 'Julho',
        AGO: 'Agosto',
        SET: 'Setembro',
        OUT: 'Outubro',
        NOV: 'Novembro',
        DEZ: 'Dezembro',
      };
      const monthName = monthNames[month as keyof typeof monthNames];
      const formattedMonth = monthName ? monthName : month;
      const formattedYear = year ? year : '';

      return {
        ...invoice,
        month: formattedMonth,
        year: formattedYear,
      };
    });

    res.status(200).json(formattedInvoices);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to fetch invoices: ${message}` });
  }
};

export const aggregateInvoiceData = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany();

    // Consumo de Energia Elétrica (KWh): corresponde ao somatório das variáveis‘Energia Elétrica kWh’ + ‘Energia SCEEE s/ICMS kWh’
    const energyConsumption = invoices.reduce((acc, invoice) => {
      return (
        acc + (invoice.electricEnergyKwh || 0) + (invoice.energySCEEKwh || 0)
      );
    }, 0);

    // Energia Compensada (kWh): corresponde à variável ‘Energia Compensada GD I (kWh)’
    const compensatedEnergy = invoices.reduce((acc, invoice) => {
      return acc + (invoice.energyCompensationKwh || 0);
    }, 0);

    // Valor Total sem GD (R$): somatório dos valores faturados de ‘Energia Elétrica (R$)’ +
    // ‘Energia SCEE s/ ICMS (R$)’ + ‘Contrib Ilum Publica Municipal (R$)’
    const totalWithoutGD = invoices.reduce((acc, invoice) => {
      return (
        acc +
        (invoice.electricEnergyR || 0) +
        (invoice.energySCEER || 0) +
        (invoice.publicLightingR || 0)
      );
    }, 0);

    // Economia GD (R$): corresponde à ‘Energia compensada GD I (R$)’
    const gdEconomy = invoices.reduce((acc, invoice) => {
      return acc + (invoice.energyCompensationR || 0);
    }, 0);

    // Valor Total (R$): corresponde à variável ‘Valor Total (R$)’
    const totalValue = invoices.reduce((acc, invoice) => {
      return acc + (invoice.totalR || 0);
    }, 0);

    const energyResults = [
      { name: 'Consumido', value: energyConsumption },
      { name: 'Compensado', value: compensatedEnergy },
    ];

    const financialResults = [
      { name: 'Sem GD', value: totalWithoutGD },
      { name: 'Economia GD', value: gdEconomy },
    ];

    res.status(200).json({
      energyConsumption: energyConsumption,
      compensatedEnergy: compensatedEnergy,
      totalWithoutGD: totalWithoutGD,
      gdEconomy: gdEconomy,
      totalValue: totalValue,
      financialResults: financialResults,
      energyResults: energyResults,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res
      .status(500)
      .json({ error: `Failed to aggregate invoice data: ${message}` });
  }
};

export const saveInvoice = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
): Promise<void> => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400).json({ error: 'No files provided' });
      return;
    }

    // TODO: handle multiple files, for now just take the first one
    const files = Array.isArray(req.files) ? req.files : [req.files];
    const file = files[0] as Express.Multer.File;
    const filePath = file.path;

    // parse the pdf file
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await PdfParse(pdfBuffer);
    const text = pdfData.text;

    // extract data from the pdf text
    const extractedData = parseInvoiceData(text);

    // check if the extracted data is valid
    if (
      !extractedData.clientNumber ||
      !extractedData.referenceMonth ||
      !extractedData.electricEnergy ||
      !extractedData.energySCEEICMS ||
      !extractedData.energyCompensated ||
      !extractedData.publicLighting ||
      !extractedData.paymentValue
    ) {
      res.status(400).json({ error: 'Invalid PDF format or missing data' });
      return;
    }

    // check if the invoice already exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        clientNumber: extractedData.clientNumber,
        referenceMonth: extractedData.referenceMonth,
      },
    });

    if (existingInvoice) {
      res.status(409).json({ error: 'Invoice already exists' });
      return;
    }

    // save the extracted data to the database
    const newInvoice = await prisma.invoice.create({
      data: {
        clientNumber: extractedData.clientNumber,
        referenceMonth: extractedData.referenceMonth,
        electricEnergyKwh: extractedData.electricEnergy.quantity,
        electricEnergyR: extractedData.electricEnergy.value,
        energySCEEKwh: extractedData.energySCEEICMS.quantity,
        energySCEER: extractedData.energySCEEICMS.value,
        energyCompensationKwh: extractedData.energyCompensated.quantity,
        energyCompensationR: extractedData.energyCompensated.value,
        publicLightingR: extractedData.publicLighting,
        totalR: extractedData.paymentValue,
      },
    });

    res.status(201).json(newInvoice);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to save invoice: ${message}` });
  }
};
