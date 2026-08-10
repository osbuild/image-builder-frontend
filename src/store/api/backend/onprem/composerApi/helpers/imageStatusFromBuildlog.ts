import { getJournal } from './getJournal';
import { safeReadJsonFile } from './safeReadJsonFile';

import type { ImageStatus } from '../../../hosted';

type ValidationError = {
  message: string;
  path: string[];
};

export type OSBuildResult = {
  success: boolean;
  error?: object;
  errors?: ValidationError[];
};

export const imageStatusFromBuildlog = async (
  buildlog: string,
  composeId: string,
): Promise<ImageStatus> => {
  const result = await safeReadJsonFile<OSBuildResult>(buildlog);

  // imageStatusFromBuildlog is only called if the systemd unit running
  // image-builder is no longer active.
  if (result === null) {
    return {
      status: 'failure',
      error: {
        id: 10,
        reason: 'image-builder process is not running and no result was found',
        details: await getJournal(composeId),
      },
    };
  }

  if (result.success) {
    return {
      status: 'success',
    };
  }

  let details = undefined;
  // "error" and "errors" are never set at the same time:
  // "error" contains build failures, and "errors" contains validation failures.
  if (result.error || result.errors) {
    details = JSON.stringify(result.error || result.errors);
  }
  if (!details) {
    details = await getJournal(composeId);
  }

  // osbuild failures are always id: 10
  return {
    status: 'failure',
    error: {
      id: 10,
      reason: 'osbuild failed',
      details,
    },
  };
};
