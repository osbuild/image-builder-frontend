import { expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

import { test } from '../../fixtures/customizations';
import { isHosted } from '../../helpers/helpers';
import { ensureAuthenticated } from '../../helpers/login';
import {
  fillInImageOutput,
  ibFrame,
  navigateToLandingPage,
} from '../../helpers/navHelpers';
import {
  createBlueprint,
  deleteBlueprint,
  fillInDetails,
} from '../../helpers/wizardHelpers';
import {
  buildImage,
  constructFilePath,
  downloadImage,
} from '../helpers/imageBuilding';
import { OpenStackWrapper } from '../helpers/OpenStackWrapper';

const validRegistrationCommand = `set -o pipefail && curl --silent --show-error 'https://localhost/register?activation_keys=my-key&download_utility=curl&location_id=2&organization_id=1&update_packages=false' --header 'Authorization: Bearer mock.eyJleHAiOjk5OTk5OTk5OTl9.mock' | bash`;
const validCertificate = `-----BEGIN CERTIFICATE-----
MIIDCDCCAfCgAwIBAgIBATANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQKDApFeGFt
cGxlIENBMB4XDTIwMTExODA3NTMzN1oXDTM1MTExODA3NTMzN1owFTETMBEGA1UE
CgwKRXhhbXBsZSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALHm
fFYvVEtk1TIb2OHKoXiO4/1mXILBOi5mgxn49VT2YxWUO9E511iJg9j66yDlvJ0/
AwZBc+TTEk5wG2HGviE307TShj6uSywD5/gf5Py00jITEjbyzjLdpzuh8W/C8g/0
FQyIvpxfAwoiG1YB8a0l7Ejvx2tmSOyMDhNfBuS/OEiIMM9jiboLyEbhxKAhb3Q0
cG2pBZmYpWRLm1G2raecR5Lcl2Bl5lMGvm1XUvmsGEF45m8T+6XxitJlfurGLYFz
h3pUAfSAjnVp3KYAhbA2EVmSCo6OQfL9d6TbuecHMoGIXpMGBFLGvuC1UyIzkYJQ
kCWtplODPM4P14/7lv0CAwEAAaNjMGEwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8B
Af8EBAMCAQYwHQYDVR0OBBYEFMRTOqKRV2rv/yO9L5xhP7k7IB+zMB8GA1UdIwQY
MBaAFMRTOqKRV2rv/yO9L5xhP7k7IB+zMA0GCSqGSIb3DQEBCwUAA4IBAQAh9yku
uDvMBT06mocBLt/mW6JvW9tHfJIU/srfOV+pYO8PFv0JVYRwwsVhGWX7gvNyNXj8
5AjqEiyaC4ebmXCosPDCyoxA/RUtEaMJ980gMtdo2lc1uNlDYx7F6oxdqoQ66/Qm
vY5dh8cGqql9+BYlXFELbU6K/cbXbFINzE+QwRvPgx/Ctemq5BbZFmcOTw/M9R7p
3hh5PfM/uM71SkG8VyI6iStu8KqgBmEI43CH5KLaS6lZfnGaa1Ks10OdQuNbicuR
EuA3qL3jj7OPwyjecA9+X6qJd8FEXM1W2zCxFaODgr6iR7mvTkTxOEVfHRVT06GQ
LkB1TdfHQkk/525x
-----END CERTIFICATE-----`;

test('Satellite registration boot integration test', async ({
  page,
  cleanup,
}) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'satellite-test-' + uuidv4();
  const filePath = constructFilePath(blueprintName, 'qcow2');

  await cleanup.add(() => deleteBlueprint(page, blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  await cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = await ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
    await page.getByRole('button', { name: 'Register' }).click();
  });

  await test.step('Select and fill Satellite on Registration step', async () => {
    await frame
      .getByRole('radio', { name: /Register to a Satellite or Capsule/i })
      .click();
    await frame
      .getByRole('textbox', { name: 'registration command' })
      .fill(validRegistrationCommand);
    await frame
      .getByRole('textbox', { name: 'File upload' })
      .fill(validCertificate);
    await frame.getByRole('button', { name: 'Review and finish' }).click();
  });

  await test.step('Fill the BP details', async () => {
    await fillInDetails(frame, blueprintName);
  });

  await test.step('Create BP', async () => {
    await createBlueprint(frame, blueprintName);
  });

  await test.step('Build the image', async () => {
    await buildImage(page);
  });

  await test.step('Download the image', async () => {
    await downloadImage(page, filePath);
  });

  const image = new OpenStackWrapper(blueprintName, 'qcow2', filePath);

  await test.step('Prepare Openstack instance', async () => {
    await image.createImage();
    await image.launchInstance();
  });

  await test.step('Verify Satellite registration was run', async () => {
    const [exitCode, output] = await image.exec(
      'journalctl | grep "curl.*localhost.*register"',
    );
    expect(exitCode).toBe(0);
    expect(output).toContain(registrationCurlCommand);
  });

  await test.step('Verify the certificate file was correctly uploaded', async () => {
    const [exitCode, output] = await image.exec(
      'ls /etc/pki/ca-trust/source/anchors/',
    );
    expect(exitCode).toBe(0);
    expect(output).toMatch(/\b1\.pem\b/);
  });
});
