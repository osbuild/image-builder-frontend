// TODO: maybe we could have a more descriptive name for this function
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
