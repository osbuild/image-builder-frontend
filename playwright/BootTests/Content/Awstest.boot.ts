import { test } from '../../fixtures/customizations';
import { AwsWrapper } from '../helpers/AwsWrapper';

test('Launch AWS instance', async () => {
  const image = new AwsWrapper('ami-06ad7d77105a12c13', 'awsboottest-ami');

  await test.step('Launch AWS instance', async () => {
    await image.launchInstance();
    await image.exec('echo "Hello, World!"');
  });
});
