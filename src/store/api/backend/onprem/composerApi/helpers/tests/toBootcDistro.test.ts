import { describe, expect, it } from 'vitest';

import { ValidatedPodmanImage } from '../../../types';
import { toBootcDistro } from '../podmanImages';

const makeImage = (
  overrides: Partial<ValidatedPodmanImage['Labels']> = {},
  names: string[] = ['registry.redhat.io/rhel10/rhel-bootc:10.0'],
): ValidatedPodmanImage => ({
  Labels: {
    architecture: 'x86_64',
    version: '10',
    ...overrides,
  },
  Names: names,
});

describe('toBootcDistro', () => {
  it('maps a podman image to a bootc distro object', () => {
    const result = toBootcDistro(makeImage());

    expect(result).toEqual({
      arch: 'x86_64',
      distro: 'rhel-10',
      reference: 'registry.redhat.io/rhel10/rhel-bootc:10.0',
      name: 'Red Hat Enterprise Linux (RHEL) 10',
      type: 'guest-image',
    });
  });

  it('uses the first entry from Names as the reference', () => {
    const result = toBootcDistro(
      makeImage({}, [
        'registry.redhat.io/rhel9/rhel-bootc:9.6',
        'some-other-name',
      ]),
    );

    expect(result.reference).toBe('registry.redhat.io/rhel9/rhel-bootc:9.6');
  });

  it('constructs the distro string from the version label', () => {
    const result = toBootcDistro(makeImage({ version: '9' }));

    expect(result.distro).toBe('rhel-9');
    expect(result.name).toBe('Red Hat Enterprise Linux (RHEL) 9');
  });

  it('converts the architecture to a string', () => {
    const result = toBootcDistro(makeImage({ architecture: 'aarch64' }));

    expect(result.arch).toBe('aarch64');
  });

  it('always sets type to guest-image', () => {
    const result = toBootcDistro(makeImage());

    expect(result.type).toBe('guest-image');
  });
});
