import { Types } from 'mongoose';
import { isValidMoney, moneyToString } from './schema-validation.js';

describe('isValidMoney', () => {
  it('formatea sin Number y rechaza importes inválidos en respuestas', () => {
    expect(moneyToString('3')).toBe('3.00');
    expect(moneyToString('0.7')).toBe('0.70');
    expect(
      moneyToString(Types.Decimal128.fromString('999999999999999999999.99')),
    ).toBe('999999999999999999999.99');
    expect(() => moneyToString('NaN')).toThrow();
  });
  it.each(['0', '0.00', '3.5', '3.50', '99999999999999999999999999999.99'])(
    'acepta %s sin perder precisión',
    (value) => {
      expect(isValidMoney(Types.Decimal128.fromString(value))).toBe(true);
    },
  );
  it.each(['-1', '1.000', 'NaN', 'Infinity', '1E+5'])('rechaza %s', (value) => {
    expect(isValidMoney(Types.Decimal128.fromString(value))).toBe(false);
  });
  it('no convierte objetos arbitrarios ni Number a importes', () => {
    expect(isValidMoney({})).toBe(false);
    expect(isValidMoney(0.1 + 0.2)).toBe(false);
  });
});
