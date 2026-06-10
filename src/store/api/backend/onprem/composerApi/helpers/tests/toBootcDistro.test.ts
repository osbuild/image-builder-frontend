import { describe, expect, it } from 'vitest';

import { ValidatedPodmanImage } from '../../../types';
import { toBootcDistro } from '../podman';

const makeImage = (
  overrides: Partial<ValidatedPodmanImage['Labels']> = {},
  names: string[] = ['registry.redhat.io/rhel10/rhel-bootc:10.0'],
  architecture = 'amd64',
): ValidatedPodmanImage => ({
  Id: 'sha256:abc123',
  Architecture: architecture,
  Labels: {
    version: '10',
    'redhat.id': 'rhel',
    ...overrides,
  },
  RepoTags: names,
});

describe('toBootcDistro', () => {
  it('maps a RHEL podman image to a bootc distro object', () => {
    const result = toBootcDistro(makeImage());

    expect(result).toEqual({
      arch: 'amd64',
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

  it('constructs the distro string from the version label for RHEL', () => {
    const result = toBootcDistro(makeImage({ version: '9' }));

    expect(result.distro).toBe('rhel-9');
    expect(result.name).toBe('Red Hat Enterprise Linux (RHEL) 9');
  });

  it('passes through architecture as-is', () => {
    const result = toBootcDistro(makeImage({}, undefined, 'arm64'));

    expect(result.arch).toBe('arm64');
  });

  it('always sets type to guest-image', () => {
    const result = toBootcDistro(makeImage());

    expect(result.type).toBe('guest-image');
  });

  it('produces fedora distro for a Fedora image', () => {
    const result = toBootcDistro(
      makeImage(
        {
          version: '42',
          'redhat.id': undefined,
        },
        ['quay.io/fedora/fedora-bootc:42'],
      ),
    );

    expect(result).toEqual({
      arch: 'amd64',
      distro: 'fedora-42',
      reference: 'quay.io/fedora/fedora-bootc:42',
      name: 'Fedora 42',
      type: 'guest-image',
    });
  });

  it('produces centos distro for a CentOS image', () => {
    const result = toBootcDistro(
      makeImage(
        {
          version: '10',
          'redhat.id': undefined,
        },
        ['quay.io/centos-bootc/centos-bootc:stream10'],
      ),
    );

    expect(result).toEqual({
      arch: 'amd64',
      distro: 'centos-10',
      reference: 'quay.io/centos-bootc/centos-bootc:stream10',
      name: 'CentOS Stream 10',
      type: 'guest-image',
    });
  });

  it('produces hummingbird distro for a Hummingbird image', () => {
    const result = toBootcDistro(
      makeImage(
        {
          version: '42',
          name: 'Fedora Hummingbird',
          'redhat.id': undefined,
        },
        ['quay.io/fedora/fedora-hummingbird:42'],
      ),
    );

    expect(result).toEqual({
      arch: 'amd64',
      distro: 'hummingbird',
      reference: 'quay.io/fedora/fedora-hummingbird:42',
      name: 'Fedora Hummingbird',
      type: 'guest-image',
    });
  });

  it('uses reference as name for an unknown image', () => {
    const result = toBootcDistro(
      makeImage(
        {
          version: '1.0',
          'redhat.id': undefined,
        },
        ['registry.example.com/my-custom-bootc:1.0'],
      ),
    );

    expect(result).toEqual({
      arch: 'amd64',
      distro: 'registry.example.com/my-custom-bootc:1.0',
      reference: 'registry.example.com/my-custom-bootc:1.0',
      name: 'registry.example.com/my-custom-bootc:1.0',
      type: 'guest-image',
    });
  });
});
