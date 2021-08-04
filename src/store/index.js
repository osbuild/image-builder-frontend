import { ReducerRegistry } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

import composes from './reducers/composes';
import pendingCompose from './reducers/pendingCompose';

let registry;

export function init (store = {}, ...middleware) {
    if (!registry) {
        registry = new ReducerRegistry(store, [
            promiseMiddleware,
            thunk,
            ...middleware.filter(item => typeof item !== 'undefined'),
        ]);

        registry.register({
            composes,
            pendingCompose,
            notifications: notificationsReducer,
        });
    }

    return registry;
}

export function getStore () {
    return registry.getStore();
}

export function register (...args) {
    return registry.register(...args);
}

/* added for testing purposes only */
export function clearStore() {
    registry = undefined;
}
