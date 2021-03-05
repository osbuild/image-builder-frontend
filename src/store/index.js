import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/files/ReducerRegistry';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { composeReducer } from '../SmartComponents/redux/reducers';

let registry;

export function init (...middleware) {
    if (registry) {
        throw new Error('store already initialized');
    }

    registry = new ReducerRegistry({}, [
        promiseMiddleware,
        ...middleware
    ]);

    registry.register({
        composes: composeReducer,
        notifications: notificationsReducer,
    });

    return registry;
}

export function getStore () {
    return registry.getStore();
}

export function register (...args) {
    return registry.register(...args);
}
