import '@testing-library/jest-dom';

import { useFlag } from '@unleash/proxy-client-react';

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) =>
    flag === 'image-builder.edge.local-image-table' ? true : false
  ),
}));

describe('mocking unleash calls', () => {
  test('the ege local image table is set to true', () => {
    const edgeLocalImageTable = useFlag('image-builder.edge.local-image-table');
    expect(edgeLocalImageTable).toBe(true);
  });
});
