import * as onprem from '../index.onprem';

describe('useGetEnvironment.onprem.ts — exports', () => {
  const expectedExports = [
    'useGetEnvironment',
    'useFlag',
    'useFlagWithEphemDefault',
  ] as const;

  test.each(expectedExports)('exports %s', (name) => {
    expect(onprem).toHaveProperty(name);
    expect((onprem as Record<string, unknown>)[name]).toBeDefined();
  });

  test('useGetEnvironment returns static values', () => {
    const env = onprem.useGetEnvironment();
    expect(env.isBeta()).toBe(false);
    expect(env.isProd()).toBe(true);
  });

  test('useFlag returns true for enabled flags', () => {
    expect(onprem.useFlag('image-builder.images-table-revamp.enabled')).toBe(
      true,
    );
  });

  test('useFlag returns false for unknown flags', () => {
    expect(onprem.useFlag('some-unknown-flag')).toBe(false);
  });

  test('useFlagWithEphemDefault returns false unconditionally', () => {
    expect(onprem.useFlagWithEphemDefault('any-flag')).toBe(false);
    expect(onprem.useFlagWithEphemDefault('any-flag', true)).toBe(false);
    expect(onprem.useFlagWithEphemDefault('any-flag', false)).toBe(false);
  });
});
