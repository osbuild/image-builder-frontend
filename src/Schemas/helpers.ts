import { z, ZodSchema } from 'zod/v4';
import { $ZodError } from 'zod/v4/core';

// TODO: maybe we could have a more descriptive name for this function
// TODO: we should also make this more generic so that it works on objects too
// i.e. it might be nice to check an array of users and make sure that the usernames
// aren't duplicated
export const unique = (key: string) => {
  return (data: string[], ctx: z.RefinementCtx) => {
    if (!data || data.length == 0) {
      return;
    }

    const seen = new Set();
    data.forEach((item, index) => {
      if (seen.has(item)) {
        ctx.addIssue({
          code: 'custom',
          message: `The ${key} items must be unique`,
          path: [index],
        });
      } else {
        seen.add(item);
      }
    });
  };
};

export const unwrapField = (error: $ZodError) => {
  return error.issues.map((issue) => issue.message);
};

export const validateField = <T>(value: T, Schema: ZodSchema<T>) => {
  const result = Schema.safeParse(value);

  if (result.success) {
    return [];
  }

  return unwrapField(result.error);
};

export const unwrapForm = (error: $ZodError) => {
  const errors: Record<string | number, unknown> = {};

  for (const issue of error.issues) {
    let current = errors;
    const { path } = issue;

    for (let i = 0; i < path.length; i++) {
      const key = path[i] as string;

      // If this is the last part of the path → push issue
      if (i === path.length - 1) {
        if (!current[key]) current[key] = [];
        // @ts-expect-error
        current[key].push(issue.message);
      } else {
        // Otherwise descend into object, creating as needed
        if (!current[key]) current[key] = {};
        // @ts-expect-error
        current = current[key];
      }
    }
  }

  return { disabledNext: true, errors };
};

export type ValidationResult = {
  // TODO: change this to invalid
  // we can only do this once all the
  // validation hooks have been replaced
  disabledNext: boolean;
  errors: Record<string | number | symbol, unknown>;
};

export const validateForm = <T>(
  value: T,
  Schema: ZodSchema<T>,
): ValidationResult => {
  const result = Schema.safeParse(value);

  if (result.success) {
    return { disabledNext: false, errors: {} };
  }

  return unwrapForm(result.error);
};
