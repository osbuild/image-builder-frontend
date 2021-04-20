import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import LandingPage from '../../../Components/LandingPage/LandingPage';
import api from '../../../api.js';

describe('Landing Page', () => {
    beforeEach(async () => {
        renderWithReduxRouter(<LandingPage />);
    });
    test('renders page heading', async () => {
        const composeImage = jest.spyOn(api, 'getVersion');
        composeImage.mockResolvedValue({ version: '1.0' });
        // check heading
        screen.getByRole('heading', { name: /Image Builder/i });
    });
    test('renders EmptyState child component', async () => {
        // check action loads
        screen.getByTestId('create-image-action');
        // check table loads
        screen.getByTestId('empty-state');
    });
});
