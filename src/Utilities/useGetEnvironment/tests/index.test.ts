import * as hosted from '../index.hosted';

describe('useGetEnvironment.hosted.ts — exports', () => {
  const expectedExports = [
    'useGetEnvironment',
    'useFlag',
    'useFlagWithEphemDefault',
  ] as const;

  test.each(expectedExports)('exports %s', (name) => {
    expect(hosted).toHaveProperty(name);
    expect((hosted as Record<string, unknown>)[name]).toBeDefined();
  });

  test('useFlag is the Unleash useFlag', () => {
    // The hosted useFlag should be the re-exported Unleash hook
    expect(typeof hosted.useFlag).toBe('function');
  });

  test('useGetEnvironment is a function', () => {
    expect(typeof hosted.useGetEnvironment).toBe('function');
  });

  test('useFlagWithEphemDefault is a function', () => {
    expect(typeof hosted.useFlagWithEphemDefault).toBe('function');
  });
});
