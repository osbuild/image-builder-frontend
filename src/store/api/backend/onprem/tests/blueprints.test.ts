import { describe, expect, it } from 'vitest';

import { prepareBlueprintForSave } from '@/store/api/backend/onprem/composerApi/blueprints';

import { createMinimalBlueprint } from './mocks/fixtures';

describe('prepareBlueprintForSave', () => {
  it('preserves distribution for package-mode blueprints', () => {
    const blueprint = createMinimalBlueprint({ distribution: 'rhel-9' });

    const result = prepareBlueprintForSave(blueprint);

    expect(result.distribution).toBe('rhel-9');
  });

  it('strips distribution for bootc blueprints', () => {
    const blueprint = createMinimalBlueprint({
      distribution: 'rhel-10',
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const result = prepareBlueprintForSave(blueprint);

    expect(result.distribution).toBeUndefined();
  });

  it('preserves all other fields when stripping distribution', () => {
    const blueprint = createMinimalBlueprint({
      name: 'my-bootc-blueprint',
      description: 'A bootc blueprint',
      distribution: 'rhel-10',
      bootc: { reference: 'quay.io/org/image:latest' },
      customizations: { packages: ['vim'] },
    });

    const result = prepareBlueprintForSave(blueprint);

    expect(result.name).toBe('my-bootc-blueprint');
    expect(result.description).toBe('A bootc blueprint');
    expect(result.bootc).toEqual({ reference: 'quay.io/org/image:latest' });
    expect(result.customizations).toEqual({ packages: ['vim'] });
    expect(result.distribution).toBeUndefined();
  });

  it('preserves all other fields for package-mode blueprints', () => {
    const blueprint = createMinimalBlueprint({
      name: 'my-package-blueprint',
      distribution: 'rhel-9',
      customizations: { hostname: 'test-host' },
    });

    const result = prepareBlueprintForSave(blueprint);

    expect(result.name).toBe('my-package-blueprint');
    expect(result.distribution).toBe('rhel-9');
    expect(result.customizations).toEqual({ hostname: 'test-host' });
  });
});
