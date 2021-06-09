export default ({ 'target-environment': targetEnv, release } = {}, skipFirst, skipSecond) => {
    if (!skipFirst && targetEnv?.aws) {
        return 'aws-target-env';
    }

    if (!skipSecond && targetEnv?.google) {
        return 'google-cloud-target-env';
    }

    if (targetEnv?.azure) {
        return 'ms-azure-target-env';
    }

    return release === 'rhel-8' ? 'registration' : 'packages';
};
