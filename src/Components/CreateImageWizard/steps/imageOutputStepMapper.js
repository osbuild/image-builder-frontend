import { RHEL_8 } from '../../../constants.js';

export default ({ 'target-environment': targetEnv, release } = {}, { skipAws, skipGoogle, skipAzure } = {}) => {
    if (!skipAws && targetEnv?.aws) {
        return 'aws-target-env';
    }

    if (!skipGoogle && targetEnv?.google) {
        return 'google-cloud-target-env';
    }

    if (!skipAzure && targetEnv?.azure) {
        return 'ms-azure-target-env';
    }

    return release === RHEL_8 ? 'registration' : 'File system configuration';
};
