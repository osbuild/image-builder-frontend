import type { BootcDistributionItem } from '@/store/api/backend';

import { groupByName } from '../components/ImageSourceSelect/OnPrem/groupByName';

const makeItem = (
  name: string,
  reference: string,
  type = 'guest-image',
): BootcDistributionItem => ({
  distro: 'rhel-10',
  name,
  type,
  arch: 'x86_64',
  reference,
});

describe('groupByName', () => {
  test('returns empty array for empty input', () => {
    expect(groupByName([])).toEqual([]);
  });

  test('creates one group per unique name', () => {
    const items = [makeItem('RHEL 10', 'ref-a'), makeItem('RHEL 9', 'ref-b')];

    const result = groupByName(items);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'RHEL 10',
      items: [items[0]],
    });
    expect(result[1]).toEqual({
      name: 'RHEL 9',
      items: [items[1]],
    });
  });

  test('groups items with the same name together', () => {
    const items = [
      makeItem('RHEL 10', 'ref-kvm', 'guest-image'),
      makeItem('RHEL 10', 'ref-aws', 'aws'),
      makeItem('RHEL 9', 'ref-9'),
    ];

    const result = groupByName(items);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('RHEL 10');
    expect(result[0].items).toHaveLength(2);
    expect(result[0].items[0].reference).toBe('ref-kvm');
    expect(result[0].items[1].reference).toBe('ref-aws');
    expect(result[1].name).toBe('RHEL 9');
    expect(result[1].items).toHaveLength(1);
  });

  test('preserves insertion order of groups', () => {
    const items = [
      makeItem('Fedora 44', 'ref-f'),
      makeItem('RHEL 10', 'ref-r'),
      makeItem('CentOS 10', 'ref-c'),
    ];

    const result = groupByName(items);

    expect(result.map((g) => g.name)).toEqual([
      'Fedora 44',
      'RHEL 10',
      'CentOS 10',
    ]);
  });

  test('preserves item order within each group', () => {
    const items = [
      makeItem('RHEL 10', 'ref-first', 'guest-image'),
      makeItem('RHEL 10', 'ref-second', 'aws'),
      makeItem('RHEL 10', 'ref-third', 'vsphere'),
    ];

    const result = groupByName(items);

    expect(result).toHaveLength(1);
    expect(result[0].items.map((i) => i.reference)).toEqual([
      'ref-first',
      'ref-second',
      'ref-third',
    ]);
  });

  test('handles single item input', () => {
    const items = [makeItem('RHEL 10', 'ref-only')];

    const result = groupByName(items);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'RHEL 10',
      items: [items[0]],
    });
  });
});
