import { useFlag } from '../../../Utilities/useGetEnvironment';

describe('mocking unleash calls', () => {
  test('the ege local image table is set to true', () => {
    const edgeLocalImageTable = useFlag('image-builder.edge.local-image-table');
    expect(edgeLocalImageTable).toBe(true);
  });
});
