import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';

import ImagesTable from '../../../SmartComponents/ImagesTable/ImagesTable';

describe('ImagesTable Page', () => {
    beforeEach(() => {
        const mockedStore = {
            composes: [
                {
                    image_type: 'qcow2',
                    distribution: 'fedora-33'
                }
            ]
        };
        renderWithReduxRouter(<ImagesTable />, mockedStore);
    });
    test('renders images table', () => {
        // check images table
        screen.getByTestId('images-table');

        // check props render
        screen.getByText(/fedora-33/i,);
        screen.getByText(/qcow2/i,);
    });
});
