import { emptyCockpitApi } from '@/store/cockpit/emptyCockpitApi';

// NOTE: we are re-exporting the 'emptyCockpitApi' as the `emptyContentSourcesApi`
// to maintain consistency across the modules. RTK Query requires endpoints that
// share a backend to use the same API slice to properly manage caching and request
// deduplication, for on-prem, all queries share the same base URL and unix socket.
export const emptyContentSourcesApi = emptyCockpitApi;
