import React from 'react';
import { screen, render } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import ImagesTable from '../../../SmartComponents/ImagesTable/ImagesTable';
import ImageBuildStatus from '../../../PresentationalComponents/ImagesTable/ImageBuildStatus';
import '@testing-library/jest-dom';

const store = {
    composes: {
        'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa': {
            status: 'building',
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'qcow2'
        },
        '61b0effa-c901-4ee5-86b9-2010b47f1b22': {
            status: 'uploading',
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'qcow2'
        },
        '551de6f6-1533-4b46-a69f-7924051f9bc6': {
            status: 'success',
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'qcow2'
        }
    }
};

describe('Images Table', () => {
    beforeEach(() => {
        renderWithReduxRouter(<ImagesTable />, store);
    });

    test('render ImagesTable', () => {
        // check action loads
        screen.getByTestId('create-image-action');

        // make sure the empty-state message isn't present
        const emptyState = screen.queryByTestId('empty-state');
        expect(emptyState).not.toBeInTheDocument();

        // check table
        const table = screen.getByTestId('images-table');
        expect(table.rows).toHaveLength(4);
        for (const row of table.rows) {
            const col1 = row.cells[0].textContent;
            if (col1 === 'Image') // skip header
            {continue;}

            const compose = store.composes[col1];
            expect(compose).toBeTruthy();

            // render the expected <ImageBuildStatus /> and compare the text content
            let testElement = document.createElement('testElement');
            render(<ImageBuildStatus status={ compose.status } />, { container: testElement });
            expect(row.cells[3]).toHaveTextContent(testElement.textContent);
        }
    });
});
