import { screen } from '@testing-library/react';

import api from '../../../api.js';
import { renderWithReduxRouter } from '../../testUtils';

jest.mock('../../../store/actions/actions', () => {
  return {
    fetchComposes: () => ({ type: 'foo' }),
    fetchComposeStatus: () => ({ type: 'bar' }),
  };
});

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

describe('Landing Page', () => {
  test('renders page heading', async () => {
    renderWithReduxRouter('', {});

    const composeImage = jest.spyOn(api, 'getVersion');
    composeImage.mockResolvedValue({ version: '1.0' });
    // check heading
    screen.getByRole('heading', { name: /Image Builder/i });
  });

  test('renders EmptyState child component', async () => {
    renderWithReduxRouter('', {});

    // check action loads
    screen.getByTestId('create-image-action');
    // check table loads
    screen.getByTestId('empty-state');
  });
});
