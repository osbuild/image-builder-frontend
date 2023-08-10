import type { V1ListSourceResponse } from './provisioningApi';

export const extractProvisioningList = (list: V1ListSourceResponse) =>
  list?.data;
