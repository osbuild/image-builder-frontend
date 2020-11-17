import '@testing-library/jest-dom';

import React from 'react';
import { screen, getByText, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReduxRouter } from '../../testUtils';
import CreateImageWizard from '../../../SmartComponents/CreateImageWizard/CreateImageWizard';

function verifyButtons() {
    // these buttons exist everywhere
    const next = screen.getByRole('button', { name: /Next/ });
    const back = screen.getByRole('button', { name: /Back/ });
    const cancel = screen.getByRole('button', { name: /Cancel/ });

    return [ next, back, cancel ];
}

async function verifyCancelButton(cancel) {
    cancel.click();

    // this goes back to the landing page
    await waitFor(
        () => [
            screen.getByText('Create a new image'),
            screen.getByRole('button', { name: /Create image/ }),
        ]
    );
}

// mock the insights dependency
beforeAll(() => {
    global.insights = {
        chrome: {
            auth: {
                getUser: () => {
                    return {
                        identity: {
                            internal: {
                                org_id: 5
                            }
                        }
                    };
                }
            }
        }
    };
});

// restore global mock
afterAll(() => {
    global.insights = undefined;
});

describe('Create Image Wizard', () => {
    beforeEach(() => {
        renderWithReduxRouter(<CreateImageWizard />);
    });

    test('renders component', () => {
        // check heading
        screen.getByRole('heading', { name: /Create a new image/ });

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');

        getByText(sidebar, 'Release');
        getByText(sidebar, 'Target environment');
        getByText(sidebar, 'Registration');
        getByText(sidebar, 'Review');
    });
});

describe('Step Release', () => {
    beforeEach(() => {
        renderWithReduxRouter(<CreateImageWizard />);

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');
        const anchor = getByText(sidebar, 'Release');

        // load from sidebar
        anchor.click();
    });

    test('clicking Next loads Target environment', () => {
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Destination');
        screen.getByText('Secret access key');
    });

    test('Back button is disabled', () => {
        const [ , back, ] = verifyButtons();

        // note: there is no `disabled` attribute and
        // .toBeDissabled() fails
        expect(back).toHaveClass('pf-m-disabled');
    });

    test('clicking Cancel loads landing page', async () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel);
    });

    test('allows chosing a release', () => {
        const release = screen.getByTestId('release-select');
        expect(release).toBeEnabled();

        userEvent.selectOptions(release, [ 'rhel-8' ]);
    });
});

describe('Step Target environment', () => {
    beforeEach(() => {
        renderWithReduxRouter(<CreateImageWizard />);

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');
        const anchor = getByText(sidebar, 'Target environment');

        // load from sidebar
        anchor.click();
    });

    test('clicking Next loads Registration', () => {
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Register the system');
    });

    test('clicking Back loads Release', () => {
        const [ , back, ] = verifyButtons();
        back.click();

        screen.getByTestId('release-select');
    });

    test('clicking Cancel loads landing page', async () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel);
    });

    test('choosing S3 shows region and bucket fields', () => {
        // change the select to enable the bucket field
        userEvent.selectOptions(screen.getByTestId('aws-service-select'), [ 's3' ]);

        const destination = screen.getByTestId('upload-destination');
        expect(destination).toBeEnabled();
        expect(destination).toBeRequired();

        const accessKeyId = screen.getByTestId('aws-access-key');
        expect(accessKeyId).toHaveValue('');
        expect(accessKeyId).toBeEnabled();
        expect(accessKeyId).toBeRequired();

        const secretAccessKey = screen.getByTestId('aws-secret-access-key');
        expect(secretAccessKey).toHaveValue('');
        expect(secretAccessKey).toBeEnabled();
        expect(secretAccessKey).toBeRequired();

        const region = screen.getByTestId('aws-region');
        expect(region).toHaveValue('eu-west-2');
        expect(region).toBeEnabled();
        expect(region).toBeRequired();

        const bucket = screen.getByTestId('aws-bucket');
        expect(bucket).toHaveValue('');
        expect(bucket).toBeEnabled();
        expect(bucket).toBeRequired();
    });

    test('choosing EC2 shows region field', async () => {
        // change the select to enable the bucket field
        userEvent.selectOptions(screen.getByTestId('aws-service-select'), [ 's3' ]);

        const destination = screen.getByTestId('upload-destination');
        expect(destination).toBeEnabled();
        expect(destination).toBeRequired();

        const accessKeyId = screen.getByTestId('aws-access-key');
        expect(accessKeyId).toHaveValue('');
        expect(accessKeyId).toBeEnabled();
        expect(accessKeyId).toBeRequired();

        const secretAccessKey = screen.getByTestId('aws-secret-access-key');
        expect(secretAccessKey).toHaveValue('');
        expect(secretAccessKey).toBeEnabled();
        expect(secretAccessKey).toBeRequired();

        const region = screen.getByTestId('aws-region');
        expect(region).toHaveValue('eu-west-2');
        expect(region).toBeEnabled();
        expect(region).toBeRequired();

        const p1 = waitForElementToBeRemoved(() => screen.queryByTestId('aws-bucket'));

        // change the select to hide the bucket field
        userEvent.selectOptions(screen.getByTestId('aws-service-select'), [ 'ec2' ]);
        await p1;
    });
});

describe('Step Registration', () => {
    beforeEach(() => {
        renderWithReduxRouter(<CreateImageWizard />);

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');
        const anchor = getByText(sidebar, 'Registration');

        // load from sidebar
        anchor.click();
    });

    test('clicking Next loads Review', () => {
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Review the information and click Create image to create the image using the following criteria.');
    });

    test('clicking Back loads Target environment', () => {
        const [ , back, ] = verifyButtons();
        back.click();

        screen.getByText('Destination');
        screen.getByText('Secret access key');
    });

    test('clicking Cancel loads landing page', async () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel);
    });

    test('should allow choosing activation keys', () => {
        screen
            .getByLabelText('Embed an activation key and register systems on first boot')
            .click();

        const organizationId = screen.getByLabelText('Organization ID');
        expect(organizationId).toHaveValue('5');
        expect(organizationId).toBeDisabled();

        // can't getByLabelText b/c the label contains an extra <span>
        // with a `*` to denote required
        const activationKey = screen.getByTestId('subscription-activation');
        expect(activationKey).toHaveValue('');
        expect(activationKey).toBeEnabled();
        expect(activationKey).toBeRequired();
    });

    test('should hide input fields when clicking Register the system later', async () => {
        // first check the other radio button which causes extra widgets to be shown
        screen
            .getByLabelText('Embed an activation key and register systems on first boot')
            .click();

        const p1 = waitForElementToBeRemoved(() => screen.queryByTestId('organization-id'));
        const p2 = waitForElementToBeRemoved(() => screen.queryByTestId('subscription-activation'));

        // then click the first radio button which should remove any input fields
        screen
            .getByTestId('register-later-radio-button')
            .click();

        await p1;
        await p2;
    });
});

describe('Step Review', () => {
    beforeEach(() => {
        renderWithReduxRouter(<CreateImageWizard />);

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');
        const anchor = getByText(sidebar, 'Review');

        // load from sidebar
        anchor.click();
    });

    test('has 3 buttons', () => {
        screen.getByRole('button', { name: /Create/ });
        screen.getByRole('button', { name: /Back/ });
        screen.getByRole('button', { name: /Cancel/ });
    });

    // todo: add test for the Create button

    test('clicking Back loads Register', () => {
        const back = screen.getByRole('button', { name: /Back/ });
        back.click();

        screen.getByText('Register the system');
    });

    test('clicking Cancel loads landing page', async () => {
        const cancel = screen.getByRole('button', { name: /Cancel/ });
        verifyCancelButton(cancel);
    });
});

describe('Click through all steps', () => {
    beforeEach(() => {
        renderWithReduxRouter(<CreateImageWizard />);
    });

    test('with valid values', async () => {
        const next = screen.getByRole('button', { name: /Next/ });

        // select release
        userEvent.selectOptions(screen.getByTestId('release-select'), [ 'rhel-8' ]);
        next.click();

        // select upload target
        await screen.findByTestId('upload-destination');
        userEvent.selectOptions(screen.getByTestId('upload-destination'), [ 'aws' ]);
        userEvent.type(screen.getByTestId('aws-access-key'), 'key');
        userEvent.type(screen.getByTestId('aws-secret-access-key'), 'secret');
        userEvent.selectOptions(screen.getByTestId('aws-service-select'), [ 's3' ]);
        userEvent.type(screen.getByTestId('aws-region'), 'us-east-1');
        userEvent.type(screen.getByTestId('aws-bucket'), 'imagebuilder');
        next.click();

        // registration
        screen
            .getByLabelText('Embed an activation key and register systems on first boot')
            .click();
        await screen.findByTestId('subscription-activation');
        userEvent.type(screen.getByTestId('subscription-activation'), '1234567890');
        next.click();

        await screen.
            findByText('Review the information and click Create image to create the image using the following criteria.');
        await screen.findByText('rhel-8');
        await screen.findByText('aws');
        await screen.findByText('Register the system on first boot');
    });
});
