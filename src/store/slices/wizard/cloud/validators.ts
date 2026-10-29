import { awsAccountIdSchema, cloudSliceSchema } from './schemas';
import { CloudProviderSlice } from './types';

import { validateSchema } from '../validators';

export const validateAwsAccountId = (accountId: string | undefined) => {
  const { data, issues } = validateSchema(awsAccountIdSchema, accountId);

  return {
    data,
    errors: issues,
  };
};

export const validateCloudSlice = (
  slice: Omit<CloudProviderSlice, 'gcp' | 'azure'>,
) => {
  const { data, issues } = validateSchema(cloudSliceSchema, slice);

  return {
    data,
    errors: issues,
  };
};
