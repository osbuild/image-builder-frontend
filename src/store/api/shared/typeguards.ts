// NOTE: we need the trailing comma here for the type to be valid
// prettier-ignore
export const isDefined = <T,>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

export const isNonNullObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
