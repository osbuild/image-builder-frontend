import React from 'react';

import { screen } from '@testing-library/react';

import api from '../../../api.js';
import LandingPage from '../../../Components/LandingPage/LandingPage';
import { renderWithReduxRouter } from '../../testUtils';

jest.mock('../../../store/actions/actions', () => {
  return {
    fetchComposes: () => ({ type: 'foo' }),
    fetchComposeStatus: () => ({ type: 'bar' }),
  };
});

beforeAll(() => {
  global.insights = {
    chrome: {
      isBeta: () => {
        return false;
      },
      isProd: () => {
        return true;
      },
      getEnvironment: () => {
        return 'prod';
      },
    },
  };
});

describe('Landing Page', () => {
  test('renders page heading', async () => {
    renderWithReduxRouter(<LandingPage />);

    const composeImage = jest.spyOn(api, 'getVersion');
    composeImage.mockResolvedValue({ version: '1.0' });
    // check heading
    screen.getByRole('heading', { name: /Image Builder/i });
  });

  test('renders EmptyState child component', async () => {
    renderWithReduxRouter(<LandingPage />);

    // check action loads
    screen.getByTestId('create-image-action');
    // check table loads
    screen.getByTestId('empty-state');
  });
});
