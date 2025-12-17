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
  registerLater,
} from '../../helpers/wizardHelpers';
import {
  buildImage,
  constructFilePath,
  downloadImage,
} from '../helpers/imageBuilding';
import { OpenStackWrapper } from '../helpers/OpenStackWrapper';

const validCallbackUrl =
  'https://controller.url/api/controller/v2/job_templates/9/callback/';
const validHostConfigKey = 'hostconfigkey';
const validCertificate = `-----BEGIN CERTIFICATE-----
MIIF1jCCA76gAwIBAgIUKrba5H8bUsuoLppQdzn3E9eG1+swDQYJKoZIhvcNAQEL
BQAwgYIxCzAJBgNVBAYTAlVTMRcwFQYDVQQIDA5Ob3J0aCBDYXJvbGluYTEQMA4G
A1UEBwwHUmFsZWlnaDEQMA4GA1UECgwHUmVkIEhhdDEQMA4GA1UECwwHQW5zaWJs
ZTEkMCIGA1UEAwwbQW5zaWJsZSBBdXRvbWF0aW9uIFBsYXRmb3JtMB4XDTI1MDYy
NjA2MTQ1MFoXDTM1MDYyNDA2MTQ1MFowgYIxCzAJBgNVBAYTAlVTMRcwFQYDVQQI
DA5Ob3J0aCBDYXJvbGluYTEQMA4GA1UEBwwHUmFsZWlnaDEQMA4GA1UECgwHUmVk
IEhhdDEQMA4GA1UECwwHQW5zaWJsZTEkMCIGA1UEAwwbQW5zaWJsZSBBdXRvbWF0
aW9uIFBsYXRmb3JtMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEApSSx
oBgZu5BlnIu0umoYOfXTkmJa+KnQZNxS7O8gEgAfcbO3HSlsTjIlS/9oB8Ch5R+I
ZUrgMw6jQ9b9JOmCQEbbBDtop7y4mQyDPhPpOMsS27WIZ3Tb1bbFZtDG5I1MT3it
jgAddvHy4LfLG7aQpkRsE6e8lgMCREAzUZmCzQQY5qbDag6HYUk+UmWN14aYR+xp
L2ptksQ0Etfygs91HmhLk4Oe28+QC/0/TocRAVPj9lEmOF89WJW/4QgIlfOlKQF4
f0pGyBOAUdMfYlgAb0m/zUemw/P9bEW8vTxv52wyPVsBrgDsIUQHYbdXgxsYkP3U
KC0vwxw2xPXlJSu2rJBH65faesH21Qp+CFbr9vxPm0k/CtFdbeNcgX9a0QGcWk8D
KTQqCIykE5olYmtJrZmHPU7ot8f1DmBHebFtqcoFNO21AWPc6thXPNU0G+bNYyIs
y7f8imYArauLOgcmW7M1m04ylc+oohVVKK07MRJIs0ChiX3E+fqdwPT109j/ahy+
pQ6amRAJGwgdw3YHvyVJCMImJKiGlh34hGe+Nf14uHqofWIf+s7HrSbSObOmZidQ
ghsPYDDs4NCb1v4xAh3lMwJUmVhvtkqb3m8G7IrJ2KQe7+Q7xjqA6sku8PT1Sj+9
SYi3Yrn3GHHfSfnFJIYVm5inuHyVErA9zmTMuG0CAwEAAaNCMEAwDgYDVR0PAQH/
BAQDAgIEMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFDe6MUDV0mltGdKHu7c0
T71rvDndMA0GCSqGSIb3DQEBCwUAA4ICAQBiolIvjgs5LhXQX9gj175MErtzG0SN
5myJIi5yKInSkEf3lxG6p7jIrvIh0ewISxU02i9jnrhSzQaUCw8UD5o7yE1QsoFs
ctKGRqps2grMNX4pq6imjaVAL5IGCxAq2vwj5uLGBpwXfCA6abVi5oIepNN2CuHt
Z6jqHn8FA79RFvgk86QmiGX2RsVzkS2b0ZLfiQyvhOLnR8e5mjLxImOhxJFWb03Z
tcMjbTkYYPPKZwaioSYZKfbn8rPW1oDiuYhO3+eEU8tfsQnIM4qWlN+B9YTTUcPT
s3y8EYjVViyBMKzzHIzPSBOs8klw9wrHV96Erk/IHc9tHKO1VP12fwsD2tEg02e2
9la4VvIcOV5IWoT50STWcictrF2Guy+aq+EXUz+ueqBX53UEFzEqlPyr/7CK9+Xg
mkVo31rxhSM6uQct1xBkqE3LrQwRE70FBn5vfM4RW7zWMbubGduIIY1pu2LFy72y
eXAL4mwz8gy53JOmMTyTz7UyZWbLBrrdCfSubujvP3PKdV8OBYXs7W5ZZMPbJg1B
SB/J6u0jcB+ys41NIcQMhm0CafP/jVfB32/gB2raYqaTr02D/fzXmOId1ioemByy
OrUQkZrxGa0saYjF2jPG3CJyAw/NFilxNngrYEv9vZKe1ZRWwl9xu7PBQbcJS7xh
KVuPT3baU0/iZg==
-----END CERTIFICATE-----`;

test('AAP registration boot integration test', async ({ page, cleanup }) => {
  test.skip(
    !isHosted(),
    'Skipping test. Boot test run only on the hosted service.',
  );
  const blueprintName = 'aap-test-' + uuidv4();
  const filePath = constructFilePath(blueprintName, 'qcow2');

  cleanup.add(() => deleteBlueprint(page, blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteImage(blueprintName));
  cleanup.add(() => OpenStackWrapper.deleteInstance(blueprintName));

  await ensureAuthenticated(page);
  await navigateToLandingPage(page);
  const frame = ibFrame(page);

  await test.step('Navigate to optional steps in Wizard', async () => {
    await fillInImageOutput(frame, 'qcow2', 'rhel10', 'x86_64');
    await registerLater(frame);
  });

  await test.step('Select and fill the AAP step', async () => {
    await frame
      .getByRole('button', { name: 'Ansible Automation Platform' })
      .click();
    await frame
      .getByRole('textbox', { name: 'ansible callback url' })
      .fill(validCallbackUrl);
    await frame
      .getByRole('textbox', { name: 'host config key' })
      .fill(validHostConfigKey);
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

  await test.step('Verify AAP first-boot registration unit exists', async () => {
    const [unitExitCode, unitOutput] = await image.exec(
      'systemctl cat aap-first-boot-reg.service',
    );
    expect(unitExitCode).toBe(0);
    expect(unitOutput).toContain('[Unit]');
  });

  await test.step('Verify registration command with callback URL is present on system', async () => {
    const [grepExitCode] = await image.exec(
      'grep -R "job_templates/9/callback" /usr/local/sbin -n',
    );
    expect(grepExitCode).toBe(0);
  });
});
