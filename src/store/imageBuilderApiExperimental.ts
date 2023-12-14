import { emptyImageBuilderApiExperimental as api } from './emptyImageBuilderApiExperimental';
import { Distributions, ImageRequest, Customizations } from './imageBuilderApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBlueprints: build.query({
      query: () => ({
        url: `/experimental/blueprint`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as imageBuilderApiExperimental };
export type GetBlueprintsApiResponse = GetBlueprintsResponse;
export type Blueprint = {
  id: string;
  name: string;
  description: string;
  distribution: Distributions;
  image_requests: ImageRequest[];
  customizations: Customizations;
};
export type GetBlueprintsResponse = Blueprint[];
export const { useGetBlueprintsQuery } = injectedRtkApi;
