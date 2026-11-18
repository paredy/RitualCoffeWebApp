import { SchemaTypes, Types, type Schema } from 'mongoose';

export const CODE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const normalizedCode = {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  match: CODE_PATTERN,
};

// Validate decimal text without converting monetary amounts to JS numbers.
export function isValidMoney(value: unknown): boolean {
  if (value == null) return true; // Required fields reject null separately.
  const text =
    value instanceof Types.Decimal128
      ? value.toString()
      : typeof value === 'string'
        ? value
        : '';
  return /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(text);
}

const moneyValidation = {
  validator: isValidMoney,
  message: 'El importe debe ser no negativo y tener máximo dos decimales',
};
export const requiredMoney = {
  type: SchemaTypes.Decimal128,
  required: true,
  validate: moneyValidation,
};
export const optionalMoney = {
  type: SchemaTypes.Decimal128,
  default: null,
  validate: moneyValidation,
};
export const zeroMoney = { ...requiredMoney, default: '0.00' };
export const nonNegativeInteger = {
  type: Number,
  required: true,
  min: 0,
  default: 0,
  validate: Number.isSafeInteger,
};
export const positiveInteger = {
  type: Number,
  required: true,
  min: 1,
  validate: Number.isSafeInteger,
};

export function isDocumentArray(value: unknown): value is object[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) =>
        item !== null && typeof item === 'object' && !Array.isArray(item),
    )
  );
}

export function moneyToString(value: Types.Decimal128 | string): string {
  if (!isValidMoney(value)) throw new Error('Importe decimal inválido');
  const [whole, fraction = ''] = value.toString().split('.');
  return `${whole}.${fraction.padEnd(2, '0')}`;
}

function jsonMoney(value: unknown): unknown {
  if (value instanceof Types.Decimal128) {
    const text = value.toString();
    if (!isValidMoney(value)) return text;
    return moneyToString(value);
  }
  if (Array.isArray(value)) return value.map(jsonMoney);
  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, jsonMoney(item)]),
    );
  }
  return value;
}

// Also serializes Decimal128 values inside historical item snapshots.
export function moneyJson(schema: Schema): void {
  schema.set('toJSON', {
    transform: (_document, result) => jsonMoney(result),
  });
}
