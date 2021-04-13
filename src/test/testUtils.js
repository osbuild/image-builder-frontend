import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
//import configureStore from 'redux-mock-store';
import { init, clearStore } from '../store';

export const renderWithReduxRouter = (component, store = {}, route = '/') => {
    const history = createMemoryHistory({ initialEntries: [ route ]});
    clearStore();
    return {
        ...render(
            <Provider store={ init(store).getStore() }>
                <Router history={ history }>{component}</Router>
            </Provider>
        ),
        history
    };
};
