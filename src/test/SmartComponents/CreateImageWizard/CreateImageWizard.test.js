import React from 'react';
import { screen, getByText } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import CreateImageWizard from '../../../SmartComponents/CreateImageWizard/CreateImageWizard';

describe('Landing Page', () => {
    beforeEach(() => {
        renderWithReduxRouter(<CreateImageWizard />);
    });
    test('renders component', () => {
        // check heading
        screen.getByRole('heading', { name: /Create a new image/ });

        // left sidebar navigation
        const nav = screen.getByRole('navigation');
        getByText(nav, 'Release');
        getByText(nav, 'Target environment');
        getByText(nav, 'Registration');
        getByText(nav, 'Review');

        // buttons
        screen.getByRole('button', { name: /Next/ });
        screen.getByRole('button', { name: /Back/ });
        screen.getByRole('button', { name: /Cancel/ });
    });
});
