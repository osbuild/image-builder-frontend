import { emptyComplianceApi as api } from './emptyComplianceApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({}),
  overrideExisting: false,
});
export { injectedRtkApi as complianceApi };
export const {} = injectedRtkApi;
