import z from 'zod';

export const uniqueArray = <T extends string>(label: string) => {
  return (items: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>();
    items.forEach((item) => {
      if (seen.has(item)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate ${label}: ${item}`,
          params: { type: 'duplicate', value: item },
        });
      }
      seen.add(item);
    });
  };
};

export const uniqueBy = <T, K extends string | number>(
  label: string,
  field: string,
  getValue: (item: T) => K | undefined,
) => {
  return (items: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<K>();

    items.forEach((item, index) => {
      const value = getValue(item);

      if (value === undefined || value === '') {
        return;
      }

      if (seen.has(value)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, field],
          message: `Duplicate ${label}: ${value}`,
          params: { type: 'duplicate', value },
        });
      }

      seen.add(value);
    });
  };
};
