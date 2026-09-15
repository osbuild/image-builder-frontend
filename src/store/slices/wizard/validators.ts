import type z from 'zod';

import type { SchemaValidationResult, ValidationIssue } from './types';

export const validateSchema = <T>(
  schema: z.ZodType<T>,
  item?: T,
): SchemaValidationResult<T> => {
  if (item === undefined) return { data: undefined, issues: [] };

  const result = schema.safeParse(item);
  if (result.success) return { data: result.data, issues: [] };

  return {
    issues: result.error.issues.map((i): ValidationIssue => {
      if (i.code === 'custom' && i.params?.type === 'duplicate') {
        return {
          message: i.message,
          kind: 'duplicate',
          value: i.params.value,
          path: i.path,
        };
      }

      return {
        message: i.message,
        kind: 'format',
        value: String(item),
        path: i.path,
      };
    }),
  };
};

export const validateList = <T>(
  schema: z.ZodType<T[]>,
  items?: T[],
): SchemaValidationResult<T[]> => {
  if (items === undefined) return { data: undefined, issues: [] };

  const result = schema.safeParse(items);
  if (result.success) return { data: result.data, issues: [] };

  return {
    issues: result.error.issues.map((i): ValidationIssue => {
      if (i.code === 'custom' && i.params?.type === 'duplicate') {
        return {
          message: i.message,
          kind: 'duplicate',
          value: i.params.value,
          path: i.path,
        };
      }

      const index = i.path[0];
      return {
        message: i.message,
        kind: 'format',
        ...(typeof index === 'number' ? { value: String(items[index]) } : {}),
        path: i.path,
      };
    }),
  };
};
