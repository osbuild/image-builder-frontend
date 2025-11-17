/* eslint-disable @typescript-eslint/no-explicit-any */
export const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as any).data === 'object' &&
    (error as any).data !== null &&
    'error' in (error as any).data &&
    typeof (error as any).data.error === 'object' &&
    (error as any).data.error !== null &&
    'message' in (error as any).data.error &&
    typeof (error as any).data.error.message === 'string'
  ) {
    return (error as any).data.error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as any).message;
  }

  return 'Unknown error';
};
