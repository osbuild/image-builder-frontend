import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { init, clearStore } from '../store';

export const renderWithReduxRouter = (component, store = {}, route = '/') => {
  const history = createMemoryHistory({ initialEntries: [route] });
  clearStore();
  let reduxStore = init(store);
  return {
    ...render(
      <Provider store={reduxStore.getStore()}>
        <Router location={history.location} navigator={history}>
          {component}
        </Router>
      </Provider>
    ),
    history,
    reduxStore,
  };
};
