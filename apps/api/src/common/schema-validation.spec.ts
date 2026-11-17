import { Types } from 'mongoose';
import { isValidMoney } from './schema-validation.js';

describe('isValidMoney', () => {
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
