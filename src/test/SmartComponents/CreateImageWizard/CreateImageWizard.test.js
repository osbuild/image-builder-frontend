import '@testing-library/jest-dom';

import React from 'react';
import { screen, getByText, waitFor } from '@testing-library/react';
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
            screen.getByRole('heading', { name: /Image Builder/ }),
            screen.getByText('Create a new image'),
        ]
    );
}

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
