import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import LandingPage from '../../../SmartComponents/LandingPage/LandingPage';

describe('Landing Page', () => {
    beforeEach(() => {
        renderWithReduxRouter(<LandingPage />);
    });
    test('renders page heading', () => {
        // check heading
        screen.getByRole('heading', { name: /images/i });
    });
    test('renders ImagesTable child component', () => {
        // check action loads
        screen.getByTestId('create-image-action');
        // check table loads
        screen.getByTestId('images-table');
    });
});
