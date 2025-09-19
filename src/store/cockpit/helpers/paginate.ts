export const paginate = <T extends { id: string }>(
  items: T[],
  offset?: number | undefined,
  limit?: number | undefined,
) => {
  const first = items.length > 0 ? items[0].id : '';
  const last = items.length > 0 ? items[items.length - 1].id : '';

  return {
    data: {
      meta: { count: items.length },
      links: {
        first: first,
        last: last,
      },
      data: items.slice(offset ?? 0, (offset ?? 0) + (limit ?? 100)),
    },
  };
};
