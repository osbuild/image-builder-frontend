import { describe, expect, it } from 'vitest';

import { ValidatedPodmanImage } from '../../../types';
import { inferDistro } from '../inferDistro';

const makeImage = (
  labels: Partial<ValidatedPodmanImage['Labels']> = {},
  names: string[] = ['registry.example.com/some-image:latest'],
): ValidatedPodmanImage => ({
  Architecture: 'amd64',
  Labels: {
    ...labels,
  },
  Names: names,
});

describe('inferDistro', () => {
  describe('RHEL images', () => {
    it('returns rhel-${version} when redhat.id is present', () => {
      const image = makeImage({ 'redhat.id': 'rhel', version: '10' }, [
        'registry.redhat.io/rhel10/rhel-bootc:10.0',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'rhel-10',
        name: 'Red Hat Enterprise Linux (RHEL) 10',
      });
    });

    it('returns rhel-unknown when redhat.id is present but version is missing', () => {
      const image = makeImage({ 'redhat.id': 'rhel' }, [
        'registry.redhat.io/rhel10/rhel-bootc:latest',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'rhel-unknown',
        name: 'Red Hat Enterprise Linux (RHEL) unknown',
      });
    });

    it('RHEL wins over reference containing fedora', () => {
      const image = makeImage({ 'redhat.id': 'rhel', version: '10' }, [
        'registry.example.com/fedora-rhel-bootc:10',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'rhel-10',
        name: 'Red Hat Enterprise Linux (RHEL) 10',
      });
    });
  });

  describe('Fedora Hummingbird images', () => {
    it('returns hummingbird when reference contains hummingbird', () => {
      const image = makeImage({ name: 'Fedora Hummingbird', version: '42' }, [
        'quay.io/fedora/fedora-hummingbird:42',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'hummingbird',
        name: 'Fedora Hummingbird',
      });
    });

    it('hummingbird wins over generic Fedora', () => {
      const image = makeImage({ name: 'Fedora Linux', version: '42' }, [
        'quay.io/fedora/fedora-hummingbird:42',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'hummingbird',
        name: 'Fedora Hummingbird',
      });
    });
  });

  describe('Fedora images', () => {
    it('returns fedora-${version} when reference contains fedora', () => {
      const image = makeImage({ version: '42' }, [
        'quay.io/fedora/fedora-bootc:42',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'fedora-42',
        name: 'Fedora 42',
      });
    });

    it('returns fedora-${version} when label name contains fedora', () => {
      const image = makeImage({ name: 'Fedora Linux', version: '41' }, [
        'registry.example.com/custom-bootc:41',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'fedora-41',
        name: 'Fedora 41',
      });
    });

    it('returns fedora without version when version is missing', () => {
      const image = makeImage({ name: 'Fedora Linux' }, [
        'quay.io/fedora/fedora-bootc:latest',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'fedora',
        name: 'Fedora',
      });
    });
  });

  describe('CentOS Stream images', () => {
    it('returns centos-${version} when reference contains centos', () => {
      const image = makeImage({ version: '10' }, [
        'quay.io/centos-bootc/centos-bootc:stream10',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'centos-10',
        name: 'CentOS Stream 10',
      });
    });

    it('returns centos-${version} when label name contains centos', () => {
      const image = makeImage({ name: 'CentOS Stream', version: '9' }, [
        'registry.example.com/custom-bootc:9',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'centos-9',
        name: 'CentOS Stream 9',
      });
    });

    it('returns centos without version when version is missing', () => {
      const image = makeImage({ name: 'CentOS Stream' }, [
        'quay.io/centos-bootc/centos-bootc:latest',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'centos',
        name: 'CentOS Stream',
      });
    });
  });

  describe('unknown images', () => {
    it('falls back to image reference for unknown images', () => {
      const image = makeImage({ version: '1.0' }, [
        'registry.example.com/my-custom-bootc:1.0',
      ]);

      expect(inferDistro(image)).toEqual({
        distro: 'registry.example.com/my-custom-bootc:1.0',
        name: 'registry.example.com/my-custom-bootc:1.0',
      });
    });

    it('falls back to reference when no labels match any known distro', () => {
      const image = makeImage({}, ['localhost/my-image:latest']);

      expect(inferDistro(image)).toEqual({
        distro: 'localhost/my-image:latest',
        name: 'localhost/my-image:latest',
      });
    });
  });
});
