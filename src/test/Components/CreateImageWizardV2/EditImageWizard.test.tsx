import { screen, within } from '@testing-library/react';

import { renderEditMode } from './wizardTestUtils';

import {
  mockBlueprintIds,
  mockBlueprintNames,
} from '../../fixtures/blueprints';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    auth: {
      getUser: () => {
        return {
          identity: {
            internal: {
              org_id: 5,
            },
          },
        };
      },
    },
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

describe('EditImageWizard', () => {
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
    const detailsNavItem = within(navigation).getByRole('button', {
      name: /details/i,
    });

    // Assert that all validation items are enabled
    expect(heading).toBeInTheDocument();
    expect(outputNavItem).toBeEnabled();
    expect(targetNavItem).toBeEnabled();
    expect(registerNavItem).toBeEnabled();
    expect(scapNavItem).toBeEnabled();
    expect(detailsNavItem).toBeEnabled();
  });
});
