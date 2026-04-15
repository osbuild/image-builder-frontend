import { screen, within } from '@testing-library/react';

import { renderEditMode } from './wizardTestUtils';

import { mockBlueprintIds } from '../../fixtures/blueprints';

describe('EditImageWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should enable all navigation items in edit mode', async () => {
    const id = mockBlueprintIds['darkChocolate'];
    await renderEditMode(id);

    const heading = await screen.findByRole('heading', {
      name: /review image configuration/i,
    });

    const navigation = await screen.findByRole('navigation', {
      name: /wizard steps/i,
    });
    const baseNavItem = within(navigation).getByRole('button', {
      name: /base settings/i,
    });
    const contentNavItem = within(navigation).getByRole('button', {
      name: /repositories and packages/i,
    });
    const advancedNavItem = within(navigation).getByRole('button', {
      name: /advanced settings/i,
    });
    const reviewNavItem = within(navigation).getByRole('button', {
      name: /review/i,
    });

    // Assert that all validation items are enabled
    expect(heading).toBeInTheDocument();
    expect(baseNavItem).toBeEnabled();
    expect(contentNavItem).toBeEnabled();
    expect(advancedNavItem).toBeEnabled();
    expect(reviewNavItem).toBeEnabled();
  });
});
