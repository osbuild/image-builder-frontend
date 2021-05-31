import React from 'react';
import { screen, render } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import ImagesTable from '../../../Components/ImagesTable/ImagesTable';
import ImageBuildStatus from '../../../Components/ImagesTable/ImageBuildStatus';
import ImageLink from '../../../Components/ImagesTable/ImageLink';
import Upload from '../../../Components/ImagesTable/Upload';
import '@testing-library/jest-dom';

const store = {
    composes: {
        errors: null,
        allIds: [
            'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
            'edbae1c2-62bc-42c1-ae0c-3110ab718f58',
            '42ad0826-30b5-4f64-a24e-957df26fd564',
            '955944a2-e149-4058-8ac1-35b514cb5a16',
            'f7a60094-b376-4b58-a102-5c8c82dfd18b',
            '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
            '61b0effa-c901-4ee5-86b9-2010b47f1b22',
            'ca03f120-9840-4959-871e-94a5cb49d1f2',
            '551de6f6-1533-4b46-a69f-7924051f9bc6',
            '77fa8b03-7efb-4120-9a20-da66d68c4494',
        ],
        byId: {
            '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
                id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'ami',
                            upload_request: {
                                type: 'aws',
                                options: {}
                            }
                        }
                    ],
                },
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
            },
            // kept "running" for backward compatibility
            'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa': {
                id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'ami',
                            upload_request: {
                                type: 'aws',
                                options: {}
                            }
                        }
                    ],
                },
                image_status: {
                    status: 'running',
                },
            },
            'edbae1c2-62bc-42c1-ae0c-3110ab718f58': {
                id: 'edbae1c2-62bc-42c1-ae0c-3110ab718f58',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'ami',
                            upload_request: {
                                type: 'aws',
                                options: {}
                            }
                        }
                    ],
                },
                image_status: {
                    status: 'pending',
                },
            },
            '42ad0826-30b5-4f64-a24e-957df26fd564': {
                id: '42ad0826-30b5-4f64-a24e-957df26fd564',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'ami',
                            upload_request: {
                                type: 'aws',
                                options: {}
                            }
                        }
                    ],
                },
                image_status: {
                    status: 'building',
                },
            },
            '955944a2-e149-4058-8ac1-35b514cb5a16': {
                id: '955944a2-e149-4058-8ac1-35b514cb5a16',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'ami',
                            upload_request: {
                                type: 'aws',
                                options: {}
                            }
                        }
                    ],
                },
                image_status: {
                    status: 'uploading',
                },
            },
            'f7a60094-b376-4b58-a102-5c8c82dfd18b': {
                id: 'f7a60094-b376-4b58-a102-5c8c82dfd18b',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'ami',
                            upload_request: {
                                type: 'aws',
                                options: {}
                            }
                        }
                    ],
                },
                image_status: {
                    status: 'registering',
                },
            },
            '61b0effa-c901-4ee5-86b9-2010b47f1b22': {
                id: '61b0effa-c901-4ee5-86b9-2010b47f1b22',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'ami',
                            upload_request: {
                                type: 'aws',
                                options: {}
                            }
                        }
                    ],
                },
                image_status: {
                    status: 'failure',
                },
            },
            'ca03f120-9840-4959-871e-94a5cb49d1f2': {
                id: 'ca03f120-9840-4959-871e-94a5cb49d1f2',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'vhd',
                            upload_request: {
                                type: 'gcp',
                                options: {}
                            }
                        }
                    ],
                },
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
            },
            '551de6f6-1533-4b46-a69f-7924051f9bc6': {
                id: '551de6f6-1533-4b46-a69f-7924051f9bc6',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'vhd',
                            upload_request: {
                                type: 'azure',
                                options: {}
                            }
                        }
                    ],
                },
                image_status: {
                    status: 'building',
                },
            },
            '77fa8b03-7efb-4120-9a20-da66d68c4494': {
                id: '77fa8b03-7efb-4120-9a20-da66d68c4494',
                created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
                request: {
                    distribution: 'rhel-8',
                    image_requests: [
                        {
                            architecture: 'x86_64',
                            image_type: 'vhd',
                            upload_request: {
                                type: 'azure',
                                options: {
                                    tenant_id: 'test-tenant-id',
                                    subscription_id: 'test-subscription-id',
                                    resource_group: 'test-resource-group'
                                }
                            }
                        }
                    ],
                },
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
            }
        }
    }
};

describe('Images Table', () => {
    beforeEach(() => {
        renderWithReduxRouter(<ImagesTable />, store);
    });

    test('render ImagesTable', () => {
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

            const compose = store.composes.byId[col1];
            expect(compose).toBeTruthy();

            // date should match the month day and year of the timestamp.
            expect(row.cells[1]).toHaveTextContent('Apr 27, 2021');

            // render the expected <ImageBuildStatus /> and compare the text content
            let testElement = document.createElement('testElement');
            render(<Upload uploadType={ compose.request.image_requests[0].upload_request.type } />, { container: testElement });
            expect(row.cells[3]).toHaveTextContent(testElement.textContent);

            // render the expected <ImageBuildStatus /> and compare the text content
            render(<ImageBuildStatus status={ compose.image_status.status } />, { container: testElement });
            expect(row.cells[4]).toHaveTextContent(testElement.textContent);

            // render the expected <ImageLink /> and compare the text content for a link
            render(
                <ImageLink imageStatus={ compose.image_status } uploadOptions={ compose.request.image_requests[0].upload_request.options }  />,
                { container: testElement }
            );
            expect(row.cells[5]).toHaveTextContent(testElement.textContent);
        }
    });
});

describe('Images Table Toolbar', () => {
    beforeEach(() => {
        renderWithReduxRouter(<ImagesTable />, store);
    });
    test('render toolbar', () => {
        // check create image button
        screen.getByTestId('create-image-action');

        // check pagination renders
        screen.getByTestId('images-pagination');
    });
});
