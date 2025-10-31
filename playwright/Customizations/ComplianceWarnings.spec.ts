import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../fixtures/customizations';
import { ensureAuthenticated } from '../helpers/login';
import { ibFrame, navigateToLandingPage } from '../helpers/navHelpers';

type State =
  | 'A_only'
  | 'A_and_B'
  | 'audit_missing'
  | 'audit_present'
  | 'audit_missing_again';

const mkBlueprintListResponse = (
  blueprintId: string,
  blueprintName: string,
) => ({
  meta: { count: 1 },
  links: { first: '', last: '' },
  data: [
    {
      id: blueprintId,
      version: 1,
      name: blueprintName,
      description: 'Compliance test blueprint',
      last_modified_at: new Date().toISOString(),
    },
  ],
});

const mkBlueprintDetails = (
  blueprintId: string,
  blueprintName: string,
  state: State,
) => {
  const distribution = 'rhel-9';
  const image_requests: never[] = [];

  if (state === 'A_only') {
    return {
      id: blueprintId,
      name: blueprintName,
      description: 'Compliance test blueprint',
      distribution,
      image_requests,
      customizations: { packages: [] },
      lint: {
        errors: [
          {
            name: 'compliance',
            description:
              'Compliance: package aide required by policy is not present',
          },
        ],
      },
    };
  }

  if (state === 'A_and_B') {
    return {
      id: blueprintId,
      name: blueprintName,
      description: 'Compliance test blueprint',
      distribution,
      image_requests,
      customizations: { packages: [] },
      lint: {
        errors: [
          {
            name: 'compliance',
            description:
              'Compliance: package audit required by policy is not present',
          },
          {
            name: 'compliance',
            description:
              'Compliance: package aide required by policy is not present',
          },
        ],
      },
    };
  }

  if (state === 'audit_missing') {
    return {
      id: blueprintId,
      name: blueprintName,
      description: 'Compliance test blueprint',
      distribution,
      image_requests,
      customizations: { packages: [] },
      lint: {
        errors: [
          {
            name: 'compliance',
            description:
              'Compliance: package audit required by policy is not present',
          },
        ],
      },
    };
  }

  if (state === 'audit_present') {
    return {
      id: blueprintId,
      name: blueprintName,
      description: 'Compliance test blueprint',
      distribution,
      image_requests,
      customizations: { packages: ['audit'] },
      lint: { errors: [] },
    };
  }

  return {
    id: blueprintId,
    name: blueprintName,
    description: 'Compliance test blueprint',
    distribution,
    image_requests,
    customizations: { packages: [] },
    lint: {
      errors: [
        {
          name: 'compliance',
          description:
            'Compliance: package audit required by policy is not present',
        },
      ],
    },
  };
};

const mkBlueprintComposes = (distribution = 'rhel-9') => ({
  meta: { count: 1 },
  links: { first: '', last: '' },
  data: [
    {
      id: uuidv4(),
      request: {
        distribution,
        image_requests: [],
      },
      created_at: new Date().toISOString(),
      blueprint_id: uuidv4(),
      blueprint_version: 1,
    },
  ],
});

test.describe('Compliance warnings ignore flow', () => {
  // Skip entire suite unless explicitly enabled with ENABLE_COMPLIANCE_IGNORE_FIX=1
  const enableSuite = process.env.ENABLE_COMPLIANCE_IGNORE_FIX === '1';
  test.skip(
    !enableSuite,
    'Skipped until compliance ignore fix is merged (set ENABLE_COMPLIANCE_IGNORE_FIX=1 to run)',
  );
  test('New requirement appears after ignoring previous warnings', async ({
    page,
  }) => {
    const blueprintId = uuidv4();
    const blueprintName = 'test-' + blueprintId;

    let state: State = 'A_only';

    await page.route(/\/?blueprints(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        json: mkBlueprintListResponse(blueprintId, blueprintName),
      });
    });

    await page.route(/\/?blueprints\/[\w-]+(\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.match(/\/blueprints\/$/)) {
        return route.fallback();
      }
      await route.fulfill({
        status: 200,
        json: mkBlueprintDetails(blueprintId, blueprintName, state),
      });
    });

    await page.route(
      /\/?blueprints\/[\w-]+\/composes(\?.*)?$/,
      async (route) => {
        await route.fulfill({ status: 200, json: mkBlueprintComposes() });
      },
    );

    await test.step('Authenticate and open Image Builder', async () => {
      await ensureAuthenticated(page);
      await navigateToLandingPage(page);
    });
    const frame = await ibFrame(page);

    await test.step('Select the mocked blueprint', async () => {
      await frame
        .getByRole('textbox', { name: 'Search input' })
        .fill(blueprintName);
      await frame.locator(`button[id="${blueprintName}"]`).click();
    });

    await expect(
      frame.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
    await expect(
      frame.getByText('aide required by policy is not present'),
    ).toBeVisible();

    await test.step('Ignore warnings', async () => {
      await frame.locator('#blueprint_ignore_warnings').click();
    });

    state = 'A_and_B';

    await navigateToLandingPage(page);
    const frame2 = await ibFrame(page);
    await test.step('Re-enter the blueprint to refetch details', async () => {
      await frame2
        .getByRole('textbox', { name: 'Search input' })
        .fill(blueprintName);
      await frame2.locator(`button[id="${blueprintName}"]`).click();
    });

    await expect(
      frame2.getByText('audit required by policy is not present'),
    ).toBeVisible();
    await expect(
      frame2.getByText('aide required by policy is not present'),
    ).toHaveCount(0);

    await page.unroute(/\/?blueprints(\?.*)?$/);
    await page.unroute(/\/?blueprints\/[\w-]+(\?.*)?$/);
    await page.unroute(/\/?blueprints\/[\w-]+\/composes(\?.*)?$/);
  });

  test('Warning reappears after add → remove package cycle', async ({
    page,
  }) => {
    const blueprintId = uuidv4();
    const blueprintName = 'test-' + blueprintId;

    let state: State = 'audit_missing';

    await page.route(/\/?blueprints(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        json: mkBlueprintListResponse(blueprintId, blueprintName),
      });
    });

    await page.route(/\/?blueprints\/[\w-]+(\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.match(/\/blueprints\/$/)) {
        return route.fallback();
      }
      await route.fulfill({
        status: 200,
        json: mkBlueprintDetails(blueprintId, blueprintName, state),
      });
    });

    await page.route(
      /\/?blueprints\/[\w-]+\/composes(\?.*)?$/,
      async (route) => {
        await route.fulfill({ status: 200, json: mkBlueprintComposes() });
      },
    );

    await test.step('Authenticate and open Image Builder', async () => {
      await ensureAuthenticated(page);
      await navigateToLandingPage(page);
    });
    const frame = await ibFrame(page);

    await test.step('Select the mocked blueprint', async () => {
      await frame
        .getByRole('textbox', { name: 'Search input' })
        .fill(blueprintName);
      await frame.locator(`button[id="${blueprintName}"]`).click();
    });

    await expect(
      frame.getByText('The selected blueprint has warnings.'),
    ).toBeVisible();
    await expect(
      frame.getByText('audit required by policy is not present'),
    ).toBeVisible();

    await test.step('Ignore warnings', async () => {
      await frame.locator('#blueprint_ignore_warnings').click();
    });

    state = 'audit_present';
    await navigateToLandingPage(page);
    const frame2 = await ibFrame(page);
    await test.step('Re-enter after adding package', async () => {
      await frame2
        .getByRole('textbox', { name: 'Search input' })
        .fill(blueprintName);
      await frame2.locator(`button[id="${blueprintName}"]`).click();
    });
    await expect(
      frame2.getByText('audit required by policy is not present'),
    ).toHaveCount(0);

    state = 'audit_missing_again';
    await navigateToLandingPage(page);
    const frame3 = await ibFrame(page);
    await test.step('Re-enter after removing package', async () => {
      await frame3
        .getByRole('textbox', { name: 'Search input' })
        .fill(blueprintName);
      await frame3.locator(`button[id="${blueprintName}"]`).click();
    });
    await expect(
      frame3.getByText('audit required by policy is not present'),
    ).toBeVisible();

    await page.unroute(/\/?blueprints(\?.*)?$/);
    await page.unroute(/\/?blueprints\/[\w-]+(\?.*)?$/);
    await page.unroute(/\/?blueprints\/[\w-]+\/composes(\?.*)?$/);
  });
});
