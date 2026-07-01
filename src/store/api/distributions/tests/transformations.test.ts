import { ArchitectureInfo } from '@/store/api/backend';
import {
  extractImageTypes,
  normalizeOptions,
  resolveImageTypeKey,
} from '@/store/api/distributions';

describe('normalizeOptions', () => {
  it('should return undefined when options is undefined', () => {
    expect(normalizeOptions(undefined)).toBeUndefined();
  });

  it('should map backend options to frontend names', () => {
    const result = normalizeOptions([
      'packages',
      'customizations.firewall',
      'customizations.user',
      'customizations.rhsm',
      'customizations.files',
    ]);

    expect(result).toEqual([
      'packages',
      'firewall',
      'users',
      'registration',
      'firstBoot',
      'aap',
    ]);
  });

  it('should drop unknown backend options', () => {
    const result = normalizeOptions([
      'customizations.firewall',
      'distro',
      'modules',
    ]);

    expect(result).toEqual(['firewall']);
  });

  it('should map kernel sub-keys and deduplicate', () => {
    const result = normalizeOptions([
      'customizations.kernel.name',
      'customizations.kernel.append',
    ]);

    expect(result).toEqual(['kernel']);
  });
});

describe('resolveImageTypeKey', () => {
  it('should return key as-is when already a known frontend type', () => {
    expect(resolveImageTypeKey('aws', undefined)).toBe('aws');
  });

  it('should resolve via aliases when key is unknown', () => {
    expect(resolveImageTypeKey('qcow2', ['guest-image'])).toBe('guest-image');
  });

  it('should fall back to original key when nothing matches', () => {
    expect(resolveImageTypeKey('unknown', ['also-unknown'])).toBe('unknown');
  });
});

describe('extractImageTypes', () => {
  it('should return empty object when architectures is undefined', () => {
    expect(
      extractImageTypes({ architectures: undefined, arch: 'x86_64' }),
    ).toEqual({});
  });

  it('should re-key and normalize a realistic backend response', () => {
    const architectures: Record<string, ArchitectureInfo> = {
      x86_64: {
        name: 'x86_64',
        image_types: {
          qcow2: {
            name: 'qcow2',
            aliases: ['guest-image'],
            supported_blueprint_options: [
              'packages',
              'customizations.filesystem',
            ],
          },
          'image-installer': {
            name: 'image-installer',
            aliases: [],
            supported_blueprint_options: ['packages', 'customizations.locale'],
          },
        },
      },
    };

    const result = extractImageTypes({ architectures, arch: 'x86_64' });

    expect(Object.keys(result)).toEqual(['guest-image', 'image-installer']);
    expect(result['guest-image'].supported_blueprint_options).toEqual([
      'packages',
      'filesystem',
    ]);
    expect(result['image-installer'].supported_blueprint_options).toEqual([
      'packages',
      'locale',
    ]);
  });
});
