import * as aliased from '@/Utilities/useGetEnvironment';

import * as hostedDirect from '../index';

describe('@/Utilities/useGetEnvironment alias resolution', () => {
  test('useGetEnvironment matches hosted direct import', () => {
    expect(aliased.useGetEnvironment).toBe(hostedDirect.useGetEnvironment);
  });

  test('useFlag matches hosted direct import', () => {
    expect(aliased.useFlag).toBe(hostedDirect.useFlag);
  });

  test('useFlagWithEphemDefault matches hosted direct import', () => {
    expect(aliased.useFlagWithEphemDefault).toBe(
      hostedDirect.useFlagWithEphemDefault,
    );
  });
});
