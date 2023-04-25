import { getBaseName } from './Utilities/path';

describe('Utilities/getBaseName', () => {
  it('should find the right base name on Stable ', () => {
    expect(getBaseName('/')).toEqual('/');
    expect(getBaseName('/rhcs/bar/bar/baz')).toEqual('/');
  });

  it('should find the right base name on Preview ', () => {
    expect(getBaseName('/preview')).toEqual('/preview/');
    expect(getBaseName('/preview/foo/bar/baz')).toEqual('/preview/');
  });
});
