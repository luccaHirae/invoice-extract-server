import { parseInvoiceData } from '../../src/utils/invoice';

describe('parseInvoiceData', () => {
  it('should extract client number', () => {
    const mockInvoiceText = `
      Nº DO CLIENTE     Nº DA INSTALAÇÃO
      1234567            9876543
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.clientNumber).toBe('1234567');
  });

  it('should extract reference month', () => {
    const mockInvoiceText = `
      Referente a JUN/2023 15/07/2023
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.referenceMonth).toBe('JUN/2023');
  });

  it('should extract reference month using fallback pattern', () => {
    const mockInvoiceText = `
      Some text JUL/2023 some other text
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.referenceMonth).toBe('JUL/2023');
  });

  it('should extract electric energy data', () => {
    const mockInvoiceText = `
      Energia ElétricakWh  150  0,79  118,50
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.electricEnergy).toEqual({
      quantity: 150,
      value: 118.5,
    });
  });

  it('should extract energy SCEE ICMS data', () => {
    const mockInvoiceText = `
      Energia SCEE s/ ICMSkWh  75  0,54  40,50
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.energySCEEICMS).toEqual({
      quantity: 75,
      value: 40.5,
    });
  });

  it('should extract energy compensated data', () => {
    const mockInvoiceText = `
      Energia compensada GD IkWh  100  0,45  -45,00
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.energyCompensated).toEqual({
      quantity: 100,
      value: -45,
    });
  });

  it('should extract public lighting contribution', () => {
    const mockInvoiceText = `
      Contrib Ilum Publica Municipal  10,50
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.publicLighting).toBe(10.5);
  });

  it('should extract payment value', () => {
    const mockInvoiceText = `
      Valor a pagar (R$)
      
      107,38
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.paymentValue).toBe(107.38);
  });

  it('should extract payment value using fallback pattern', () => {
    const mockInvoiceText = `
      15/07/2023  107,38
    `;

    const result = parseInvoiceData(mockInvoiceText);
    expect(result.paymentValue).toBe(107.38);
  });

  it('should parse a complete invoice text correctly', () => {
    const mockInvoiceText = `
      Nº DO CLIENTE     Nº DA INSTALAÇÃO
      1234567            9876543
      
      Referente a JUN/2023 15/07/2023
      
      Energia ElétricakWh  150  0,79  118,50
      Energia SCEE s/ ICMSkWh  75  0,54  40,50
      Energia compensada GD IkWh  100  0,45  -45,00
      Contrib Ilum Publica Municipal  10,50
      
      Valor a pagar (R$)
      
      124,50
    `;

    const result = parseInvoiceData(mockInvoiceText);

    expect(result).toEqual({
      clientNumber: '1234567',
      referenceMonth: 'JUN/2023',
      electricEnergy: { quantity: 150, value: 118.5 },
      energySCEEICMS: { quantity: 75, value: 40.5 },
      energyCompensated: { quantity: 100, value: -45 },
      publicLighting: 10.5,
      paymentValue: 124.5,
    });
  });
});
