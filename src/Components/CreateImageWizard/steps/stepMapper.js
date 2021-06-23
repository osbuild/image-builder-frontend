export default ({ 'target-environment': targetEnv, release } = {}, { skipAws, skipGoogle, sipAzure } = {}) => {
    if (!skipAws && targetEnv?.aws) {
        return 'aws-target-env';
    }

    if (!skipGoogle && targetEnv?.google) {
        return 'google-cloud-target-env';
    }

    if (!sipAzure && targetEnv?.azure) {
        return 'ms-azure-target-env';
    }

    return release === 'rhel-8' ? 'registration' : 'packages';
};
