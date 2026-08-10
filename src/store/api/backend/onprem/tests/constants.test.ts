import { afterEach, describe, expect, it, vi } from 'vitest';

// The registry constants are evaluated at module load, mirroring the
// webpack DefinePlugin substitution in the cockpit build, so the
// DEV_REGISTRY override is tested through a fresh module import.
const importConstants = async () => {
  vi.resetModules();
  return await import('../constants');
};

describe('IMAGE_REGISTRY', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to the official registry path', async () => {
    const { IMAGE_REGISTRY, IMAGE_REGISTRY_HOST, KNOWN_IMAGES } =
      await importConstants();

    expect(IMAGE_REGISTRY).toBe('registry.redhat.io/rhel10');
    expect(IMAGE_REGISTRY_HOST).toBe('registry.redhat.io');
    expect(KNOWN_IMAGES[0].reference).toBe(
      'registry.redhat.io/rhel10/rhel-bootc-kvm:latest',
    );
  });

  it('uses DEV_REGISTRY when set, ignoring trailing slashes', async () => {
    vi.stubEnv('DEV_REGISTRY', 'registry.stage.redhat.io/rhel10/');

    const { IMAGE_REGISTRY, IMAGE_REGISTRY_HOST, KNOWN_IMAGES } =
      await importConstants();

    expect(IMAGE_REGISTRY).toBe('registry.stage.redhat.io/rhel10');
    expect(IMAGE_REGISTRY_HOST).toBe('registry.stage.redhat.io');
    expect(KNOWN_IMAGES[0].reference).toBe(
      'registry.stage.redhat.io/rhel10/rhel-bootc-kvm:latest',
    );
  });

  it('keeps the port in the registry host', async () => {
    vi.stubEnv('DEV_REGISTRY', 'registry.example.com:5000/myorg');

    const { IMAGE_REGISTRY_HOST } = await importConstants();

    expect(IMAGE_REGISTRY_HOST).toBe('registry.example.com:5000');
  });
});
