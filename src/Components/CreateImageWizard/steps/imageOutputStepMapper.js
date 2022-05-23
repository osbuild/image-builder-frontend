import isRhel from '../../../Utilities/isRhel.js';

export default (
  { 'target-environment': targetEnv, release } = {},
  { skipAws, skipGoogle, skipAzure } = {}
) => {
  if (!skipAws && targetEnv?.aws) {
    return 'aws-target-env';
  }

  if (!skipGoogle && targetEnv?.gcp) {
    return 'google-cloud-target-env';
  }

  if (!skipAzure && targetEnv?.azure) {
    return 'ms-azure-target-env';
  }

  return isRhel(release) ? 'registration' : 'File system configuration';
};
