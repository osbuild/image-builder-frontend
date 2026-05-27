export const parseJsonUnsafe = <T>(result: string) => {
  try {
    return JSON.parse(result) as T;
  } catch {
    throw new Error('Unable to convert result to JSON');
  }
};
