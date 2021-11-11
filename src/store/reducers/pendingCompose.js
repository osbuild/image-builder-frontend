import types from '../types';
import { RHEL_8 } from '../../constants.js';

const initialPendingComposeState = {
    release: {
        arch: 'x86_64',
        distro: RHEL_8,
    },
    uploadDestinations: {
        aws: false,
        azure: false,
        google: false,
    },
    uploadAWS: {
        shareWithAccounts: [],
    },
    uploadAzure: {
        tenantId: null,
        subscriptionId: null,
        resourceGroup: null,
    },
    uploadGoogle: {
        accountType: 'googleAccount',
        shareWithAccounts: [],
    },
    selectedPackages: [],
    subscription: {
        activationKey: null,
        insights: true,
        organization: null,
    },
    subscribeNow: false,
};

export function pendingCompose(state = initialPendingComposeState, action) {
    switch (action.type) {
        case types.SET_RELEASE:
            return {
                ...state,
                release: action.payload,
            };
        case types.SET_UPLOAD_DESTINATIONS:
            return {
                ...state,
                uploadDestinations: action.payload,
            };
        case types.SET_UPLOAD_AWS:
            return {
                ...state,
                uploadAWS: action.payload,
            };
        case types.SET_UPLOAD_AZURE:
            return {
                ...state,
                uploadAzure: action.payload,
            };
        case types.SET_UPLOAD_GOOGLE:
            return {
                ...state,
                uploadGoogle: action.payload,
            };
        case types.SET_SELECTED_PACKAGES:
            return {
                ...state,
                selectedPackages: action.payload,
            };
        case types.SET_SUBSCRIPTION:
            return {
                ...state,
                subscription: action.payload,
            };
        case types.SET_SUBSCRIBE_NOW:
            return {
                ...state,
                subscribeNow: action.payload,
            };
        default:
            return state;
    }
}

export default pendingCompose;
