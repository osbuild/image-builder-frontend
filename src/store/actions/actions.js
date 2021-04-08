import types from '../types';

function updateCompose(compose) {
    return {
        type: types.UPDATE_COMPOSE,
        compose
    };
}

function setRelease({ arch, distro }) {
    return {
        type: types.SET_RELEASE,
        payload: {
            arch,
            distro,
        }
    };
}

function setUploadDestinations({ aws, azure, google }) {
    return {
        type: types.SET_UPLOAD_DESTINATIONS,
        payload: {
            aws,
            azure,
            google,
        }
    };
}

function setUploadAWS({ shareWithAccounts }) {
    return {
        type: types.SET_UPLOAD_AWS,
        payload: {
            shareWithAccounts,
        }
    };
}

function setUploadAzure({ tenantId, subscriptionId, resourceGroup }) {
    return {
        type: types.SET_UPLOAD_AZURE,
        payload: {
            tenantId,
            subscriptionId,
            resourceGroup,
        }
    };
}

function setUploadGoogle({ accountType, shareWithAccounts }) {
    return {
        type: types.SET_UPLOAD_GOOGLE,
        payload: {
            accountType,
            shareWithAccounts,
        }
    };
}

function setSelectedPackages(selectedPackages) {
    return {
        type: types.SET_SELECTED_PACKAGES,
        payload: selectedPackages
    };
}

function setSubscription({ activationKey, insights, organization }) {
    return {
        type: types.SET_SUBSCRIPTION,
        payload: {
            activationKey,
            insights,
            organization,
        }
    };
}

function setSubscribeNow(subscribeNow) {
    return {
        type: types.SET_SUBSCRIBE_NOW,
        payload: subscribeNow
    };
}

export default {
    updateCompose,
    setRelease,
    setUploadDestinations,
    setUploadAWS,
    setUploadAzure,
    setUploadGoogle,
    setSelectedPackages,
    setSubscription,
    setSubscribeNow,
};
