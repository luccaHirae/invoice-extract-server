export function parseInvoiceData(text: string) {
  const data: {
    clientNumber: string | null;
    referenceMonth: string | null;
    electricEnergy: { quantity: number; value: number } | null;
    energySCEEICMS: { quantity: number; value: number } | null;
    energyCompensated: { quantity: number; value: number } | null;
    publicLighting: number | null;
    paymentValue: number | null;
  } = {
    clientNumber: null,
    referenceMonth: null,
    electricEnergy: null,
    energySCEEICMS: null,
    energyCompensated: null,
    publicLighting: null,
    paymentValue: null,
  };

  // Extract Nº DO CLIENTE
  const clientNumberRegex = /Nº DO CLIENTE\s+Nº DA INSTALAÇÃO\s+(\d+)\s+\d+/;
  const clientNumberMatch = text.match(clientNumberRegex);
  data.clientNumber = clientNumberMatch ? clientNumberMatch[1] : null;

  // Extract Mês de referência
  // The format in the PDF might have additional whitespace or newlines
  const referenceMonthRegex = /Referente a\s+([\w\/]+)\s+\d{2}\/\d{2}\/\d{4}/;

  // If the above regex doesn't work, try this more flexible pattern as a fallback
  const fallbackReferenceMonthRegex =
    /JAN\/\d{4}|FEV\/\d{4}|MAR\/\d{4}|ABR\/\d{4}|MAI\/\d{4}|JUN\/\d{4}|JUL\/\d{4}|AGO\/\d{4}|SET\/\d{4}|OUT\/\d{4}|NOV\/\d{4}|DEZ\/\d{4}/;

  const referenceMonthMatch = text.match(referenceMonthRegex);
  const fallbackMatch = !referenceMonthMatch
    ? text.match(fallbackReferenceMonthRegex)
    : null;

  // If primary regex matched, use capture group at position 1
  // If fallback regex matched, use the full match at position 0
  data.referenceMonth = referenceMonthMatch
    ? referenceMonthMatch[1]
    : fallbackMatch
    ? fallbackMatch[0]
    : null;

  // Extract Energia Elétrica (kWh and value in R$)
  const electricEnergyMatch = text.match(
    /Energia ElétricakWh\s+(\d+)\s+\d+,\d+\s+(\d+,\d+)/
  );
  data.electricEnergy = electricEnergyMatch
    ? {
        quantity: Number(electricEnergyMatch[1]),
        value: parseFloat(electricEnergyMatch[2].replace(',', '.')),
      }
    : null;

  // Extract Energia SCEE s/ ICMS (kWh and value in R$)
  const energySCEEICMSMatch = text.match(
    /Energia SCEE s\/ ICMSkWh\s+(\d+)\s+\d+,\d+\s+(\d+,\d+)/
  );
  data.energySCEEICMS = energySCEEICMSMatch
    ? {
        quantity: Number(energySCEEICMSMatch[1]),
        value: parseFloat(energySCEEICMSMatch[2].replace(',', '.')),
      }
    : null;

  // Extract Energia Compensada GD I (kWh and value in R$)
  const energyCompensatedMatch = text.match(
    /Energia compensada GD IkWh\s+(\d+)\s+\d+,\d+\s+(-?\d+,\d+)/
  );
  data.energyCompensated = energyCompensatedMatch
    ? {
        quantity: Number(energyCompensatedMatch[1]),
        value: parseFloat(energyCompensatedMatch[2].replace(',', '.')),
      }
    : null;

  // Extract Contribuição Iluminação Pública (value in R$)
  const publicLightingMatch = text.match(
    /Contrib Ilum Publica Municipal\s+(\d+,\d+)/
  );
  data.publicLighting = publicLightingMatch
    ? parseFloat(publicLightingMatch[1].replace(',', '.'))
    : null;

  // Extract Valor a pagar (value in R$)
  // Looking for patterns like "107,38" which appears after "Valor a pagar (R$)"
  const paymentValueRegex = /Valor a pagar \(R\$\)[\s\S]+?(\d+,\d+)/;

  // Alternative regex that might catch the value in different formats
  const fallbackPaymentValueRegex = /\d{2}\/\d{2}\/\d{4}\s+(\d+,\d+)/;

  const paymentValueMatch =
    text.match(paymentValueRegex) || text.match(fallbackPaymentValueRegex);
  data.paymentValue = paymentValueMatch
    ? parseFloat(paymentValueMatch[1].replace(',', '.'))
    : null;

  return data;
}
