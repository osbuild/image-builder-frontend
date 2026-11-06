import { screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

import {
  clickWithWait,
  composeHandlers,
  createArchitecturesHandler,
  createUser,
  typeWithWait,
} from '@/test/testUtils';

import { renderCreateMode, testRadio } from './helpers';
import {
  createDefaultFetchHandler,
  fetchMock,
  mockArchitectures,
} from './mocks';

describe('Create Image Wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.enableMocks();
    fetchMock.mockResponse(createDefaultFetchHandler());
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test('renders component', async () => {
    await renderCreateMode();

    // check heading
    await screen.findByRole('heading', { name: /Build an image/ });

    // check navigation
    await screen.findByRole('button', { name: 'Base settings' });
    await screen.findByRole('button', { name: 'Repositories and packages' });
    await screen.findByRole('button', { name: 'Advanced settings' });
    await screen.findByRole('button', { name: 'Review' });
  });

  test('pressing Enter in the AWS account ID does not cause an unhandled form submission', async () => {
    await renderCreateMode();
    const user = createUser();

    await clickWithWait(
      user,
      await screen.findByRole('radio', { name: /Amazon Web Services/i }),
    );
    const accountIdInput = await screen.findByRole('textbox', {
      name: /aws account id/i,
    });
    const submitEvents: Event[] = [];
    const recordSubmit = (event: Event) => submitEvents.push(event);
    window.addEventListener('submit', recordSubmit);

    try {
      await typeWithWait(user, accountIdInput, '123456789012{Enter}');
    } finally {
      window.removeEventListener('submit', recordSubmit);
    }

    expect(accountIdInput).toBeInTheDocument();
    expect(accountIdInput).toHaveValue('123456789012');
    expect(submitEvents.every((event) => event.defaultPrevented)).toBe(true);
  });

  test('should only enable first navigation item in create mode', async () => {
    await renderCreateMode();

    const navigation = await screen.findByRole('navigation', {
      name: /wizard steps/i,
    });
    const baseNavItem = within(navigation).getByRole('button', {
      name: /base settings/i,
    });
    const contentNavItem = within(navigation).getByRole('button', {
      name: /repositories and packages/i,
    });
    const advancedNavItem = within(navigation).getByRole('button', {
      name: /advanced settings/i,
    });
    const reviewNavItem = within(navigation).getByRole('button', {
      name: /review/i,
    });

    expect(baseNavItem).toBeEnabled();
    expect(contentNavItem).toBeDisabled();
    expect(advancedNavItem).toBeDisabled();
    expect(reviewNavItem).toBeDisabled();
  });
});

describe('Keyboard accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.enableMocks();
    fetchMock.mockResponse(
      composeHandlers(
        createArchitecturesHandler({ architectures: mockArchitectures }),
        createDefaultFetchHandler(),
      ),
    );
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test('target environment radios are keyboard selectable', async () => {
    await renderCreateMode();

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', {
          name: /loading target environments/i,
        }),
      ).not.toBeInTheDocument(),
    );

    await testRadio(
      await screen.findByRole('radio', { name: /Amazon Web Services/i }),
    );
  });
});
