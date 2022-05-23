import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import LandingPage from '../../../Components/LandingPage/LandingPage';
import api from '../../../api.js';

jest.mock('../../../store/actions/actions', () => {
  return {
    composesGet: () => ({ type: 'foo' }),
    composeGetStatus: () => ({ type: 'bar' }),
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
