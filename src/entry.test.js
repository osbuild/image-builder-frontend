import { getBaseName } from './Utilities/path';

describe('Utilities/getBaseName', () => {
  it('should find the right base name on Stable ', () => {
    expect(getBaseName('/')).toEqual('/');
    expect(getBaseName('/rhcs/bar/bar/baz')).toEqual('/');
  });

  it('should find the right base name on Beta ', () => {
    expect(getBaseName('/beta')).toEqual('/beta/');
    expect(getBaseName('/beta/foo/bar/baz')).toEqual('/beta/');
  });
});
