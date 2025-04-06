import request from 'supertest';
import createApp from '../../src/server';
import { prismaMock } from '../../src/lib/singleton';

const app = createApp(prismaMock);

const sampleInvoices = [
  {
    id: '1',
    clientNumber: '1234567',
    referenceMonth: 'JUN/2023',
    electricEnergyKwh: 150,
    electricEnergyR: 118.5,
    energySCEEKwh: 75,
    energySCEER: 40.5,
    energyCompensationKwh: 100,
    energyCompensationR: -45,
    publicLightingR: 10.5,
    totalR: 124.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    clientNumber: '7654321',
    referenceMonth: 'JUL/2023',
    electricEnergyKwh: 180,
    electricEnergyR: 142.2,
    energySCEEKwh: 90,
    energySCEER: 48.6,
    energyCompensationKwh: 120,
    energyCompensationR: -54,
    publicLightingR: 12.6,
    totalR: 149.4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('GET /invoices', () => {
  it('should return a list of invoices', async () => {
    prismaMock.invoice.findMany.mockResolvedValue(sampleInvoices);

    const response = await request(app).get('/invoices');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty(
      'clientNumber',
      sampleInvoices[0].clientNumber
    );
    expect(response.body[1]).toHaveProperty(
      'clientNumber',
      sampleInvoices[1].clientNumber
    );
  });
});

describe('GET /invoices/aggregate', () => {
  it('should return aggregated invoice data', async () => {
    prismaMock.invoice.findMany.mockResolvedValue(sampleInvoices);

    const response = await request(app).get('/invoices/aggregate');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      energyConsumption: 495, // 150 + 75 + 180 + 90
      compensatedEnergy: 220, // 100 + 120
      totalWithoutGD: 372.90000000000003, // 118.5 + 40.5 + 10.5 + 142.2 + 48.6 + 12.6
      gdEconomy: -99, // (-45) + (-54)
      totalValue: 273.9, // 124.5 + 149.4
      financialResults: [
        { name: 'Sem GD', value: 372.90000000000003 },
        { name: 'Economia GD', value: -99 },
      ],
      energyResults: [
        { name: 'Consumido', value: 495 },
        { name: 'Compensado', value: 220 },
      ],
    });
  });
});
