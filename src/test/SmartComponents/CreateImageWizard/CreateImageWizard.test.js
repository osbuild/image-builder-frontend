import '@testing-library/jest-dom';

import React from 'react';
import { screen, getByText, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReduxRouter } from '../../testUtils';
import CreateImageWizard from '../../../SmartComponents/CreateImageWizard/CreateImageWizard';
import api from '../../../api.js';

let historySpy = undefined;

function verifyButtons() {
    // these buttons exist everywhere
    const next = screen.getByRole('button', { name: /Next/ });
    const back = screen.getByRole('button', { name: /Back/ });
    const cancel = screen.getByRole('button', { name: /Cancel/ });

    return [ next, back, cancel ];
}

function verifyCancelButton(cancel, history) {
    cancel.click();

    // this goes back to the landing page
    // but jsdom will not render the new page so we can't assert on that
    expect(history).toHaveBeenCalledTimes(1);
    expect(history).toHaveBeenCalledWith('/landing');
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

afterEach(() => {
    jest.clearAllMocks();
    historySpy = undefined;
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
        screen.getByRole('heading', { name: /Create image/ });

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');

        getByText(sidebar, 'Image output');
        getByText(sidebar, 'Registration');
        getByText(sidebar, 'Review');
    });
});

describe('Step Image output', () => {
    beforeEach(() => {
        const { _component, history } = renderWithReduxRouter(<CreateImageWizard />);
        historySpy = jest.spyOn(history, 'push');

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');
        const anchor = getByText(sidebar, 'Image output');

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();
        // load from sidebar
        anchor.click();
    });

    test('clicking Next loads Upload to AWS', () => {
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('AWS account ID');
    });

    test('Back button is disabled', () => {
        const [ , back, ] = verifyButtons();

        // note: there is no `disabled` attribute and
        // .toBeDissabled() fails
        expect(back).toHaveClass('pf-m-disabled');
    });

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, historySpy);
    });

    test('allows chosing a release', () => {
        const release = screen.getByTestId('release-select');
        expect(release).toBeEnabled();

        userEvent.selectOptions(release, [ 'rhel-8' ]);
    });

    test('target environment is required', () => {
        const destination = screen.getByTestId('target-select');
        const required = within(destination).getByText('*');
        expect(destination).toBeEnabled();
        expect(destination).toContainElement(required);
    });
});

describe('Step Upload to AWS', () => {
    beforeEach(() => {
        const { _component, history } = renderWithReduxRouter(<CreateImageWizard />);
        historySpy = jest.spyOn(history, 'push');

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');
        const anchor = getByText(sidebar, 'Amazon Web Services');

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

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, historySpy);
    });

    test('the aws account id fieldis shown and required', () => {
        const accessKeyId = screen.getByTestId('aws-account-id');
        expect(accessKeyId).toHaveValue('');
        expect(accessKeyId).toBeEnabled();
        expect(accessKeyId).toBeRequired();
    });
});

describe('Step Registration', () => {
    beforeEach(() => {
        const { _component, history } = renderWithReduxRouter(<CreateImageWizard />);
        historySpy = jest.spyOn(history, 'push');

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');
        const anchor = getByText(sidebar, 'Registration');

        // load from sidebar
        anchor.click();
    });

    test('clicking Next loads Packages', () => {
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Optionally add additional packages to your image');
    });

    test('clicking Back loads Upload to AWS', () => {
        const [ , back, ] = verifyButtons();
        back.click();

        screen.getByText('AWS account ID');
    });

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, historySpy);
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

        const p1 = waitForElementToBeRemoved(() => [
            screen.getByTestId('organization-id'),
            screen.getByTestId('subscription-activation'),
        ]);

        // then click the first radio button which should remove any input fields
        screen
            .getByTestId('register-later-radio-button')
            .click();

        await p1;
    });
});

describe('Step Packages', () => {
    beforeEach(() => {
        const { _component, history } = renderWithReduxRouter(<CreateImageWizard />);
        historySpy = jest.spyOn(history, 'push');

        // left sidebar navigation
        const sidebar = screen.getByRole('navigation');
        const anchor = getByText(sidebar, 'Packages');

        // load from sidebar
        anchor.click();
    });

    test('clicking Next loads Review', () => {
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Review the information and click Create image to create the image using the following criteria.');
    });

    test('clicking Back loads Register', () => {
        const back = screen.getByRole('button', { name: /Back/ });
        back.click();

        screen.getByText('Register the system');
    });

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, historySpy);
    });

    test('should display search bar and button', () => {
        const search = screen.getByRole('searchbox', { name: 'Available search input' });
        search.click();

        userEvent.type(search, 'test');

        screen.getByRole('button', {
            name: 'Search button for available packages'
        });
    });
});

describe('Step Review', () => {
    beforeEach(() => {
        const { _component, history } = renderWithReduxRouter(<CreateImageWizard />);
        historySpy = jest.spyOn(history, 'push');

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();

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

    test('clicking Back loads Packages', () => {
        const back = screen.getByRole('button', { name: /Back/ });
        back.click();

        screen.getByText('Optionally add additional packages to your image');
    });

    test('clicking Cancel loads landing page', () => {
        const cancel = screen.getByRole('button', { name: /Cancel/ });
        verifyCancelButton(cancel, historySpy);
    });
});

describe('Click through all steps', () => {
    beforeEach(() => {
        const { _component, history } = renderWithReduxRouter(<CreateImageWizard />);
        historySpy = jest.spyOn(history, 'push');
    });

    test('with valid values', async () => {
        const next = screen.getByRole('button', { name: /Next/ });

        // select image output
        userEvent.selectOptions(screen.getByTestId('release-select'), [ 'rhel-8' ]);
        screen.getByTestId('upload-aws').click();
        next.click();

        // select upload target
        userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
        next.click();

        // registration
        screen
            .getByLabelText('Embed an activation key and register systems on first boot')
            .click();
        await screen.findByTestId('subscription-activation');
        userEvent.type(screen.getByTestId('subscription-activation'), '1234567890');
        next.click();

        // packages
        screen.getByText('Optionally add additional packages to your image');
        next.click();

        // review
        await screen.
            findByText('Review the information and click Create image to create the image using the following criteria.');
        const main = screen.getByRole('main', { name: 'Create image' });
        within(main).getByText('Amazon Web Services');
        await screen.findByText('Register the system on first boot');

        // mock the backend API
        const composeImage = jest.spyOn(api, 'composeImage');
        composeImage.mockResolvedValue({ id: 'test-me' });

        const create = screen.getByRole('button', { name: /Create/ });
        create.click();

        // API request sent to backend
        await expect(composeImage).toHaveBeenCalledTimes(1);

        // returns back to the landing page
        // but jsdom will not render the new page so we can't assert on that
        await waitFor(() => expect(historySpy).toHaveBeenCalledTimes(1));
        await expect(historySpy).toHaveBeenCalledWith('/landing');
    });

    test('with missing values', async () => {
        const next = screen.getByRole('button', { name: /Next/ });

        // select release
        userEvent.selectOptions(screen.getByTestId('release-select'), [ 'rhel-8' ]);
        screen.getByTestId('upload-aws').click();
        next.click();

        // leave AWS account id empty
        next.click();

        // registration
        screen
            .getByLabelText('Embed an activation key and register systems on first boot')
            .click();
        await screen.findByTestId('subscription-activation');
        userEvent.clear(screen.getByTestId('subscription-activation'));
        next.click();

        // packages
        screen.getByText('Optionally add additional packages to your image');
        next.click();

        await screen.
            findByText('Review the information and click Create image to create the image using the following criteria.');
        const main = screen.getByRole('main', { name: 'Create image' });
        within(main).getByText('Amazon Web Services');
        await screen.findByText('Register the system on first boot');

        const errorMessages = await screen.findAllByText('A value is required');
        expect(errorMessages.length).toBe(1);

        const uploadErrorMessage = await screen.findAllByText('A 12-digit number is required');
        expect(uploadErrorMessage.length).toBe(1);
    });

    test('with invalid values', async () => {
        const next = screen.getByRole('button', { name: /Next/ });

        // select release
        userEvent.selectOptions(screen.getByTestId('release-select'), [ 'rhel-8' ]);
        // select upload target
        screen.getByTestId('upload-aws').click();
        next.click();

        userEvent.type(screen.getByTestId('aws-account-id'), 'invalid, isNaN');
        next.click();

        // registration
        screen
            .getByLabelText('Embed an activation key and register systems on first boot')
            .click();
        await screen.findByTestId('subscription-activation');
        userEvent.clear(screen.getByTestId('subscription-activation'));
        next.click();

        // packages
        screen.getByText('Optionally add additional packages to your image');
        next.click();

        await screen.
            findByText('Review the information and click Create image to create the image using the following criteria.');
        const main = screen.getByRole('main', { name: 'Create image' });
        within(main).getByText('Amazon Web Services');
        await screen.findByText('Register the system on first boot');

        const errorMessages = await screen.findAllByText('A value is required');
        expect(errorMessages.length).toBe(1);

        const uploadErrorMessage = await screen.findAllByText('A 12-digit number is required');
        expect(uploadErrorMessage.length).toBe(1);
    });
});
