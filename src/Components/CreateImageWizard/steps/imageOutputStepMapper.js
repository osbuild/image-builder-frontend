import { RHEL_8, RHEL_8_BETA, RHEL_9_BETA } from '../../../constants.js';

export default ({ 'target-environment': targetEnv, release } = {}, { skipAws, skipGoogle, skipAzure } = {}) => {
    if (!skipAws && targetEnv?.aws) {
        return 'aws-target-env';
    }

    if (!skipGoogle && targetEnv?.gcp) {
        return 'google-cloud-target-env';
    }

    if (!skipAzure && targetEnv?.azure) {
        return 'ms-azure-target-env';
    }

    switch (release) {
        case RHEL_8:
        case RHEL_8_BETA:
        case RHEL_9_BETA:
            return 'registration';
        default:
            return 'File system configuration';
    }
};
