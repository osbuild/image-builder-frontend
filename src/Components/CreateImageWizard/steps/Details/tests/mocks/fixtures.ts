import type { BlueprintsResponse } from '@/store/api/backend';

export const duplicateBlueprintsResponse: BlueprintsResponse = {
  data: [
    {
      id: 'existing-blueprint-id',
      name: 'Existing Blueprint',
      description: 'An existing blueprint',
      version: 1,
      last_modified_at: '2024-01-01T00:00:00Z',
    },
  ],
  links: {
    first: '',
    last: '',
  },
  meta: {
    count: 1,
  },
};
