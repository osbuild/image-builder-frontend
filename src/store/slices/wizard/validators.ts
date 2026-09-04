import type z from 'zod';

import type { ValidationIssue, ValidationResult } from './types';

export const validateSchema = <T>(
  schema: z.ZodType<T>,
  item?: T | undefined,
): ValidationResult => {
  if (!item) return [];

  const result = schema.safeParse(item);
  if (result.success) return [];

  return result.error.issues.map((i): ValidationIssue => {
    if (i.code === 'custom' && i.params?.type === 'duplicate') {
      return {
        message: i.message,
        kind: 'duplicate',
        value: i.params.value,
      };
    }

    return {
      message: i.message,
      kind: 'format',
      value: String(item),
    };
  });
};

export const validateList = <T>(
  schema: z.ZodType<T[]>,
  items: T[],
): ValidationResult => {
  const result = schema.safeParse(items);
  if (result.success) return [];

  return result.error.issues.map((i): ValidationIssue => {
    if (i.code === 'custom' && i.params?.type === 'duplicate') {
      return {
        message: i.message,
        kind: 'duplicate',
        value: i.params.value,
      };
    }

    const index = i.path[0];
    return {
      message: i.message,
      kind: 'format',
      ...(typeof index === 'number' ? { value: String(items[index]) } : {}),
    };
  });
};
