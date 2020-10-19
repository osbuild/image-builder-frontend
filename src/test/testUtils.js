import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';

const defaultStore = {
    composes: {}
};

export const renderWithReduxRouter = (component, mockedStore = defaultStore, route = '/') => {
    const history = createMemoryHistory({ initialEntries: [ route ]});
    const makeMockStore = configureStore();
    const store = makeMockStore(mockedStore);
    return {
        ...render(
            <Provider store={ store }>
                <Router history={ history }>{component}</Router>
            </Provider>
        )
    };
};
