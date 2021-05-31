export default (values, skipFirst, skipSecond) => {
    if (!skipFirst && values?.['role-type']?.includes('a')) {
        return 'aws-target-env';
    }

    if (!skipSecond && values?.['role-type']?.includes('b')) {
        return 'ms-azure-target-env';
    }

    if (values?.['role-type']?.includes('c')) {
        return 'google-cloud-target-env';
    }

    return 'registration';
};
