import { screen, within } from '@testing-library/react';

import { renderEditMode } from './wizardTestUtils';

import {
  mockBlueprintIds,
  mockBlueprintNames,
} from '../../fixtures/blueprints';

describe('EditImageWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should enable all navigation items in edit mode', async () => {
    const id = mockBlueprintIds['darkChocolate'];
    const name = mockBlueprintNames['darkChocolate'];
    await renderEditMode(id);

    const heading = await screen.findByRole('heading', {
      name: new RegExp(`review ${name}`, 'i'),
    });

    const navigation = await screen.findByRole('navigation', {
      name: /wizard steps/i,
    });
    const outputNavItem = within(navigation).getByRole('button', {
      name: /image output/i,
    });
    const targetNavItem = within(navigation).getByRole('button', {
      name: /target environment/i,
    });
    const registerNavItem = within(navigation).getByRole('button', {
      name: /register/i,
    });
    const scapNavItem = within(navigation).getByRole('button', {
      name: /openscap/i,
    });
    const fscNavItem = within(navigation).getByRole('button', {
      name: /openscap/i,
    });
    const snapshotsNavItem = within(navigation).getByRole('button', {
      name: /openscap/i,
    });
    const repositoriesNavItem = within(navigation).getByRole('button', {
      name: /openscap/i,
    });
    const packagesNavItem = within(navigation).getByRole('button', {
      name: /openscap/i,
    });
    const firstbootNavItem = within(navigation).getByRole('button', {
      name: /openscap/i,
    });
    const detailsNavItem = within(navigation).getByRole('button', {
      name: /details/i,
    });

    // Assert that all validation items are enabled
    expect(heading).toBeInTheDocument();
    expect(outputNavItem).toBeEnabled();
    expect(targetNavItem).toBeEnabled();
    expect(registerNavItem).toBeEnabled();
    expect(scapNavItem).toBeEnabled();
    expect(fscNavItem).toBeEnabled();
    expect(snapshotsNavItem).toBeEnabled();
    expect(repositoriesNavItem).toBeEnabled();
    expect(packagesNavItem).toBeEnabled();
    expect(firstbootNavItem).toBeEnabled();
    expect(detailsNavItem).toBeEnabled();
  });
});
