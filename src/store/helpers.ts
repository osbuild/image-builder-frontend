import type { V1ListSourceResponse } from '@/store/api/provisioning';

export const extractProvisioningList = (
  list: V1ListSourceResponse | undefined,
) => list?.data;
