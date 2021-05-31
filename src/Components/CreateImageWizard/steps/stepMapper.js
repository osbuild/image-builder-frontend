export default ({ 'target-environment': targetEnv } = {}, skipFirst, skipSecond) => {
    if (!skipFirst && targetEnv?.aws) {
        return 'aws-target-env';
    }

    if (!skipSecond && targetEnv?.azure) {
        return 'ms-azure-target-env';
    }

    if (targetEnv?.google) {
        return 'google-cloud-target-env';
    }

    return 'registration';
};
