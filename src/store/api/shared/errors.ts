import { isNonNullObject } from './typeguards';
import { OnPremError } from './types';

export class OnPremApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OnPremApiError';
  }
}

export const toOnPremError = (error: unknown): OnPremError => {
  // Handle objects with a message property first so that Error subclasses
  // carrying extra fields like body or problem don't lose them.
  if (isNonNullObject(error) && 'message' in error) {
    const result: OnPremError = {
      message: String(error.message),
    };

    if ('problem' in error && typeof error.problem === 'string') {
      result.problem = error.problem;
    }

    if ('body' in error) {
      result.body = error.body;
    }

    return result;
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: 'An unexpected error occurred' };
};
