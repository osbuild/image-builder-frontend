import React from 'react';

import '@testing-library/jest-dom';

import { useFlag } from '@unleash/proxy-client-react';

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) =>
    flag === 'image-builder.edge.local-image-table' ? true : false
  ),
}));

describe('mocking unleash calls', () => {
  test('the ege local image table is set to true', () => {
    const edgeLocalImageTable = useFlag('image-builder.edge.local-image-table');
    expect(edgeLocalImageTable).toBe(true);
  });
});
