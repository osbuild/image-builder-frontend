import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { exportedUsersBP } from '../fixtures/data/exportBlueprintContents';
import { isHosted } from '../helpers/helpers';
import { ensureAuthenticated } from '../helpers/login';
import {
  fillInImageOutput,
  ibFrame,
  navigateToLandingPage,
} from '../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  exportBlueprint,
  fillInDetails,
  fillInImageOutputGuest,
  importBlueprint,
  registerLater,
  verifyExportedBlueprint,
} from '../helpers/wizardHelpers';

const validRSAKey =
  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCduw9WD1Tw1pat5x+FzMoZGd3QYDcxAPEvgy5shnSzCYsUsO/OTnG2OrN5UXlQ/6fM1Ass5b54ttbsjORxz90ckaKf7W1qufyiuRbDreEYRVabzFDZKeAI5C0pMPya7Fui4vlChsXAH3XuuiJqwtXFjVQbkyI/F9jkVEJZfqo9AAFWF8L33xLXEq/7WfgB9n8NBEL8QX7R8m/ATpKWyOXkWM/welXgGSeRN+dMllwHcX1VnRim0MMXo9JIp39Nl/x9+2fYO8agYyE73zoJj2oueEhBpO9Vam1EziNuEKseIbVzz0VrfZyMeSN5o1+LWYPbCVETE3jUAbioUDxA/faB test@example.com';
const validECDSAKey =
  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICKKKnEKnBMp5OGSW8R/zJJGNUcBV8LJ+VqnHB8uK9qx test@example.com';

test('Create a blueprint with Users customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + uuidv4();

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  // Navigate to IB landing page and get the frame
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to Users step', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Create initial valid users', async () => {
    await frame.getByRole('button', { name: 'Users' }).click();

    // Create admin user with correct password and wheel group
    await frame
      .getByRole('textbox', { name: 'blueprint user name' })
      .fill('admin1');
    await frame
      .getByRole('textbox', { name: 'blueprint user password' })
      .fill('AdminPass123');
    await frame.getByPlaceholder('Add user group').fill('wheel');
    await frame.getByPlaceholder('Add user group').press('Enter');

    // Verify admin checkbox is automatically checked due to wheel group
    await expect(
      frame.getByRole('checkbox', { name: 'Administrator' }),
    ).toBeChecked();

    // Verify password validation passes
    await expect(
      frame.getByText(
        'Password must be at least 6 characters long: success status;',
      ),
    ).toBeVisible();

    // Add second user with SSH key and custom group
    await frame.getByRole('button', { name: 'Add user', exact: true }).click();

    const usernameInputs = frame.getByRole('textbox', {
      name: 'blueprint user name',
    });
    await usernameInputs.nth(1).fill('sshuser');

    const sshInputs = frame.getByPlaceholder('Set SSH key');
    await sshInputs.nth(1).fill(validRSAKey);

    const groupInputs = frame.getByPlaceholder('Add user group');
    await groupInputs.nth(1).fill('developers');
    await groupInputs.nth(1).press('Enter');

    const adminCheckboxes = frame.getByRole('checkbox', {
      name: 'Administrator',
    });
    await expect(adminCheckboxes.nth(1)).not.toBeChecked();
  });

  await test.step('Test error scenarios', async () => {
    // These tests do the following:
    // 1. We test there are no error of specific type
    // 2. We add a value that is invalid
    // 3. We test that the error is visible
    await frame.getByRole('button', { name: 'Add user', exact: true }).click();
    await frame.getByRole('button', { name: 'Add user', exact: true }).click();
    await frame.getByRole('button', { name: 'Add user', exact: true }).click();

    const usernameInputs = frame.getByRole('textbox', {
      name: 'blueprint user name',
    });
    const passwordInputs = frame.getByRole('textbox', {
      name: 'blueprint user password',
    });
    const sshInputs = frame.getByPlaceholder('Set SSH key');
    const groupInputs = frame.getByPlaceholder('Add user group');

    // Test 1: Short password error
    await expect(
      frame.getByText(
        'Password must be at least 6 characters long: error status;',
      ),
    ).toBeHidden();
    await usernameInputs.nth(2).fill('testuser1');
    await passwordInputs.nth(2).fill('short');
    await expect(
      frame
        .getByText('Password must be at least 6 characters long: error status;')
        .first(),
    ).toBeVisible();

    // Test 2: Invalid SSH key error
    await expect(frame.getByText('Invalid SSH key;')).toBeHidden();
    await sshInputs.nth(2).fill('invalid-ssh-key');
    await expect(frame.getByText('Invalid SSH key')).toBeVisible();

    // Test 3: Duplicate username error
    await expect(
      frame.getByText('Username already exists').first(),
    ).toBeHidden();
    await usernameInputs.nth(3).fill('admin1');
    await expect(
      frame.getByText('Username already exists').first(),
    ).toBeVisible();

    // Test 4: Empty username with password filled
    await expect(
      frame.getByRole('heading', {
        name: 'Danger alert: All users need to have a username',
      }),
    ).toBeHidden();
    await usernameInputs.nth(4).fill('');
    await passwordInputs.nth(4).fill('password123');
    await expect(
      frame.getByRole('heading', {
        name: 'Danger alert: All users need to have a username',
      }),
    ).toBeVisible();

    // Test 5: Invalid group name with spaces
    await expect(
      frame.getByText('Expected format: <group-name>. Example: admin'),
    ).toBeHidden();
    await groupInputs.nth(4).fill('invalid group name with spaces');
    await groupInputs.nth(4).press('Enter');
    await expect(
      frame.getByText('Expected format: <group-name>. Example: admin'),
    ).toBeVisible();

    // Test 6: Duplicate group within same user
    await groupInputs.nth(4).fill('testgroup');
    await groupInputs.nth(4).press('Enter');
    await expect(frame.getByText('Group already exists.')).toBeHidden();
    await groupInputs.nth(4).fill('testgroup');
    await groupInputs.nth(4).press('Enter');
    await expect(frame.getByText('Group already exists.')).toBeVisible();

    // Test 7: Various invalid SSH key formats
    await expect(frame.getByText('Invalid SSH key')).toHaveCount(1);
    await sshInputs.nth(4).fill('not-an-ssh-key');
    await expect(frame.getByText('Invalid SSH key').nth(1)).toBeVisible();
    await expect(frame.getByText('Invalid SSH key')).toHaveCount(2);
    await sshInputs
      .nth(4)
      .fill('invalid-type AAAAB3NzaC1yc2EAAAADAQABAAABAQCtest');
    const invalidSshKey2 = frame.getByText('Invalid SSH key');
    await expect(invalidSshKey2).toHaveCount(2);
  });

  await test.step('Test keyboard navigation and accessibility', async () => {
    // Focus on the first user's fields for keyboard navigation testing
    const usernameInput = frame
      .getByRole('textbox', {
        name: 'blueprint user name',
      })
      .first();
    const passwordInput = frame
      .getByRole('textbox', {
        name: 'blueprint user password',
      })
      .first();
    const sshInput = frame.getByPlaceholder('Set SSH key').first();
    const groupInput = frame.getByPlaceholder('Add user group').first();

    // Tab through fields to test keyboard navigation
    await usernameInput.press('Tab');
    await expect(passwordInput).toBeFocused();

    await passwordInput.press('Tab');
    await expect(sshInput).toBeFocused();

    await sshInput.press('Tab');
    await page.keyboard.press('Tab');
    await expect(groupInput).toBeFocused();
  });

  await test.step('Clean up erroneous users', async () => {
    const removeButtons = frame.getByRole('button', {
      name: 'Remove user',
    });

    // Remove all the test users with errors (users 2, 3, 4, 5)
    // We'll remove them in reverse order to maintain indices
    for (let i = 4; i >= 2; i--) {
      await removeButtons.nth(i).click();
      const modalVisible = await frame
        .getByRole('button', { name: 'Remove user' })
        .isVisible();
      if (modalVisible) {
        await frame.getByRole('button', { name: 'Remove user' }).click();
      }
    }

    // Verify only the original 2 valid users remain
    const remainingUsers = await frame
      .getByRole('textbox', {
        name: 'blueprint user name',
      })
      .count();
    expect(remainingUsers).toBe(2);

    // Verify the remaining users are the correct ones
    const remainingUsernameInputs = frame.getByRole('textbox', {
      name: 'blueprint user name',
    });
    await expect(remainingUsernameInputs.nth(0)).toHaveValue('admin1');
    await expect(remainingUsernameInputs.nth(1)).toHaveValue('sshuser');
  });

  await test.step('Add final valid user and test wheel group behavior', async () => {
    await frame.getByRole('button', { name: 'Add user', exact: true }).click();

    const usernameInputs = frame.getByRole('textbox', {
      name: 'blueprint user name',
    });
    const passwordInputs = frame.getByRole('textbox', {
      name: 'blueprint user password',
    });
    const sshInputs = frame.getByPlaceholder('Set SSH key');
    const groupInputs = frame.getByPlaceholder('Add user group');
    const adminCheckboxes = frame.getByRole('checkbox', {
      name: 'Administrator',
    });

    // Add user with both password and SSH key
    await usernameInputs.nth(2).fill('poweruser');
    await passwordInputs.nth(2).fill('PowerUser123');
    await sshInputs.nth(2).fill(validECDSAKey);

    // Test wheel group auto-admin behavior
    await groupInputs.nth(2).fill('wheel');
    await groupInputs.nth(2).press('Enter');

    // Admin checkbox should be checked automatically
    await expect(adminCheckboxes.nth(2)).toBeChecked();

    // Try to uncheck admin - should remove wheel group
    await adminCheckboxes.nth(2).uncheck();
    await expect(frame.getByText('wheel').nth(1)).toBeHidden();

    // Re-add wheel group and verify it stays checked
    await groupInputs.nth(2).fill('wheel');
    await groupInputs.nth(2).press('Enter');
    await expect(adminCheckboxes.nth(2)).toBeChecked();
  });

  await test.step('Test user removal scenarios', async () => {
    // Test removing user with data (should show confirmation modal)
    const removeButtons = frame.getByRole('button', {
      name: 'Remove user',
    });
    await removeButtons.last().click();

    // Confirm removal in modal
    await expect(frame.getByText('Remove user poweruser?')).toBeVisible();
    await frame.getByRole('button', { name: 'Remove user' }).click();

    // Verify user is removed
    await expect(frame.getByText('poweruser')).toBeHidden();

    // Test removing empty user (should remove directly without modal)
    await frame.getByRole('button', { name: 'Add user', exact: true }).click();

    const initialUserCount = await removeButtons.count();
    await removeButtons.last().click();

    // Should remove directly without confirmation modal
    const finalUserCount = await removeButtons.count();
    expect(finalUserCount).toBe(initialUserCount - 1);
  });

  await test.step('Verify users in Review step', async () => {
    // Add user that has admin added the other way
    // We want to confirm, that the Review step shows the admin
    // correctly even after this workflow.
    await frame.getByRole('button', { name: 'Add user', exact: true }).click();
    await frame
      .getByRole('textbox', { name: 'blueprint user name' })
      .nth(2)
      .fill('admin2');
    await frame
      .getByRole('textbox', { name: 'blueprint user password' })
      .nth(2)
      .fill('AdminPass123');
    await frame.getByPlaceholder('Add user group').nth(2).fill('wheel');
    await frame.getByPlaceholder('Add user group').nth(2).press('Enter');

    // Verify admin checkbox is automatically checked due to wheel group
    await frame
      .getByRole('checkbox', { name: 'Administrator' })
      .nth(2)
      .isChecked();
    await expect(frame.getByText('wheel').nth(1)).toBeVisible(); // Group was added
    // Verify password validation passes
    await expect(
      frame
        .getByText(
          'Password must be at least 6 characters long: success status;',
        )
        .nth(1),
    ).toBeVisible();

    await frame.getByRole('button', { name: 'Review and finish' }).click();

    // Verify admin user details
    await expect(frame.getByText('admin1', { exact: true })).toBeVisible();
    await expect(frame.getByText('●●●●●●●●').first()).toBeVisible(); // Masked password
    await expect(frame.getByText('True').first()).toBeVisible(); // Admin status

    // Verify SSH user details
    await expect(frame.getByText('sshuser')).toBeVisible();
    await expect(frame.getByText('None').first()).toBeVisible(); // No password
    await expect(frame.getByText('False').first()).toBeVisible(); // Not admin

    // Verify admin user details
    await expect(frame.getByText('admin2', { exact: true })).toBeVisible();
    await expect(frame.getByText('●●●●●●●●').first()).toBeVisible(); // Masked password
    await expect(frame.getByText('True').first()).toBeVisible(); // Admin status
  });

  await test.step('Create and save blueprint', async () => {
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit blueprint and modify users', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByTestId('revisit-users').click();

    // Modify existing user
    const passwordInputs = frame.getByRole('textbox', {
      name: 'blueprint user password',
    });
    await passwordInputs.first().fill('NewAdminPass123');

    // Add new user
    await frame.getByRole('button', { name: 'Add user', exact: true }).click();
    const usernameInputs = frame.getByRole('textbox', {
      name: 'blueprint user name',
    });
    await usernameInputs.last().fill('newuser');

    const newPasswordInputs = frame.getByRole('textbox', {
      name: 'blueprint user password',
    });
    await newPasswordInputs.last().fill('NewUserPass123');

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  await test.step('Verify blueprint was saved correctly', async () => {
    // Navigate back to the blueprint to verify it was saved
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByTestId('revisit-users').click();

    // Verify all users are present and correct
    const usernameInputs = frame.getByRole('textbox', {
      name: 'blueprint user name',
    });

    await expect(usernameInputs.nth(0)).toHaveValue('admin1');
    await expect(usernameInputs.nth(1)).toHaveValue('sshuser');
    await expect(usernameInputs.nth(2)).toHaveValue('admin2');
    await expect(usernameInputs.nth(3)).toHaveValue('newuser');

    // Verify password was is not returned
    const passwordInputs = frame.getByRole('textbox', {
      name: 'blueprint user password',
    });
    await expect(passwordInputs.nth(0)).toHaveValue('');
    await expect(passwordInputs.nth(2)).toHaveValue('');
    await expect(passwordInputs.nth(3)).toHaveValue('');

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await frame
      .getByRole('button', { name: 'Save changes to blueprint' })
      .click();
  });

  let exportedBP = '';

  await test.step('Export BP', async () => {
    exportedBP = await exportBlueprint(page);
    cleanup.add(async () => {
      await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
    });
  });

  await test.step('Review exported BP', async (step) => {
    step.skip(
      isHosted(),
      'Only verify the contents of the exported blueprint in cockpit',
    );
    verifyExportedBlueprint(exportedBP, exportedUsersBP(blueprintName));
  });

  await test.step('Import blueprint', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Verify imported users', async () => {
    await fillInImageOutputGuest(frame);
    await frame.getByRole('button', { name: 'Users' }).click();

    // Verify users are preserved
    await expect(
      frame.getByRole('textbox', { name: 'blueprint user name' }).nth(0),
    ).toHaveValue('admin1');
    await expect(
      frame.getByRole('textbox', { name: 'blueprint user name' }).nth(1),
    ).toHaveValue('sshuser');
    await expect(
      frame.getByRole('textbox', { name: 'blueprint user name' }).nth(2),
    ).toHaveValue('admin2');
    await expect(
      frame.getByRole('textbox', { name: 'blueprint user name' }).nth(3),
    ).toHaveValue('newuser');

    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});
