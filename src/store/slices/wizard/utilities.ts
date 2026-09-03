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
