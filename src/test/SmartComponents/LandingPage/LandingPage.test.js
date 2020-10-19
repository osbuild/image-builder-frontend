import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import LandingPage from '../../../SmartComponents/LandingPage/LandingPage';

describe('Landing Page', () => {
    beforeEach(() => {
        renderWithReduxRouter(<LandingPage />);
    });
    test('renders component', () => {
        // check heading
        screen.getByRole('heading', { name: /image builder/i });
    });
    test('renders CreateImageCard child component', () => {
        // check CreateImageCard loads
        screen.getByTestId('create-image-card');
        // and has correct contents
        screen.getByText(/create a new image/i);
        screen.getByRole('button', { name: /create image/i });
    });
    test('renders ImagesCard child component', () => {
        screen.getByText(/pending composes/i);
    });
});
