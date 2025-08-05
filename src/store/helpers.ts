import type { V1ListSourceResponse } from './provisioningApi';

export const extractProvisioningList = (
  list: V1ListSourceResponse | undefined,
) => list?.data;
