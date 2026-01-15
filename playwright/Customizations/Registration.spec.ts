import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import isRhel from '../../src/Utilities/isRhel';
import { test } from '../fixtures/customizations';
import {
  getHostDistroName,
  isHosted,
  uploadCertificateFile,
} from '../helpers/helpers';
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
} from '../helpers/wizardHelpers';

export const SATELLITE_COMMAND = `
set -o pipefail && curl -sS 'https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false'
// -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjQxMDI0NDQ4MDB9.CQ6hOQJLJDfD_P5gaEIEseY5iMRLhnk7iC5ZJ4Rzno0 | bash`; // notsecret

export const SATELLITE_COMMAND_EXPIRED_TOKEN = `
set -o pipefail && curl -sS 'https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false'
// -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1LCJpYXQiOjE3MjM4Mzc3MjIsImp0aSI6IjBhNTU3MDM3ZDIyNzUyMDYwM2M3MWIzZDI4NGYwZjQ1NmFjYjE5NzEyNmFmNTk5NzU0NWJmODcwZDczM2RhY2YiLCJleHAiOjE3MjM4NTIxMjIsInNjb3BlIjoicmVnaXN0cmF0aW9uI2dsb2JhbCByZWdpc3RyYXRpb24jaG9zdCJ9.HsSnZEqq--MIJfP3_awn6SflEruoEm77iSWh0Pi6EW4'
//  | bash`; // notsecret

export const SATELLITE_COMMAND_NO_EXPIRATION = `
set -o pipefail && curl -sS 'https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false'
// -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' | bash`; // notsecret

export const CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDUDCCAjigAwIBAgIUIE7ftn9J9krO6TRJg8M3plAZGgEwDQYJKoZIhvcNAQEL
BQAwYjELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcM
DVNhbiBGcmFuY2lzY28xETAPBgNVBAoMCFRlc3QgT3JnMRMwEQYDVQQDDAp0ZXN0
LmxvY2FsMB4XDTI1MDIwNTEzMzk0N1oXDTI2MDIwNTEzMzk0N1owYjELMAkGA1UE
BhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcMDVNhbiBGcmFuY2lz
Y28xETAPBgNVBAoMCFRlc3QgT3JnMRMwEQYDVQQDDAp0ZXN0LmxvY2FsMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8JdVoIaWh0PO1dL7xuGUNBUx6hZ
PBYSnWpPS7lNL3Y/KHNNZhStm0ISFYcB4C/mlJN+9kMcl3CXoktZHfrkencRwhlv
9aua70fZmmjgHDn3Stm25pqrhehUzoKZPlai9eXGJfY1q52ZMjNa0dxJjt6IST8U
oAwwXrBr14dUjuMM0ZhLeLtiTAh1Eb8CnXMmVmkhoMBbMODE3Lkqr72K8kseu8Qx
6Iq96ggkwiAQr3+h2GOkqtEl6BQEbjG1CVlVMCTU3B3yJ/uDUYvqK3897PdgWkUQ
2L3dZPTWv+p8+UjaC4zVYGnM7NpJisMZPXsbA9KiqaF+bUvLLjP9budPXwIDAQAB
MA0GCSqGSIb3DQEBCwUAA4IBAQCz2uByr3Tf34zSeYhy1z6MLJR4ijcfuWhxuE7D
M5fB4I0Ua3K6+ptZDvlWuikF+5InnoU3HSfrXVPCJ1my4jsgk+c4YKPW0yVRrr6m
hS2CKZyngICWnGCIYrlXlKeNJe4j23WF7IRhsykvkpt69Vw1x99UIJBcobOx+Kw/
zB92/XFIBwOZArUmGDaiL5MnqhmFWfc6mtIELxIRKCj9LQG9y7L1JoVyqug3thgZ
CdoLGtbHXri9BSR+8ogXu4JWp0YwMHTul6AEb2kcSZHTrYj6lUkXJMsw+E5jV37G
jZKGigLMSUp2z4jT+aX+HblYHrvTbrKct23EMeJeANQzF08e
-----END CERTIFICATE-----`;

// Define test parameters for different registration modes
const registrationModes = [
  {
    name: 'automatic',
    setup: async (frame: Awaited<ReturnType<typeof ibFrame>>) => {
      await expect(
        frame.getByRole('radio', { name: 'Automatically register to Red Hat' }),
      ).toBeChecked();

      // Conditional setup based on hosted vs on-premise
      if (isHosted()) {
        // Hosted: Select an activation key from dropdown
        await frame.getByRole('button', { name: 'Menu toggle' }).click();
        await frame.getByRole('option', { name: 'activation-key-' }).click();
      } else if (isRhel(getHostDistroName())) {
        // On-premise RHEL: Fill activation key and organization ID input fields
        await frame.getByRole('textbox', { name: 'activation key' }).fill(' ');
        await expect(
          frame.getByText('The activation key cannot be empty'),
        ).toBeVisible();
        await frame
          .getByRole('textbox', { name: 'activation key' })
          .fill('test-activation-key');
        await expect(frame.getByText('12345')).toBeVisible(); // organization id
        await expect(
          frame.getByText('The activation key cannot be empty'),
        ).toBeHidden();
        await frame
          .getByRole('textbox', { name: 'organization id' })
          .fill('abcdefghijkl');
        await expect(
          frame.getByText('Please enter a valid Organization ID'),
        ).toBeVisible();
        await frame
          .getByRole('textbox', { name: 'organization id' })
          .fill('12345');
      } else {
        // On-premise non-RHEL: Skip automatic registration test
        test.skip(
          true,
          'Automatic registration is only available for RHEL distributions',
        );
      }
    },
    expectedReviewText: 'Register with Red Hat',
    expectedHiddenText: 'Register the system later',
  },
  {
    name: 'register-later',
    setup: async (frame: Awaited<ReturnType<typeof ibFrame>>) => {
      await frame.getByRole('radio', { name: 'Register later' }).check();
    },
    expectedReviewText: 'Register the system later',
    expectedHiddenText: 'Register with Red Hat',
  },
  {
    name: 'satellite',
    setup: async (frame: Awaited<ReturnType<typeof ibFrame>>) => {
      await frame
        .getByRole('radio', { name: 'Register to a Satellite or Capsule' })
        .check();
      // Upload certificate file using helper function
      await uploadCertificateFile(
        frame.getByRole('button', { name: 'Upload' }),
        CERTIFICATE,
        'satellite_cert.pem',
      );
    },
    expectedReviewText: 'Register SatelliteEnabled',
    expectedHiddenText: 'Register with Red Hat',
  },
];

// Parameterize tests for each registration mode
registrationModes.forEach(
  ({ name, setup, expectedReviewText, expectedHiddenText }) => {
    test(`Registration ${name} mode - Create, Edit, and Import`, async ({
      page,
      cleanup,
    }) => {
      if (!isHosted() && !isRhel(getHostDistroName())) {
        test.skip(
          true,
          'Registration is only available for RHEL distributions on-premise',
        );
      }

      const blueprintName = `test-${name}-${uuidv4()}`;

      // Delete the blueprint after the run fixture
      cleanup.add(() => deleteBlueprint(page, blueprintName));

      await ensureAuthenticated(page);

      // Navigate to IB landing page and get the frame
      await navigateToLandingPage(page);
      const frame = ibFrame(page);

      await test.step('Navigate to Registration step', async () => {
        await fillInImageOutput(frame);
        await frame.getByRole('button', { name: 'Register' }).click();
      });

      await test.step(`Setup ${name} registration mode`, async () => {
        await setup(frame);
      });

      await test.step('Test registration options toggles', async () => {
        if (name === 'automatic') {
          await expect(
            frame.getByRole('button', { name: 'View details' }),
          ).toBeVisible();
          await expect(frame.getByText('activation-key-')).toBeHidden();
          await frame.getByRole('button', { name: 'View details' }).click();
          await expect(
            frame.getByRole('button', { name: 'View details' }),
          ).toBeVisible();
          await expect(frame.getByText('activation-key-')).toBeVisible();
          await frame.getByRole('button', { name: 'Close' }).click();

          // Test enabling/disabling predictive analytics
          const insightsSwitch = frame.getByText('Enable predictive analytics');
          const insightsReviewStep = frame.getByText(
            'Connect to Red Hat Lightspeed',
          );
          // Test enabling/disabling remote remediations
          const rhcSwitch = frame.getByText('Enable remote remediations');
          const rhcReviewStep = frame.getByText(
            'Use remote host configuration',
          );

          // insights on, rhc off
          await rhcSwitch.click();
          await expect(rhcSwitch).not.toBeChecked();
          await expect(insightsSwitch).toBeChecked(); // does not influence insights toggle
          await frame
            .getByRole('button', { name: 'Review and finish' })
            .click();
          await expect(
            frame.getByText('Register the system later'),
          ).toBeHidden();
          await expect(frame.getByText('Register with Red Hat')).toBeVisible();
          // Check activation key display based on environment
          if (isHosted()) {
            await expect(frame.getByText('activation-key-')).toBeVisible();
          } else if (isRhel(getHostDistroName())) {
            await expect(frame.getByText('test-activation-key')).toBeVisible();
            await expect(frame.getByText('12345')).toBeVisible(); // organization id
          }
          await expect(insightsReviewStep).toBeVisible();
          await expect(rhcReviewStep).toBeHidden();
          await frame.getByRole('button', { name: 'Register' }).click();
          // check if the state is the same after returning from review step
          await expect(rhcSwitch).not.toBeChecked();
          await expect(insightsSwitch).toBeChecked();

          // insights off => rhc off
          await rhcSwitch.click();
          await insightsSwitch.click();
          await expect(insightsSwitch).not.toBeChecked();
          await expect(rhcSwitch).not.toBeChecked(); // to use rhc, insights must be enabled
          await frame
            .getByRole('button', { name: 'Review and finish' })
            .click();
          await expect(
            frame.getByText('Register the system later'),
          ).toBeHidden();
          await expect(frame.getByText('Register with Red Hat')).toBeVisible();
          // Check activation key display based on environment
          if (isHosted()) {
            await expect(frame.getByText('activation-key-')).toBeVisible();
          } else {
            await expect(frame.getByText('test-activation-key')).toBeVisible();
          }
          await expect(insightsReviewStep).toBeHidden();
          await expect(rhcReviewStep).toBeHidden();
          await frame.getByRole('button', { name: 'Register' }).click();
          // check if the state is the same after returning from review step
          await expect(insightsSwitch).not.toBeChecked();
          await expect(rhcSwitch).not.toBeChecked();

          // rhc on => insights on
          await rhcSwitch.click();
          await expect(rhcSwitch).toBeChecked();
          await expect(insightsSwitch).toBeChecked(); // turning on rhc turns on insights
          await frame
            .getByRole('button', { name: 'Review and finish' })
            .click();
          await expect(
            frame.getByText('Register the system later'),
          ).toBeHidden();
          await expect(frame.getByText('Register with Red Hat')).toBeVisible();
          // Check activation key display based on environment
          if (isHosted()) {
            await expect(frame.getByText('activation-key-')).toBeVisible();
          } else if (isRhel(getHostDistroName())) {
            await expect(frame.getByText('test-activation-key')).toBeVisible();
            await expect(frame.getByText('12345')).toBeVisible(); // organization id
          }
          await expect(insightsReviewStep).toBeVisible();
          await expect(rhcReviewStep).toBeVisible();
          await frame.getByRole('button', { name: 'Register' }).click();
          // check if the state is the same after returning from review step
          await expect(rhcSwitch).toBeChecked();
          await expect(insightsSwitch).toBeChecked();
        } else if (name === 'satellite') {
          // Test satellite registration command validation
          const registrationCommandInput = frame.getByRole('textbox', {
            name: 'registration command',
          });

          // Test invalid command
          await registrationCommandInput.fill('invalid-command');
          await expect(
            frame.getByText('Invalid or missing token:'),
          ).toBeVisible();
          await expect(
            frame.getByRole('button', { name: 'Review and finish' }),
          ).toBeDisabled();

          // Test expired token command
          await registrationCommandInput.fill(SATELLITE_COMMAND_EXPIRED_TOKEN);
          await expect(
            frame.getByText(
              'The token is already expired or will expire by next day.',
            ),
          ).toBeVisible();
          await expect(
            frame.getByRole('button', { name: 'Review and finish' }),
          ).toBeEnabled();

          // Test valid command with no expiration
          await registrationCommandInput.fill(SATELLITE_COMMAND_NO_EXPIRATION);
          await expect(
            frame.getByText('Invalid or missing token:'),
          ).toBeHidden();
          await expect(
            frame.getByText(
              'The token is already expired or will expire by next day.',
            ),
          ).toBeHidden();

          // Test valid command with standard token
          await registrationCommandInput.fill(SATELLITE_COMMAND);
          await expect(
            frame.getByText('Invalid or missing token:'),
          ).toBeHidden();

          await frame.getByRole('button', { name: 'Systemd services' }).click();
          await expect(frame.getByText('register-satellite')).toBeVisible();
        }
      });

      await test.step('Fill the BP details', async () => {
        await frame.getByRole('button', { name: 'Review and finish' }).click();
        await fillInDetails(frame, blueprintName);
      });

      await test.step('Verify Review step shows correct registration details', async () => {
        await expect(frame.getByText(expectedReviewText)).toBeVisible();
        await expect(frame.getByText(expectedHiddenText)).toBeHidden();
      });

      await test.step('Create and save blueprint', async () => {
        await createBlueprint(frame, blueprintName);
      });

      await test.step('Edit blueprint and verify registration persisted', async () => {
        await frame.getByRole('button', { name: 'Edit blueprint' }).click();
        await frame.getByTestId('revisit-registration').click();

        // Verify the original registration mode is still selected
        if (name === 'automatic') {
          await expect(
            frame.getByRole('radio', {
              name: 'Automatically register to Red Hat',
            }),
          ).toBeChecked();
        } else if (name === 'register-later') {
          await expect(
            frame.getByRole('radio', { name: 'Register later' }),
          ).toBeChecked();
        } else if (name === 'satellite') {
          await expect(
            frame.getByRole('radio', {
              name: 'Register to a Satellite or Capsule',
            }),
          ).toBeChecked();
        }

        await frame.getByRole('button', { name: 'Review and finish' }).click();
        await frame
          .getByRole('button', { name: 'Save changes to blueprint' })
          .click();
      });

      let exportedBP = '';

      await test.step('Export blueprint', async () => {
        exportedBP = await exportBlueprint(page);
        cleanup.add(async () => {
          await fsPromises.rm(path.dirname(exportedBP), { recursive: true });
        });
      });

      await test.step('Import blueprint', async () => {
        await importBlueprint(frame, exportedBP);
      });

      await test.step('Verify import does not change registration settings', async () => {
        await fillInImageOutputGuest(frame);
        await frame.getByRole('button', { name: 'Register' }).click();
        // Verify registration settings are preserved based on mode
        await expect(
          frame.getByRole('radio', {
            name: 'Automatically register to Red Hat',
          }),
        ).toBeChecked();

        await frame.getByRole('button', { name: 'Cancel' }).click();
      });
    });
  },
);
