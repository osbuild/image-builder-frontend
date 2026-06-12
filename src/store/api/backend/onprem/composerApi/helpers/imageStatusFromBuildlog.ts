import { ImageStatus } from '../../../hosted';

import { safeReadJsonFile } from './safeReadJsonFile';


type ValidationError = {
  message: string;
  path: string[];
};

type OSBuildResult = {
  success: boolean;
  error: object | undefined;
  errors: ValidationError[] | undefined;
};

export const imageStatusFromBuildlog = async (
  buildlog: string
): Promise<ImageStatus> => {
  const result = await safeReadJsonFile<OSBuildResult>(buildlog);

  // imageStatusFromBuildlog is only called if the systemd unit running
  // image-builder is no longer active.
  if (result === null) {
    return {
      status: "failure",
      reason: "image-builder process not running and no result was found",
    };
  }

  if (result.success) {
    return {
      status: "success",
    };
  }

  // osbuild failures are always id: 10
  return {
    status: "failure",
    error: {
      id: 10,
      reason: "osbuild failed",
      details: result.error || result.errors,
    }
  }
};

