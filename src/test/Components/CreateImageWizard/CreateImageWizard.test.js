import '@testing-library/jest-dom';

import React from 'react';
import { screen, waitFor, waitForElementToBeRemoved, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReduxRouter } from '../../testUtils';
import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import api from '../../../api.js';
import { RHEL_8 } from '../../../constants.js';

let history = undefined;
let store = undefined;

function verifyButtons() {
    // these buttons exist everywhere
    const next = screen.getByRole('button', { name: /Next/ });
    const back = screen.getByRole('button', { name: /Back/ });
    const cancel = screen.getByRole('button', { name: /Cancel/ });

    return [ next, back, cancel ];
}

function verifyCancelButton(cancel, history) {
    cancel.click();

    expect(history.location.pathname).toBe('/');
}

// packages
const mockPkgResult = {
    meta: { count: 100 },
    links: { first: '', last: '' },
    data: [
        {
            name: 'testPkg',
            summary: 'test package summary',
            version: '1.0',
        },
        {
            name: 'lib-test',
            summary: 'lib-test package summary',
            version: '1.0',
        },
        {
            name: 'test',
            summary: 'summary for test package',
            version: '1.0',
        }
    ]
};

const mockPkgResultEmpty = {
    meta: { count: 0 },
    links: { first: '', last: '' },
    data: null
};

const searchForAvailablePackages = async (searchbox, searchTerm) => {
    userEvent.type(searchbox, searchTerm);
    await act(async() => {
        screen.getByTestId('search-available-pkgs-button').click();
    });
};

const searchForChosenPackages = async (searchbox, searchTerm) => {
    if (!searchTerm) {
        userEvent.clear(searchbox);
    } else {
        userEvent.type(searchbox, searchTerm);
    }

    await act(async() => {
        screen.getByTestId('search-chosen-pkgs-button').click();
    });
};

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
    history = undefined;
});

// restore global mock
afterAll(() => {
    global.insights = undefined;
});

describe('Create Image Wizard', () => {
    beforeEach(async () => {
        window.HTMLElement.prototype.scrollTo = function() {};

        renderWithReduxRouter(<CreateImageWizard />);
    });

    test('renders component', () => {
        // check heading
        screen.getByRole('heading', { name: /Create image/ });

        screen.getByRole('button', { name: 'Image output' });
        screen.getByRole('button', { name: 'Registration' });
        screen.getByRole('button', { name: 'Review' });
    });
});

describe('Step Image output', () => {
    beforeEach(async () => {
        window.HTMLElement.prototype.scrollTo = function() {};

        history = renderWithReduxRouter(<CreateImageWizard />).history;

        const imageOutputLink = screen.getByRole('button', { name: 'Image output' });

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();

        // load from sidebar
        imageOutputLink.click();
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
        verifyCancelButton(cancel, history);
    });

    // test('allows chosing a release', () => {
    //     const release = screen.getByTestId('release-select');
    //     expect(release).toBeEnabled();

    //     userEvent.selectOptions(release, [ RHEL_8 ]);
    // });

    test('target environment is required', () => {
        const destination = screen.getByTestId('target-select');
        const required = within(destination).getByText('*');
        expect(destination).toBeEnabled();
        expect(destination).toContainElement(required);
    });
});

describe('Step Upload to AWS', () => {
    beforeEach(async () => {
        window.HTMLElement.prototype.scrollTo = function() {};

        history = renderWithReduxRouter(<CreateImageWizard />).history;

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();

        screen.getByRole('button', { name: /Next/ }).click();
    });

    test('clicking Next loads Registration', () => {
        userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Register the system');
    });

    test('clicking Back loads Release', () => {
        const [ , back, ] = verifyButtons();
        back.click();

        screen.getByTestId('upload-aws');
    });

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, history);
    });

    test('the aws account id fieldis shown and required', () => {
        const accessKeyId = screen.getByTestId('aws-account-id');
        expect(accessKeyId).toHaveValue('');
        expect(accessKeyId).toBeEnabled();
        // expect(accessKeyId).toBeRequired(); // DDf does not support required value
    });
});

describe('Step Upload to Google', () => {
    beforeEach(async () => {
        window.HTMLElement.prototype.scrollTo = function() {};

        history = renderWithReduxRouter(<CreateImageWizard />).history;

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-google');
        awsTile.click();

        screen.getByRole('button', { name: /Next/ }).click();
    });

    test('clicking Next loads Registration', () => {
        userEvent.type(screen.getByTestId('input-google-email'), 'test@test.com');
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Register the system');
    });

    test('clicking Back loads Release', () => {
        const [ , back, ] = verifyButtons();
        back.click();

        screen.getByTestId('upload-google');
    });

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, history);
    });

    test('the google account id field is shown and required', () => {
        const accessKeyId = screen.getByTestId('input-google-email');
        expect(accessKeyId).toHaveValue('');
        expect(accessKeyId).toBeEnabled();
        // expect(accessKeyId).toBeRequired(); // DDf does not support required value
    });

    test('the google email field must be a valid email', () => {
        const [ next, , ] = verifyButtons();
        userEvent.type(screen.getByTestId('input-google-email'), 'a');
        expect(next).toHaveClass('pf-m-disabled');
        expect(next).toBeDisabled();
        userEvent.type(screen.getByTestId('input-google-email'), 'test@test.com');
        expect(next).not.toHaveClass('pf-m-disabled');
        expect(next).toBeEnabled();
    });
});

describe('Step Upload to Azure', () => {
    beforeEach(async () => {
        window.HTMLElement.prototype.scrollTo = function() {};

        history = renderWithReduxRouter(<CreateImageWizard />).history;

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-azure');
        awsTile.click();
        screen.getByRole('button', { name: /Next/ }).click();
    });

    test('clicking Next loads Registration', () => {
        // Randomly generated GUID
        userEvent.type(screen.getByTestId('azure-tenant-id'), 'b8f86d22-4371-46ce-95e7-65c415f3b1e2');
        userEvent.type(screen.getByTestId('azure-subscription-id'), '60631143-a7dc-4d15-988b-ba83f3c99711');
        userEvent.type(screen.getByTestId('azure-resource-group'), 'testResourceGroup');

        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Register the system');
    });

    test('clicking Back loads Release', () => {
        const [ , back, ] = verifyButtons();
        back.click();

        screen.getByTestId('upload-azure');
    });

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, history);
    });

    test('the azure upload fields are shown and required', () => {
        const tenantId = screen.getByTestId('azure-tenant-id');
        expect(tenantId).toHaveValue('');
        expect(tenantId).toBeEnabled();
        // expect(tenantId).toBeRequired(); // DDf does not support required value

        const subscription = screen.getByTestId('azure-subscription-id');
        expect(subscription).toHaveValue('');
        expect(subscription).toBeEnabled();
        // expect(subscription).toBeRequired(); // DDf does not support required value

        const resourceGroup = screen.getByTestId('azure-resource-group');
        expect(resourceGroup).toHaveValue('');
        expect(resourceGroup).toBeEnabled();
        // expect(resourceGroup).toBeRequired(); // DDf does not support required value
    });
});

describe('Step Registration', () => {
    beforeEach(async() => {
        window.HTMLElement.prototype.scrollTo = function() {};

        history = renderWithReduxRouter(<CreateImageWizard />).history;

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();

        screen.getByRole('button', { name: /Next/ }).click();
        userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
        screen.getByRole('button', { name: /Next/ }).click();
    });

    test('clicking Next loads Packages', () => {
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Add optional additional packages to your image by searching available packages.');
    });

    test('clicking Back loads Upload to AWS', () => {
        const [ , back, ] = verifyButtons();
        back.click();

        screen.getByText('AWS account ID');
    });

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, history);
    });

    test('should allow choosing activation keys', async () => {
        const registrationRadio = screen.getByLabelText('Embed an activation key and register systems on first boot');
        userEvent.click(registrationRadio);

        await waitFor(() => {
            const organizationId = screen.getByLabelText('Organization ID');
            expect(organizationId).toHaveValue('5');
            expect(organizationId).toBeDisabled();
            // can't getByLabelText b/c the label contains an extra <span>
            // with a `*` to denote required
            const activationKey = screen.getByTestId('subscription-activation');
            expect(activationKey).toHaveValue('');
            expect(activationKey).toBeEnabled();
            // expect(activationKey).toBeRequired(); DDF does not support required fields
        });

        userEvent.type(screen.getByTestId('subscription-activation'), '012345678901');
        screen.getByRole('button', { name: /Next/ }).click();
        screen.getByRole('button', { name: /Next/ }).click();
        await screen.findByText('Register the system on first boot');
        await screen.findAllByText('012345678901');
    });

    test('should hide input fields when clicking Register the system later', async () => {
        // first check the other radio button which causes extra widgets to be shown
        const registrationRadio = screen.getByLabelText('Embed an activation key and register systems on first boot');
        userEvent.click(registrationRadio);

        const p1 = waitForElementToBeRemoved(() => [
            screen.getByTestId('organization-id'),
            screen.getByTestId('subscription-activation'),
        ]);

        // then click the first radio button which should remove any input fields
        const registerLaterRadio = screen.getByTestId('register-later-radio-button');
        userEvent.click(registerLaterRadio);

        await p1;

        const reviewLink = screen.getByRole('button', { name: 'Review' });
        reviewLink.click();
        screen.getByText('Register the system later');
    });
});

describe('Step Packages', () => {
    beforeEach(async () => {
        window.HTMLElement.prototype.scrollTo = function() {};

        history = renderWithReduxRouter(<CreateImageWizard />).history;

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();
        screen.getByRole('button', { name: /Next/ }).click();

        // aws step
        userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
        screen.getByRole('button', { name: /Next/ }).click();

        // registration next
        screen.getByRole('button', { name: /Next/ }).click();
    });

    test('clicking Next loads Review', () => {
        const [ next, , ] = verifyButtons();
        next.click();

        screen.getByText('Review the information and click "Create image" to create the image using the following criteria.');
    });

    test('clicking Back loads Register', () => {
        const back = screen.getByRole('button', { name: /Back/ });
        back.click();

        screen.getByText('Register the system');
    });

    test('clicking Cancel loads landing page', () => {
        const [ , , cancel ] = verifyButtons();
        verifyCancelButton(cancel, history);
    });

    test('should display search bar and button', () => {
        userEvent.type(screen.getByTestId('search-available-pkgs-input'), 'test');

        screen.getByRole('button', {
            name: 'Search button for available packages'
        });
    });

    test('should display default state', () => {
        screen.getByText('Search above to add additionalpackages to your image');
        screen.getByText('No packages added');
    });

    test('search results should be sorted with most relevant results first', async () => {
        const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

        searchbox.click();

        const getPackages = jest
            .spyOn(api, 'getPackages')
            .mockImplementation(() => Promise.resolve(mockPkgResult));

        await searchForAvailablePackages(searchbox, 'test');
        expect(getPackages).toHaveBeenCalledTimes(1);

        const availablePackages = screen.getByTestId('available-pkgs-list');
        expect(availablePackages.children.length).toEqual(3);
        const [ firstItem, secondItem, thirdItem ] = availablePackages.children;
        expect(firstItem).toHaveTextContent('testsummary for test package');
        expect(secondItem).toHaveTextContent('testPkgtest package summary');
        expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
    });

    test('search results should be sorted after selecting them and then deselecting them', async () => {
        const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

        searchbox.click();

        const getPackages = jest
            .spyOn(api, 'getPackages')
            .mockImplementation(() => Promise.resolve(mockPkgResult));

        await searchForAvailablePackages(searchbox, 'test');
        expect(getPackages).toHaveBeenCalledTimes(1);

        screen.getByRole('option', { name: /testPkg test package summary/ }).click();
        screen.getByRole('button', { name: /Add selected/ }).click();

        screen.getByRole('option', { name: /testPkg test package summary/ }).click();
        screen.getByRole('button', { name: /Remove selected/ }).click();

        const availablePackages = screen.getByTestId('available-pkgs-list');
        expect(availablePackages.children.length).toEqual(3);
        const [ firstItem, secondItem, thirdItem ] = availablePackages.children;
        expect(firstItem).toHaveTextContent('testsummary for test package');
        expect(secondItem).toHaveTextContent('testPkgtest package summary');
        expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
    });

    test('search results should be sorted after adding and then removing all packages', async () => {
        const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

        searchbox.click();

        const getPackages = jest
            .spyOn(api, 'getPackages')
            .mockImplementation(() => Promise.resolve(mockPkgResult));

        await searchForAvailablePackages(searchbox, 'test');
        expect(getPackages).toHaveBeenCalledTimes(1);

        screen.getByRole('button', { name: /Add all/ }).click();
        screen.getByRole('button', { name: /Remove all/ }).click();

        const availablePackages = screen.getByTestId('available-pkgs-list');
        expect(availablePackages.children.length).toEqual(3);
        const [ firstItem, secondItem, thirdItem ] = availablePackages.children;
        expect(firstItem).toHaveTextContent('testsummary for test package');
        expect(secondItem).toHaveTextContent('testPkgtest package summary');
        expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
    });

    test('removing a single package updates the state correctly', async () => {
        const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
        searchbox.click();
        const getPackages = jest
            .spyOn(api, 'getPackages')
            .mockImplementation(() => Promise.resolve(mockPkgResult));

        await searchForAvailablePackages(searchbox, 'test');
        expect(getPackages).toHaveBeenCalledTimes(1);
        screen.getByRole('button', { name: /Add all/ }).click();

        // remove a single package
        screen.getByRole('option', { name: /lib-test lib-test package summary/ }).click();
        screen.getByRole('button', { name: /Remove selected/ }).click();

        // review page
        screen.getByRole('button', { name: /Next/ }).click();

        // await screen.findByTestId('chosen-packages-count');
        let chosen = await screen.findByTestId('chosen-packages-count');
        expect(chosen).toHaveTextContent('2');

        // remove another package
        screen.getByRole('button', { name: /Back/ }).click();
        await screen.findByTestId('search-available-pkgs-input');
        screen.getByRole('option', { name: /summary for test package/ }).click();
        screen.getByRole('button', { name: /Remove selected/ }).click();

        // review page
        screen.getByRole('button', { name: /Next/ }).click();

        // await screen.findByTestId('chosen-packages-count');
        chosen = await screen.findByTestId('chosen-packages-count');
        expect(chosen).toHaveTextContent('1');
    });

    test('should display empty available state on failed search', async () => {
        const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

        searchbox.click();

        const getPackages = jest
            .spyOn(api, 'getPackages')
            .mockImplementation(() => Promise.resolve(mockPkgResultEmpty));

        await searchForAvailablePackages(searchbox, 'asdf');
        expect(getPackages).toHaveBeenCalledTimes(1);
        screen.getByText('No packages found');
    });

    test('should display empty chosen state on failed search', async () => {
        const searchboxAvailable = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
        const searchboxChosen = screen.getAllByRole('textbox')[1];

        const getPackages = jest
            .spyOn(api, 'getPackages')
            .mockImplementation(() => Promise.resolve(mockPkgResult));

        searchboxAvailable.click();
        await searchForAvailablePackages(searchboxAvailable, 'test');
        expect(getPackages).toHaveBeenCalledTimes(1);

        screen.getByRole('button', { name: /Add all/ }).click();

        searchboxChosen.click();
        await searchForChosenPackages(searchboxChosen, 'asdf');
        screen.getByText('No packages found');
        // We need to clear this input in order to not have sideeffects on other tests
        await searchForChosenPackages(searchboxChosen, '');
    });

    test('should filter chosen packages from available list', async () => {
        const searchboxAvailable = screen.getAllByRole('textbox')[0];

        const getPackages = jest
            .spyOn(api, 'getPackages')
            .mockImplementation(() => Promise.resolve(mockPkgResult));

        searchboxAvailable.click();
        await searchForAvailablePackages(searchboxAvailable, 'test');
        expect(getPackages).toHaveBeenCalledTimes(1);

        const availablePackages = screen.getByTestId('available-pkgs-list');
        expect(availablePackages.children.length).toEqual(3);

        screen.getByRole('option', { name: /testPkg test package summary/ }).click();
        screen.getByRole('button', { name: /Add selected/ }).click();

        const chosenPackages = screen.getByTestId('chosen-pkgs-list');
        expect(availablePackages.children.length).toEqual(2);
        expect(chosenPackages.children.length).toEqual(1);

        searchboxAvailable.click();
        await searchForAvailablePackages(searchboxAvailable, 'test');
        expect(getPackages).toHaveBeenCalledTimes(2);
        expect(availablePackages.children.length).toEqual(2);
        expect(chosenPackages.children.length).toEqual(1);
    });
});

describe('Step Review', () => {
    beforeEach(async () => {
        window.HTMLElement.prototype.scrollTo = function() {};

        history = renderWithReduxRouter(<CreateImageWizard />).history;

        // select aws as upload destination
        const awsTile = screen.getByTestId('upload-aws');
        awsTile.click();
        screen.getByRole('button', { name: /Next/ }).click();

        // aws step
        userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
        screen.getByRole('button', { name: /Next/ }).click();

        // skip registration
        screen.getByRole('button', { name: /Next/ }).click();

        //Skip packages
        screen.getByRole('button', { name: /Next/ }).click();
    });

    test('has 3 buttons', () => {
        screen.getByRole('button', { name: /Create/ });
        screen.getByRole('button', { name: /Back/ });
        screen.getByRole('button', { name: /Cancel/ });
    });

    test('clicking Back loads Packages', () => {
        const back = screen.getByRole('button', { name: /Back/ });
        back.click();

        screen.getByText('Add optional additional packages to your image by searching available packages.');
    });

    test('clicking Cancel loads landing page', () => {
        const cancel = screen.getByRole('button', { name: /Cancel/ });
        verifyCancelButton(cancel, history);
    });

    test('has three tabs', async () => {
        const buttonTarget = screen.getByTestId('tab-target');
        const buttonRegistration = screen.getByTestId('tab-registration');
        const buttonSystem = screen.getByTestId('tab-system');

        userEvent.click(buttonTarget);
        screen.getByRole('heading', {
            name: 'Amazon Web Services'
        });
        userEvent.click(buttonRegistration);
        screen.getByText('Register the system later');
        userEvent.click(buttonSystem);
        screen.getByRole('heading', {
            name: 'Packages'
        });
    });
});

describe('Click through all steps', () => {
    beforeEach(async () => {
        window.HTMLElement.prototype.scrollTo = function() {};

        const rendered = renderWithReduxRouter(<CreateImageWizard />);
        history = rendered.history;
        store = rendered.reduxStore;
    });

    test('with valid values', async () => {
        const next = screen.getByRole('button', { name: /Next/ });

        // select image output
        // userEvent.selectOptions(screen.getByTestId('release-select'), [ RHEL_8 ]);
        screen.getByTestId('upload-aws').click();
        screen.getByTestId('upload-azure').click();
        screen.getByTestId('upload-google').click();

        screen.getByRole('button', { name: /Next/ }).click();
        userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
        screen.getByRole('button', { name: /Next/ }).click();

        userEvent.type(screen.getByTestId('input-google-email'), 'test@test.com');
        screen.getByRole('button', { name: /Next/ }).click();

        // Randomly generated GUID
        userEvent.type(screen.getByTestId('azure-tenant-id'), 'b8f86d22-4371-46ce-95e7-65c415f3b1e2');
        userEvent.type(screen.getByTestId('azure-subscription-id'), '60631143-a7dc-4d15-988b-ba83f3c99711');
        userEvent.type(screen.getByTestId('azure-resource-group'), 'testResourceGroup');
        screen.getByRole('button', { name: /Next/ }).click();

        // registration
        const registrationRadio = screen.getByLabelText('Embed an activation key and register systems on first boot');
        userEvent.click(registrationRadio);
        userEvent.type(screen.getByTestId('subscription-activation'), '1234567890');
        next.click();

        // packages
        const getPackages = jest
            .spyOn(api, 'getPackages')
            .mockImplementation(() => Promise.resolve(mockPkgResult));

        screen.getByText('Add optional additional packages to your image by searching available packages.');
        await searchForAvailablePackages(screen.getByTestId('search-available-pkgs-input'), 'test');
        expect(getPackages).toHaveBeenCalledTimes(1);
        screen.getByRole('option', { name: /testPkg test package summary/ }).click();
        screen.getByRole('button', { name: /Add selected/ }).click();
        next.click();

        // review
        await screen.
            findByText('Review the information and click "Create image" to create the image using the following criteria.');
        await screen.findAllByText('Amazon Web Services');
        await screen.findAllByText('Google Cloud Platform');
        await screen.findByText('Register the system on first boot');

        // mock the backend API
        let ids = [];
        const composeImage = jest
            .spyOn(api, 'composeImage')
            .mockImplementation(body => {
                let id;
                if (body.image_requests[0].upload_request.type === 'aws') {
                    expect(body).toEqual({
                        distribution: RHEL_8,
                        image_requests: [{
                            architecture: 'x86_64',
                            image_type: 'ami',
                            upload_request: {
                                type: 'aws',
                                options: {
                                    share_with_accounts: [ '012345678901' ],
                                }
                            },
                        }],
                        customizations: {
                            packages: [ 'testPkg' ],
                            subscription: {
                                'activation-key': '1234567890',
                                insights: true,
                                organization: 5,
                                'server-url': 'subscription.rhsm.redhat.com',
                                'base-url': 'https://cdn.redhat.com/'
                            },
                        },
                    });
                    id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f56';
                } else if (body.image_requests[0].upload_request.type === 'gcp') {
                    expect(body).toEqual({
                        distribution: RHEL_8,
                        image_requests: [{
                            architecture: 'x86_64',
                            image_type: 'vhd',
                            upload_request: {
                                type: 'gcp',
                                options: {
                                    share_with_accounts: [ 'user:test@test.com' ],
                                }
                            },
                        }],
                        customizations: {
                            packages: [ 'testPkg' ],
                            subscription: {
                                'activation-key': '1234567890',
                                insights: true,
                                organization: 5,
                                'server-url': 'subscription.rhsm.redhat.com',
                                'base-url': 'https://cdn.redhat.com/'
                            },
                        },
                    });
                    id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f57';
                } else if (body.image_requests[0].upload_request.type === 'azure') {
                    expect(body).toEqual({
                        distribution: RHEL_8,
                        image_requests: [{
                            architecture: 'x86_64',
                            image_type: 'vhd',
                            upload_request: {
                                type: 'azure',
                                options: {
                                    tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
                                    subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
                                    resource_group: 'testResourceGroup',
                                }
                            },
                        }],
                        customizations: {
                            packages: [ 'testPkg' ],
                            subscription: {
                                'activation-key': '1234567890',
                                insights: true,
                                organization: 5,
                                'server-url': 'subscription.rhsm.redhat.com',
                                'base-url': 'https://cdn.redhat.com/'
                            },
                        },
                    });
                    id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f58';
                }

                ids.unshift(id);
                return Promise.resolve({ id });
            });

        const create = screen.getByRole('button', { name: /Create/ });
        create.click();

        // API request sent to backend
        await expect(composeImage).toHaveBeenCalledTimes(3);

        // returns back to the landing page
        await waitFor(() => expect(history.location.pathname).toBe('/'));
        expect(store.getStore().getState().composes.allIds).toEqual(ids);
    });

    test('with missing values', async () => {
        const next = screen.getByRole('button', { name: /Next/ });

        // select release
        // userEvent.selectOptions(screen.getByTestId('release-select'), [ RHEL_8 ]);
        screen.getByTestId('upload-aws').click();
        next.click();

        // leave AWS account id empty
        screen.getByRole('button', { name: /Next/ }).click();
        expect(screen.queryByText('Embed an activation key and register systems on first boot')).not.toBeInTheDocument();

        // fill in AWS to proceed
        userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
        screen.getByRole('button', { name: /Next/ }).click();

        // registration
        const registrationRadio = screen.getByLabelText('Embed an activation key and register systems on first boot');
        userEvent.click(registrationRadio);
        userEvent.clear(screen.getByTestId('subscription-activation'));
        next.click();

        expect(screen.queryByText(
            'Review the information and click "Create image" to create the image using the following criteria.'
        )).not.toBeInTheDocument();

        // fill in the registration
        await screen.findByTestId('subscription-activation');
        userEvent.type(screen.getByTestId('subscription-activation'), '1234567890');
        screen.getByRole('button', { name: /Next/ }).click();
        screen.getByRole('button', { name: /Next/ }).click();

        await screen.
            findByText('Review the information and click "Create image" to create the image using the following criteria.');
        // review
        await screen.findAllByText('Amazon Web Services');
        await screen.findByText('Register the system on first boot');
    });

    test('with invalid values', async () => {

        // select release
        // userEvent.selectOptions(screen.getByTestId('release-select'), [ RHEL_8 ]);
        // select upload target
        screen.getByTestId('upload-aws').click();
        screen.getByRole('button', { name: /Next/ }).click();

        userEvent.type(screen.getByTestId('aws-account-id'), 'invalid, non');
        screen.getByRole('button', { name: /Next/ }).click();

        // registration
        const registrationRadio = screen.getByLabelText('Embed an activation key and register systems on first boot');
        userEvent.click(registrationRadio);
        userEvent.clear(screen.getByTestId('subscription-activation'));
        screen.getByRole('button', { name: /Next/ }).click();

        expect(screen.queryByText(
            'Review the information and click "Create image" to create the image using the following criteria.'
        )).not.toBeInTheDocument();

        // fill in the registration
        await screen.findByTestId('subscription-activation');
        userEvent.type(screen.getByTestId('subscription-activation'), '1234567890');
        screen.getByRole('button', { name: /Next/ }).click();
        screen.getByRole('button', { name: /Next/ }).click();

        await screen.
            findByText('Review the information and click "Create image" to create the image using the following criteria.');
        await screen.findAllByText('Amazon Web Services');
        await screen.findByText('Register the system on first boot');
    });
});
