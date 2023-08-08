import type { V1SourceResponse } from './provisioningApi';

export const extractProvisioningList = (
  list: V1SourceResponse[] | { data: V1SourceResponse[] }
) => (Array.isArray(list) ? list : list?.data);
