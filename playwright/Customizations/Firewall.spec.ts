import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';

import { test } from '../fixtures/customizations';
import { exportedFirewallBP } from '../fixtures/data/exportBlueprintContents';
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
  importBlueprint,
  openWizard,
  registerLater,
  verifyExportedBlueprint,
} from '../helpers/wizardHelpers';

test('Create a blueprint with Firewall customization', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + crypto.randomUUID();

  // Delete the blueprint after the run fixture
  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  await test.step('Navigate to IB landing page', async () => {
    await navigateToLandingPage(page);
  });

  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill Image Output and Registration', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Select and correctly fill the ports in Firewall step', async () => {
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
    await expect(frame.getByRole('button', { name: 'Next' })).toBeEnabled();
    await frame.getByPlaceholder('Enter port').fill('80:tcp');
    await page.keyboard.press('Enter');
    await expect(frame.getByText('80:tcp', { exact: true })).toBeVisible();

    await frame.getByPlaceholder('Enter port').fill('443:udp');
    await page.keyboard.press('Enter');
    await expect(frame.getByText('443:udp', { exact: true })).toBeVisible();
  });

  await test.step('Select and correctly fill the enabled services in Firewall step', async () => {
    await frame.getByLabel('Add enabled firewall service').fill('cloud-init');
    await page.keyboard.press('Enter');
    await expect(frame.getByText('cloud-init')).toBeVisible();
  });

  await test.step('Select and correctly fill the disabled services in Firewall step', async () => {
    await frame
      .getByLabel('Add disabled firewall service')
      .fill('telnet.socket');
    await page.keyboard.press('Enter');
    await expect(frame.getByText('telnet.socket')).toBeVisible();
  });

  await test.step('Prevent adding duplicate ports and services', async () => {
    await frame.getByPlaceholder('Enter port').fill('80:tcp');
    await page.keyboard.press('Enter');
    await expect(
      frame.getByText('Duplicate firewall ports: 80:tcp'),
    ).toBeVisible();

    await frame.getByLabel('Add enabled firewall service').fill('cloud-init');
    await page.keyboard.press('Enter');
    await expect(
      frame.getByText('Duplicate enabled firewall services: cloud-init'),
    ).toBeVisible();

    await frame
      .getByLabel('Add disabled firewall service')
      .fill('telnet.socket');
    await page.keyboard.press('Enter');
    await expect(
      frame.getByText('Duplicate disabled firewall services: telnet.socket'),
    ).toBeVisible();
  });

  await test.step('Select and incorrectly fill the ports in Firewall step', async () => {
    await frame.getByPlaceholder('Enter port').fill('00:wrongFormat');
    await page.keyboard.press('Enter');
    await expect(
      frame.getByText(
        'Expected format: <port/port-name>:<protocol>. Example: 8080:tcp, ssh:tcp',
      ),
    ).toBeVisible();
  });

  await test.step('Select and incorrectly fill the enabled services in Firewall step', async () => {
    await frame.getByLabel('Add enabled firewall service').fill('1');
    await page.keyboard.press('Enter');
    await expect(
      frame.getByText('Service name must contain at least one letter'),
    ).toBeVisible();
  });

  await test.step('Select and incorrectly fill the disabled services in Firewall step', async () => {
    await frame
      .getByLabel('Add disabled firewall service')
      .fill('wrong--service');
    await page.keyboard.press('Enter');
    await expect(
      frame.getByText('Service name must not contain consecutive hyphens'),
    ).toBeVisible();
  });

  await test.step('Create BP and verify firewall payload', async () => {
    await frame.getByRole('button', { name: 'Review image' }).click();
    if (!isHosted()) {
      await createBlueprint(frame, blueprintName);
      return;
    }
    const [request] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.url().includes('/api/image-builder/v1/blueprints') &&
          req.method() === 'POST',
      ),
      createBlueprint(frame, blueprintName),
    ]);

    const body = request.postDataJSON();
    expect(body?.customizations?.firewall).toEqual({
      ports: ['80:tcp', '443:udp'],
      services: {
        enabled: ['cloud-init'],
        disabled: ['telnet.socket'],
      },
    });
  });

  await test.step('Edit BP', async () => {
    await frame.getByRole('button', { name: 'Edit blueprint' }).click();
    await frame.getByRole('button', { name: 'Advanced settings' }).click();

    await frame.getByPlaceholder('Enter port').fill('90:tcp');
    await page.keyboard.press('Enter');
    await frame.getByLabel('Add enabled firewall service').fill('x');
    await page.keyboard.press('Enter');
    await frame.getByLabel('Add disabled firewall service').fill('y');
    await page.keyboard.press('Enter');

    await frame.getByRole('button', { name: 'Remove 80:tcp' }).click();
    await frame.getByRole('button', { name: 'Remove 443:udp' }).click();
    await frame.getByRole('button', { name: 'Remove cloud-init' }).click();
    await frame.getByRole('button', { name: 'Remove telnet.socket' }).click();

    await expect(frame.getByText('90:tcp')).toBeVisible();
    await expect(frame.getByText('x', { exact: true })).toBeVisible();
    await expect(frame.getByText('y', { exact: true })).toBeVisible();

    await expect(frame.getByText('80:tcp', { exact: true })).toBeHidden();
    await expect(frame.getByText('443:udp', { exact: true })).toBeHidden();
    await expect(frame.getByText('telnet.socket')).toBeHidden();
    await expect(frame.getByText('cloud-init')).toBeHidden();

    await frame.getByRole('button', { name: 'Review image' }).click();
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
    verifyExportedBlueprint(exportedBP, exportedFirewallBP(blueprintName));
  });

  await test.step('Import BP', async () => {
    await importBlueprint(frame, exportedBP);
  });

  await test.step('Review imported BP', async () => {
    await fillInImageOutput(frame);
    if (!isHosted()) {
      await registerLater(frame);
    }
    await frame.getByRole('textbox', { name: 'Blueprint name' }).fill('tmp');
    await frame.getByRole('button', { name: 'Advanced settings' }).click();

    await expect(frame.getByText('90:tcp')).toBeVisible();
    await expect(frame.getByText('x', { exact: true })).toBeVisible();
    await expect(frame.getByText('y', { exact: true })).toBeVisible();

    await expect(frame.getByText('80:tcp', { exact: true })).toBeHidden();
    await expect(frame.getByText('443:udp', { exact: true })).toBeHidden();
    await expect(frame.getByText('telnet.socket')).toBeHidden();
    await expect(frame.getByText('cloud-init')).toBeHidden();

    await frame.getByRole('button', { name: 'Cancel' }).click();
  });
});

test('Firewall fields collapse chips with show less / more', async ({
  page,
  cleanup,
}) => {
  const blueprintName = 'test-' + crypto.randomUUID();

  cleanup.add(() => deleteBlueprint(page, blueprintName));

  await ensureAuthenticated(page);

  await test.step('Navigate to IB landing page', async () => {
    await navigateToLandingPage(page);
  });

  const frame = ibFrame(page);

  await test.step('Open Wizard', async () => {
    await openWizard(frame);
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Fill Image Output and Registration', async () => {
    await fillInImageOutput(frame);
    await registerLater(frame);
  });

  await test.step('Open Advanced settings', async () => {
    await frame.getByRole('button', { name: 'Advanced settings' }).click();
  });

  await test.step('Ports: shows all chips when 4 or fewer', async () => {
    const portInput = frame.getByPlaceholder('Enter port');
    for (const port of ['80:tcp', '443:tcp', '8080:tcp', '22:tcp']) {
      await portInput.fill(port);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('80:tcp', { exact: true })).toBeVisible();
    await expect(frame.getByText('443:tcp')).toBeVisible();
    await expect(frame.getByText('8080:tcp', { exact: true })).toBeVisible();
    await expect(frame.getByText('22:tcp')).toBeVisible();
    await expect(frame.getByText(/^\d+ more$/)).toBeHidden();
  });

  await test.step('Ports: collapses and shows "X more" when more than 4', async () => {
    const portInput = frame.getByPlaceholder('Enter port');
    for (const port of ['3000:tcp', '5432:tcp']) {
      await portInput.fill(port);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('80:tcp', { exact: true })).toBeVisible();
    await expect(frame.getByText('3000:tcp')).toBeHidden();
    await expect(frame.getByText('5432:tcp')).toBeHidden();
    await expect(frame.getByText('2 more')).toBeVisible();
  });

  await test.step('Ports: expands when clicking "X more" and collapses with "Show less"', async () => {
    await frame.getByText('2 more').click();
    await expect(frame.getByText('3000:tcp')).toBeVisible();
    await expect(frame.getByText('5432:tcp')).toBeVisible();
    await expect(frame.getByText('Show less')).toBeVisible();

    await frame.getByText('Show less').click();
    await expect(frame.getByText('3000:tcp')).toBeHidden();
    await expect(frame.getByText('5432:tcp')).toBeHidden();
    await expect(frame.getByText('2 more')).toBeVisible();
  });

  await test.step('Ports: collapse controls disappear when items drop below threshold', async () => {
    await frame.getByText('2 more').click();

    await frame.getByRole('button', { name: 'Remove 5432:tcp' }).click();
    await frame.getByRole('button', { name: 'Remove 3000:tcp' }).click();

    await expect(frame.getByText(/^\d+ more$/)).toBeHidden();
    await expect(frame.getByText('Show less')).toBeHidden();
    await expect(frame.getByText('80:tcp', { exact: true })).toBeVisible();
    await expect(frame.getByText('443:tcp')).toBeVisible();
    await expect(frame.getByText('8080:tcp', { exact: true })).toBeVisible();
    await expect(frame.getByText('22:tcp')).toBeVisible();
  });

  await test.step('Enabled services: collapses and shows "X more" when more than 4', async () => {
    const enabledInput = frame.getByLabel('Add enabled firewall service');
    for (const service of ['ssh', 'http', 'https', 'dhcp', 'dns']) {
      await enabledInput.fill(service);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('ssh', { exact: true })).toBeVisible();
    await expect(frame.getByText('http', { exact: true })).toBeVisible();
    await expect(frame.getByText('https')).toBeVisible();
    await expect(frame.getByText('dhcp')).toBeVisible();
    await expect(frame.getByText('dns')).toBeHidden();
    await expect(frame.getByText('1 more').first()).toBeVisible();
  });

  await test.step('Disabled services: collapses and shows "X more" when more than 4', async () => {
    const disabledInput = frame.getByLabel('Add disabled firewall service');
    for (const service of ['telnet', 'ftp', 'nfs', 'samba', 'cups']) {
      await disabledInput.fill(service);
      await page.keyboard.press('Enter');
    }

    await expect(frame.getByText('telnet')).toBeVisible();
    await expect(frame.getByText('ftp')).toBeVisible();
    await expect(frame.getByText('nfs')).toBeVisible();
    await expect(frame.getByText('samba')).toBeVisible();
    await expect(frame.getByText('cups')).toBeHidden();
    await expect(frame.getByText('1 more').last()).toBeVisible();
  });
});
