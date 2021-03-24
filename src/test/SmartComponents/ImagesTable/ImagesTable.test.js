import React from 'react';
import { screen, render } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import ImagesTable from '../../../SmartComponents/ImagesTable/ImagesTable';
import ImageBuildStatus from '../../../PresentationalComponents/ImagesTable/ImageBuildStatus';
import Upload from '../../../PresentationalComponents/ImagesTable/Upload';
import '@testing-library/jest-dom';

const store = {
    composes: {
        // kept "running" for backward compatibility
        'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa': {
            image_status: {
                status: 'running',
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'ami',
            upload_type: 'aws',
        },
        'edbae1c2-62bc-42c1-ae0c-3110ab718f58': {
            image_status: {
                status: 'pending',
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'ami',
            upload_type: 'aws',
        },
        '42ad0826-30b5-4f64-a24e-957df26fd564': {
            image_status: {
                status: 'building',
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'ami',
            upload_type: 'aws',
        },
        '955944a2-e149-4058-8ac1-35b514cb5a16': {
            image_status: {
                status: 'uploading',
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'ami',
            upload_type: 'aws',
        },
        'f7a60094-b376-4b58-a102-5c8c82dfd18b': {
            image_status: {
                status: 'registering',
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'ami',
            upload_type: 'aws',
        },
        '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
            image_status: {
                status: 'success',
                upload_status: {
                    options: {
                        ami: 'ami-0217b81d9be50e44b',
                        region: 'us-east-1'
                    },
                    status: 'success',
                    type: 'aws'
                }
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'ami',
            upload_type: 'aws',
        },
        '61b0effa-c901-4ee5-86b9-2010b47f1b22': {
            image_status: {
                status: 'failure',
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'vhd',
            upload_type: 'gcp',
        },
        'ca03f120-9840-4959-871e-94a5cb49d1f2': {
            image_status: {
                status: 'success',
                upload_status: {
                    options: {
                        image_name: 'composer-api-d446d8cb-7c16-4756-bf7d-706293785b05',
                        project_id: 'red-hat-image-builder'
                    },
                    status: 'success',
                    type: 'gcp'
                }
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'vhd',
            upload_type: 'gcp',
        },
        '551de6f6-1533-4b46-a69f-7924051f9bc6': {
            image_status: {
                status: 'building',
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'vhd',
            upload_type: 'azure',
        },
        '77fa8b03-7efb-4120-9a20-da66d68c4494': {
            image_status: {
                status: 'success',
                upload_status: {
                    options: {
                        image_name: 'composer-api-cc5920c3-5451-4282-aab3-725d3df7f1cb'
                    },
                    status: 'success',
                    type: 'azure'
                }
            },
            distribution: 'fedora-31',
            architecture: 'x86_64',
            image_type: 'vhd',
            upload_type: 'azure',
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
        expect(table.rows).toHaveLength(11);
        for (const row of table.rows) {
            const col1 = row.cells[0].textContent;
            if (col1 === 'Image') // skip header
            {continue;}

            const compose = store.composes[col1];
            expect(compose).toBeTruthy();

            // render the expected <ImageBuildStatus /> and compare the text content
            let testElement = document.createElement('testElement');
            render(<ImageBuildStatus status={ compose.image_status.status } />, { container: testElement });
            expect(row.cells[3]).toHaveTextContent(testElement.textContent);

            // do the same for the upload/target column
            render(<Upload uploadType={ compose.upload_type } />, { container: testElement });
            expect(row.cells[1]).toHaveTextContent(testElement.textContent);
        }
    });
});
