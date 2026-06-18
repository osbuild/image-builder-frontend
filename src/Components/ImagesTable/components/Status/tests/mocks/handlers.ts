import type { ComposeStatus } from '@/store/api/backend';

import { mockComposeRequest } from './fixtures';

export const createMockComposeStatus = (
  overrides: Partial<ComposeStatus> = {},
): ComposeStatus => ({
  image_status: {
    status: 'success',
  },
  request: mockComposeRequest,
  ...overrides,
});
