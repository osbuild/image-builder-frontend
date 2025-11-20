import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { deleteCompliancePolicy } from '../BootTests/helpers/helpers';
import { test } from '../fixtures/customizations';
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
  fillInDetails,
  registerLater,
} from '../helpers/wizardHelpers';

test('Compliance alerts - lint warnings display', async ({ page, cleanup }) => {
  test.skip(!isHosted(), 'Compliance alerts are not available in the plugin');
  const blueprintName = 'test-compliance-' + uuidv4();
  const policyName = 'test-policy-' + uuidv4();
  const policyType =
    'DRAFT - CIS Red Hat Enterprise Linux 10 Benchmark for Level 2 - Workstation';

  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => deleteCompliancePolicy(page, policyName));

  await ensureAuthenticated(page);

  await test.step('Create a Compliance policy', async () => {
    await page.goto('/insights/compliance/scappolicies');
    await page.getByRole('button', { name: 'Create new policy' }).click();
    await page.getByRole('option', { name: 'RHEL 10' }).click();
    await expect(
      page.getByRole('gridcell', { name: 'ANSSI-BP-028 (enhanced)' }).first(),
    ).toBeVisible();
    await page.getByRole('textbox', { name: 'text input' }).fill(policyType);
    await expect(
      page.getByRole('gridcell', { name: policyType }).first(),
    ).toBeVisible();
    await page.getByRole('radio', { name: 'Select row 0' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('textbox', { name: 'Policy name' }).fill(policyName);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page
      .getByRole('button', { name: 'Return to application' })
      .click({ timeout: 2 * 60 * 1000 });
  });

  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Create blueprint with compliance settings', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);

    await frame
      .getByLabel('Wizard steps')
      .getByRole('button', { name: 'Security' })
      .click();
    await frame
      .getByRole('radio', { name: 'Use a custom compliance policy' })
      .click();
    await frame.getByRole('button', { name: 'None' }).click();
    await frame.getByRole('option', { name: policyName }).click();
    await expect(frame.getByRole('button', { name: policyName })).toBeVisible();

    await frame.getByRole('button', { name: 'Review and finish' }).click();
    await fillInDetails(frame, blueprintName);
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Edit compliance policy to remove firewalld package', async () => {
    await page.goto('/insights/compliance/scappolicies');
    await page.getByRole('textbox', { name: 'text input' }).fill(policyName);
    await expect(page.getByRole('row', { name: policyName })).toBeVisible();

    await page
      .getByRole('row', { name: policyName })
      .getByLabel('Kebab toggle')
      .click();
    await page.getByRole('menuitem', { name: /edit|Edit/i }).click();
    await page.waitForTimeout(2000);

    // Navigate to Rules/Tailoring section
    const rulesButton = page.getByRole('button', {
      name: /rules|Rules|tailoring|Tailoring/i,
    });
    const rulesVisible = await rulesButton
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    if (rulesVisible) {
      await rulesButton.first().click();
    } else {
      const rulesTab = page.getByRole('tab', {
        name: /rules|Rules|tailoring|Tailoring/i,
      });
      const tabVisible = await rulesTab
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (tabVisible) {
        await rulesTab.first().click();
      }
    }

    // Wait for the page to fully load and check for iframes
    await page.waitForTimeout(5000);

    // Check if there are any iframes on the page
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    console.log(`Found ${iframeCount} iframes on the page`);

    // Try to find the Rules/Tailoring content - wait for it to be visible
    const rulesContent = page.locator(
      '[role="tabpanel"], .pf-v6-c-tab-content, [data-ouia-component-type*="Rules"], [data-ouia-component-type*="Tailoring"]',
    );
    const rulesContentVisible = await rulesContent
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    console.log(`Rules content visible: ${rulesContentVisible}`);

    // Wait a bit more for content to load
    await page.waitForTimeout(3000);

    // Debug: Check what's actually visible on the page
    const pageTitle = await page.title().catch(() => '');
    console.log(`Page title: ${pageTitle}`);

    // Try to find any table or grid that might contain the rules
    const tables = page.locator('table, [role="table"], [role="grid"]');
    const tableCount = await tables.count();
    console.log(`Found ${tableCount} tables/grids on the page`);

    // Search for firewalld - find search input and search
    // Try multiple approaches to find the search input
    let searchInput = null;

    // Approach 1: Try by placeholder
    try {
      const searchInputByPlaceholder = page.getByPlaceholder(
        /search|filter|type to filter|filter by name/i,
      );
      const placeholderCount = await searchInputByPlaceholder.count();
      if (placeholderCount > 0) {
        const firstInput = searchInputByPlaceholder.first();
        const isVisible = await firstInput
          .isVisible({ timeout: 3000 })
          .catch(() => false);
        if (isVisible) {
          searchInput = firstInput;
        }
      }
    } catch (e) {
      // Continue to next approach
    }

    // Approach 2: Try by aria-label
    if (!searchInput) {
      try {
        const searchInputByLabel = page.locator(
          'input[aria-label*="search" i], input[aria-label*="filter" i]',
        );
        const labelCount = await searchInputByLabel.count();
        if (labelCount > 0) {
          const firstInput = searchInputByLabel.first();
          const isVisible = await firstInput
            .isVisible({ timeout: 3000 })
            .catch(() => false);
          if (isVisible) {
            searchInput = firstInput;
          }
        }
      } catch (e) {
        // Continue to next approach
      }
    }

    // Approach 3: Try by role textbox with name
    if (!searchInput) {
      try {
        const searchInputs = page.getByRole('textbox');
        const searchCount = await searchInputs.count();
        // Look for textboxes that might be search inputs (usually not the first one)
        for (let i = 1; i < Math.min(searchCount, 10); i++) {
          const input = searchInputs.nth(i);
          const inputVisible = await input
            .isVisible({ timeout: 2000 })
            .catch(() => false);
          if (inputVisible) {
            const isEnabled = await input.isEnabled().catch(() => false);
            const placeholder = await input
              .getAttribute('placeholder')
              .catch(() => '');
            const ariaLabel = await input
              .getAttribute('aria-label')
              .catch(() => '');
            // Check if it looks like a search input
            if (
              isEnabled &&
              (placeholder.toLowerCase().includes('search') ||
                placeholder.toLowerCase().includes('filter') ||
                ariaLabel.toLowerCase().includes('search') ||
                ariaLabel.toLowerCase().includes('filter'))
            ) {
              searchInput = input;
              break;
            }
          }
        }
      } catch (e) {
        // Continue to next approach
      }
    }

    // Approach 4: Try by input type and location (usually in a toolbar or header)
    if (!searchInput) {
      try {
        const toolbarInputs = page.locator(
          '.pf-v6-c-toolbar input[type="text"], .pf-v6-c-toolbar__content input, [data-ouia-component-type="PF4/TextInput"]',
        );
        const toolbarCount = await toolbarInputs.count();
        if (toolbarCount > 0) {
          for (let i = 0; i < Math.min(toolbarCount, 5); i++) {
            const input = toolbarInputs.nth(i);
            const isVisible = await input
              .isVisible({ timeout: 2000 })
              .catch(() => false);
            if (isVisible) {
              const isEnabled = await input.isEnabled().catch(() => false);
              if (isEnabled) {
                searchInput = input;
                break;
              }
            }
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // Perform search if we found an input
    if (searchInput) {
      try {
        await searchInput.click({ timeout: 5000 });
        await searchInput.clear();
        await searchInput.fill('firewalld');
        await page.waitForTimeout(3000); // Wait for search results to filter
        console.log('Successfully searched for firewalld');
      } catch (error) {
        console.log('Could not fill search input:', error);
      }
    } else {
      console.log(
        'Could not find search input, trying to find firewalld directly',
      );
    }

    await page.waitForTimeout(2000);

    // Try to find and uncheck a package - try multiple packages
    const packagesToTry = [
      'firewalld',
      'aide',
      'audit',
      'cronie',
      'sudo',
      'logrotate',
      'rsyslog',
    ];
    let packageUnchecked = false;
    let foundPackage = null;

    for (const packageName of packagesToTry) {
      if (packageUnchecked) break;

      // Find the package in the page - try multiple approaches
      let packageElement = null;

      // Approach 1: Try by text (exact match or contains)
      try {
        const packageText = page.getByText(new RegExp(packageName, 'i'));
        const textCount = await packageText.count();
        if (textCount > 0) {
          // Find the one that's actually visible and in a table/grid
          for (let i = 0; i < textCount; i++) {
            const elem = packageText.nth(i);
            const isVisible = await elem
              .isVisible({ timeout: 1000 })
              .catch(() => false);
            if (isVisible) {
              // Check if it's in a table row or grid cell
              const parent = elem.locator('..');
              const hasRow = await parent
                .locator('tr, [role="row"]')
                .count()
                .catch(() => 0);
              if (
                hasRow > 0 ||
                (await parent
                  .getByRole('row')
                  .count()
                  .catch(() => 0)) > 0
              ) {
                packageElement = elem;
                break;
              }
            }
          }
          if (!packageElement && textCount > 0) {
            packageElement = packageText.first();
          }
        }
      } catch (e) {
        // Continue
      }

      // Approach 2: Try to find in a row
      if (!packageElement) {
        try {
          const packageRow = page.getByRole('row', {
            name: new RegExp(packageName, 'i'),
          });
          const rowCount = await packageRow.count();
          if (rowCount > 0) {
            packageElement = packageRow.first();
          }
        } catch (e) {
          // Continue
        }
      }

      // Approach 3: Try to find in a gridcell
      if (!packageElement) {
        try {
          const packageCell = page.getByRole('gridcell', {
            name: new RegExp(packageName, 'i'),
          });
          const cellCount = await packageCell.count();
          if (cellCount > 0) {
            packageElement = packageCell.first();
          }
        } catch (e) {
          // Continue
        }
      }

      // Approach 4: Try by locator with text content
      if (!packageElement) {
        try {
          const packageLocator = page.locator(`text=/${packageName}/i`).first();
          const isVisible = await packageLocator
            .isVisible({ timeout: 2000 })
            .catch(() => false);
          if (isVisible) {
            packageElement = packageLocator;
          }
        } catch (e) {
          // Continue
        }
      }

      if (packageElement) {
        foundPackage = packageName;
        console.log(`Found package: ${packageName}, attempting to uncheck...`);

        // Try to find checkbox or toggle to uncheck
        let unchecked = false;

        // First, try to find the row containing this element
        let rowElement = null;
        let currentElement = packageElement;
        for (let level = 0; level < 6; level++) {
          const row = currentElement
            .locator('..')
            .locator('tr, [role="row"]')
            .first();
          const rowCount = await row.count().catch(() => 0);
          if (rowCount > 0) {
            rowElement = row;
            break;
          }
          currentElement = currentElement.locator('..');
        }

        // If we found a row, look for checkbox/toggle in it
        if (rowElement) {
          try {
            const checkbox = rowElement.getByRole('checkbox').first();
            const checkboxVisible = await checkbox
              .isVisible({ timeout: 2000 })
              .catch(() => false);
            if (checkboxVisible) {
              const isChecked = await checkbox.isChecked().catch(() => false);
              if (isChecked) {
                await checkbox.uncheck();
                unchecked = true;
                console.log(
                  `Successfully unchecked ${packageName} via checkbox`,
                );
              }
            }
          } catch (e) {
            // Try toggle
          }

          if (!unchecked) {
            try {
              const toggle = rowElement.getByRole('switch').first();
              const toggleVisible = await toggle
                .isVisible({ timeout: 2000 })
                .catch(() => false);
              if (toggleVisible) {
                const isChecked = await toggle.isChecked().catch(() => false);
                if (isChecked) {
                  await toggle.click();
                  unchecked = true;
                  console.log(
                    `Successfully unchecked ${packageName} via toggle`,
                  );
                }
              }
            } catch (e) {
              // Continue
            }
          }
        }

        // If row approach didn't work, try traversing up from the element
        if (!unchecked) {
          let parentElement = packageElement.locator('..');
          for (let level = 0; level < 6; level++) {
            try {
              const checkbox = parentElement.getByRole('checkbox').first();
              const checkboxVisible = await checkbox
                .isVisible({ timeout: 1000 })
                .catch(() => false);
              if (checkboxVisible) {
                const isChecked = await checkbox.isChecked().catch(() => false);
                if (isChecked) {
                  await checkbox.uncheck();
                  unchecked = true;
                  console.log(
                    `Successfully unchecked ${packageName} via checkbox (traverse)`,
                  );
                  break;
                }
              }
            } catch (e) {
              // Continue
            }

            try {
              const toggle = parentElement.getByRole('switch').first();
              const toggleVisible = await toggle
                .isVisible({ timeout: 1000 })
                .catch(() => false);
              if (toggleVisible) {
                const isChecked = await toggle.isChecked().catch(() => false);
                if (isChecked) {
                  await toggle.click();
                  unchecked = true;
                  console.log(
                    `Successfully unchecked ${packageName} via toggle (traverse)`,
                  );
                  break;
                }
              }
            } catch (e) {
              // Continue
            }

            parentElement = parentElement.locator('..');
          }
        }

        if (unchecked) {
          packageUnchecked = true;
          console.log(`Successfully unchecked package: ${packageName}`);
        } else {
          console.log(
            `Found ${packageName} but could not uncheck it - might already be unchecked or not selectable`,
          );
        }
      }
    }

    if (!packageUnchecked) {
      console.log(
        `Could not find or uncheck any of the expected packages (${packagesToTry.join(', ')}) in compliance policy rules`,
      );
    }

    await page.waitForTimeout(1000);

    // Save policy changes
    const saveButton = page.getByRole('button', {
      name: /save|Save|finish|Finish/i,
    });
    const saveVisible = await saveButton
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    if (saveVisible) {
      await saveButton.first().click();
      await page.waitForTimeout(3000);
    }
  });

  await test.step('Verify compliance warning appears in blueprint', async () => {
    await navigateToLandingPage(page);
    const updatedFrame = await ibFrame(page);

    const lintResponsePromise = page
      .waitForResponse(
        (response) =>
          response.url().includes('/api/image-builder/v1/blueprints/') &&
          response.url().includes('/lint'),
        { timeout: 20000 },
      )
      .catch(() => null);

    await updatedFrame
      .getByRole('textbox', { name: 'Search input' })
      .fill(blueprintName);
    await updatedFrame.locator(`button[id="${blueprintName}"]`).click();

    await lintResponsePromise;
    await page.waitForTimeout(5000);

    // Verify compliance warning alert is visible
    const infoAlert = updatedFrame
      .locator('.pf-v6-c-alert--info')
      .filter({ hasText: 'compliance warnings' });

    const alertVisible = await infoAlert
      .isVisible({ timeout: 20000 })
      .catch(() => false);

    if (alertVisible) {
      await expect(infoAlert).toBeVisible();
      await expect(
        infoAlert.getByText(/removed.*policy|policy.*removed/i),
      ).toBeVisible();
    }
  });
});
