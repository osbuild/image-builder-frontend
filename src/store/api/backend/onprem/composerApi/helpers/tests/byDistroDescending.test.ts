import { describe, expect, it } from 'vitest';

import type { BootcDistributionItem } from '@/store/api/backend';

import { byDistroDescending } from '../podman';

const makeItem = (distro: string, name: string): BootcDistributionItem => ({
  distro,
  name,
  type: 'guest-image',
  arch: 'x86_64',
  reference: `localhost/${distro}:latest`,
});

describe('byDistroDescending', () => {
  it('sorts RHEL versions descending', () => {
    const items = [
      makeItem('rhel-9', 'RHEL 9'),
      makeItem('rhel-10.3', 'RHEL 10.3'),
      makeItem('rhel-10', 'RHEL 10'),
      makeItem('rhel-10.1', 'RHEL 10.1'),
    ];

    const sorted = [...items].sort(byDistroDescending);

    expect(sorted.map((i) => i.distro)).toEqual([
      'rhel-10.3',
      'rhel-10.1',
      'rhel-10',
      'rhel-9',
    ]);
  });

  it('places RHEL before non-RHEL', () => {
    const items = [
      makeItem('fedora-42', 'Fedora 42'),
      makeItem('rhel-9', 'RHEL 9'),
      makeItem('centos-10', 'CentOS Stream 10'),
    ];

    const sorted = [...items].sort(byDistroDescending);

    expect(sorted.map((i) => i.distro)).toEqual([
      'rhel-9',
      'centos-10',
      'fedora-42',
    ]);
  });

  it('sorts non-RHEL items alphabetically by name', () => {
    const items = [
      makeItem('fedora-42', 'Fedora 42'),
      makeItem('centos-10', 'CentOS Stream 10'),
      makeItem('unknown', 'Alpine'),
    ];

    const sorted = [...items].sort(byDistroDescending);

    expect(sorted.map((i) => i.name)).toEqual([
      'Alpine',
      'CentOS Stream 10',
      'Fedora 42',
    ]);
  });
});
