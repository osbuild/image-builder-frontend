import { test } from '../../fixtures/customizations';
import { AwsWrapper } from '../helpers/AwsWrapper';

test('Launch AWS instance', async ({ cleanup }) => {
  const image = new AwsWrapper('ami-06ad7d77105a12c13', 'awsboottest-ami');

  await test.step('Launch AWS instance', async () => {
    cleanup.add(() => image.terminateInstance());

    await image.launchInstance();
    await image.exec('echo "Hello, World!"');
  });
});
