import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';

import { serviceMiddleware, serviceReducer } from '@/store';
import { ImageRequest } from '@/store/api/backend';
import { initialState, mapStateToRequest } from '@/store/slices/wizard';
import {
  clickWithWait,
  createUser,
  renderWithRedux,
  tabWithWait,
  typeWithWait,
} from '@/test/testUtils';

import {
  checkAccountTypeValue,
  checkPrincipalValue,
  fillPrincipalValue,
  renderGcpStep,
  selectAccountType,
} from './helpers';

import Gcp from '..';

const createStoreWithGcpState = (
  overrides: Partial<typeof initialState> = {},
) => {
  return configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState: {
      wizard: {
        ...initialState,
        output: {
          ...initialState.output,
          imageTypes: ['gcp'],
        },
        registration: {
          ...initialState.registration,
          type: 'register-later',
        },
        ...overrides,
      },
    },
  });
};

describe('GCP Component', () => {
  describe('Rendering', () => {
    test('displays step components', async () => {
      renderGcpStep();

      expect(
        await screen.findByRole('button', {
          name: /Select account type/i,
        }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('textbox', { name: /google principal/i }),
      ).toBeInTheDocument();
    });

    test('displays all account type options', async () => {
      renderGcpStep();
      const user = createUser();

      const accountTypeToggle = await screen.findByRole('button', {
        name: /Select account type/i,
      });
      await clickWithWait(user, accountTypeToggle);

      expect(
        await screen.findByRole('option', { name: /Google account/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('option', { name: /Service account/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('option', { name: /Google group/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('option', {
          name: /Google Workspace domain or Cloud Identity domain/i,
        }),
      ).toBeInTheDocument();
    });

    test('changes label based on account type', async () => {
      renderGcpStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'domain',
            domain: '',
          },
        },
      });

      expect(await screen.findByText('Domain')).toBeInTheDocument();
      expect(screen.queryByText('Principal')).not.toBeInTheDocument();
    });
  });

  describe('Account Type Selection', () => {
    test('updates store when account type changes', async () => {
      const { store } = renderGcpStep();
      const user = createUser();

      expect(store.getState().wizard.cloudProviders.gcp?.accountType).toBe(
        undefined,
      );

      await selectAccountType(user, 'Service account');

      expect(store.getState().wizard.cloudProviders.gcp?.accountType).toBe(
        'serviceAccount',
      );
    });

    test('selects Google account type', async () => {
      renderGcpStep();
      const user = createUser();

      await selectAccountType(user, 'Google account');

      await checkAccountTypeValue('Google account');
    });

    test('selects Service account type', async () => {
      renderGcpStep();
      const user = createUser();

      await selectAccountType(user, 'Service account');

      await checkAccountTypeValue('Service account');
    });

    test('selects Google group type', async () => {
      renderGcpStep();
      const user = createUser();

      await selectAccountType(user, 'Google group');

      await checkAccountTypeValue('Google group');
    });

    test('selects domain type', async () => {
      renderGcpStep();
      const user = createUser();

      await selectAccountType(
        user,
        'Google Workspace domain or Cloud Identity domain',
      );

      await checkAccountTypeValue('Google Workspace domain');
    });
  });

  describe('Principal/Domain Input', () => {
    test('does not show error for valid email', async () => {
      renderGcpStep();
      const user = createUser();

      await selectAccountType(user, 'Google account');
      await fillPrincipalValue(user, 'test@example.com');
      await tabWithWait(user);

      expect(screen.queryByText(/Invalid email/i)).not.toBeInTheDocument();
    });

    test('displays error for invalid email after blur', async () => {
      renderGcpStep();
      const user = createUser();

      await selectAccountType(user, 'Google account');
      const principalInput = await screen.findByRole('textbox', {
        name: /google principal/i,
      });
      await typeWithWait(user, principalInput, 'invalidemail');
      await tabWithWait(user);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
      });
    });

    test.each([
      ['Google account', 'Email is required'],
      [
        'Google Workspace domain or Cloud Identity domain',
        'Domain is required',
      ],
    ] as const)(
      'shows the required error for %s after blur',
      async (accountTypeLabel, errorMessage) => {
        renderGcpStep();
        const user = createUser();

        await selectAccountType(user, accountTypeLabel);
        const principalInput = await screen.findByRole('textbox', {
          name: /google principal/i,
        });
        await clickWithWait(user, principalInput);
        await tabWithWait(user);

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
      },
    );

    test('validates domain for domain account type', async () => {
      renderGcpStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'domain',
            domain: '',
          },
        },
      });
      const user = createUser();

      const principalInput = await screen.findByRole('textbox', {
        name: /google principal/i,
      });
      await typeWithWait(user, principalInput, 'example.com');
      await tabWithWait(user);

      expect(screen.queryByText(/Domain is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Invalid domain/i)).not.toBeInTheDocument();
    });

    test('displays domain error for invalid domain', async () => {
      renderGcpStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'domain',
            domain: '',
          },
        },
      });
      const user = createUser();

      const principalInput = await screen.findByRole('textbox', {
        name: /google principal/i,
      });
      await typeWithWait(user, principalInput, 'invalid domain!');
      await tabWithWait(user);

      await waitFor(() => {
        expect(screen.getByText(/Invalid domain/i)).toBeInTheDocument();
      });
    });
  });

  describe('Initial State', () => {
    test('renders without pre-populated values', async () => {
      renderGcpStep();

      await checkAccountTypeValue('Select account type');
      await checkPrincipalValue('');
    });

    test('renders with pre-populated values', async () => {
      renderGcpStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'serviceAccount',
            email: 'service@example.com',
          },
        },
      });

      await checkAccountTypeValue('Service account');
      await checkPrincipalValue('service@example.com');
    });
  });

  describe('State Updates', () => {
    test('updates store when principal changes', async () => {
      const { store } = renderGcpStep();
      const user = createUser();

      expect(store.getState().wizard.cloudProviders.gcp).toBeUndefined();

      await selectAccountType(user, 'Google account');
      await fillPrincipalValue(user, 'test@example.com');

      expect(store.getState().wizard.cloudProviders.gcp).toEqual({
        accountType: 'user',
        email: '',
      });

      await tabWithWait(user);

      expect(store.getState().wizard.cloudProviders.gcp).toEqual({
        accountType: 'user',
        email: 'test@example.com',
      });
    });

    test('resets draft when account type changes with an unchanged principal', async () => {
      renderGcpStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'domain',
            domain: '',
          },
        },
      });
      const user = createUser();

      await selectAccountType(user, 'Google account');
      await fillPrincipalValue(user, 'test@example.com');
      await tabWithWait(user);

      const clearButton = await screen.findByRole('button', {
        name: /clear/i,
      });
      await clickWithWait(user, clearButton);
      await fillPrincipalValue(user, 'example.com');
      await selectAccountType(
        user,
        'Google Workspace domain or Cloud Identity domain',
      );

      await checkPrincipalValue('');
    });

    test('clears principal on click and does not restore it on blur', async () => {
      const { store } = renderGcpStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'user',
            email: 'test@example.com',
          },
        },
      });
      const user = createUser();
      const principalInput = await screen.findByRole('textbox', {
        name: /google principal/i,
      });

      const clearButton = await screen.findByRole('button', {
        name: /clear/i,
      });
      await clickWithWait(user, clearButton);
      await checkPrincipalValue('');
      await clickWithWait(user, principalInput);
      await tabWithWait(user);

      expect(store.getState().wizard.cloudProviders.gcp).toEqual({
        accountType: 'user',
        email: '',
      });
    });
  });
});

describe('GCP CreateBlueprintRequest payload', () => {
  test('generates correct payload with Google account', () => {
    const store = createStoreWithGcpState({
      cloudProviders: {
        ...initialState.cloudProviders,
        gcp: {
          accountType: 'user',
          email: 'test@gmail.com',
        },
      },
    });

    const request = mapStateToRequest(store.getState());

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'gcp',
      upload_request: {
        type: 'gcp',
        options: {
          share_with_accounts: ['user:test@gmail.com'],
        },
      },
    };

    expect(request.image_requests).toHaveLength(1);
    expect(request.image_requests[0]).toEqual(
      expect.objectContaining(expectedImageRequest),
    );
  });

  test('generates correct payload with Service account', () => {
    const store = createStoreWithGcpState({
      cloudProviders: {
        ...initialState.cloudProviders,
        gcp: {
          accountType: 'serviceAccount',
          email: 'test@gmail.com',
        },
      },
    });

    const request = mapStateToRequest(store.getState());

    const options = request.image_requests[0].upload_request.options;
    expect(options).toHaveProperty('share_with_accounts', [
      'serviceAccount:test@gmail.com',
    ]);
  });

  test('generates correct payload with Google group', () => {
    const store = createStoreWithGcpState({
      cloudProviders: {
        ...initialState.cloudProviders,
        gcp: {
          accountType: 'group',
          email: 'test@gmail.com',
        },
      },
    });

    const request = mapStateToRequest(store.getState());

    const options = request.image_requests[0].upload_request.options;
    expect(options).toHaveProperty('share_with_accounts', [
      'group:test@gmail.com',
    ]);
  });

  test('generates correct payload with domain', () => {
    const store = createStoreWithGcpState({
      cloudProviders: {
        ...initialState.cloudProviders,
        gcp: {
          accountType: 'domain',
          domain: 'example.com',
        },
      },
    });

    const request = mapStateToRequest(store.getState());

    const options = request.image_requests[0].upload_request.options;
    expect(options).toHaveProperty('share_with_accounts', [
      'domain:example.com',
    ]);
  });

  test('sets upload_request type to gcp', () => {
    const store = createStoreWithGcpState({
      cloudProviders: {
        ...initialState.cloudProviders,
        gcp: {
          accountType: 'user',
          email: 'test@example.com',
        },
      },
    });

    const request = mapStateToRequest(store.getState());

    expect(request.image_requests[0].upload_request.type).toBe('gcp');
    expect(request.image_requests[0].image_type).toBe('gcp');
  });

  test('sets architecture to x86_64 by default', () => {
    const store = createStoreWithGcpState({
      cloudProviders: {
        ...initialState.cloudProviders,
        gcp: {
          accountType: 'user',
          email: 'test@example.com',
        },
      },
    });

    const request = mapStateToRequest(store.getState());

    expect(request.image_requests[0].architecture).toBe('x86_64');
  });

  test('omits subscription customization when registration is register-later', () => {
    const store = createStoreWithGcpState({
      cloudProviders: {
        ...initialState.cloudProviders,
        gcp: {
          accountType: 'user',
          email: 'test@example.com',
        },
      },
    });

    const request = mapStateToRequest(store.getState());

    expect(request.customizations.subscription).toBeUndefined();
  });
});

describe('Form submission', () => {
  test('pressing Enter in principal input does not cause an unhandled form submission', async () => {
    const { store } = renderWithRedux(
      <form onSubmit={(event) => event.preventDefault()}>
        <Gcp />
      </form>,
    );
    const user = createUser();

    await selectAccountType(user, 'Google account');
    const principalInput = await screen.findByRole('textbox', {
      name: /google principal/i,
    });
    const submitEvents: Event[] = [];
    const recordSubmit = (event: Event) => submitEvents.push(event);
    window.addEventListener('submit', recordSubmit);

    try {
      await typeWithWait(user, principalInput, 'user@example.com{Enter}');
    } finally {
      window.removeEventListener('submit', recordSubmit);
    }

    expect(submitEvents.length).toBeGreaterThan(0);
    expect(submitEvents.every((event) => event.defaultPrevented)).toBe(true);
    expect(principalInput).toBeInTheDocument();
    expect(store.getState().wizard.cloudProviders.gcp).toEqual({
      accountType: 'user',
      email: '',
    });

    await tabWithWait(user);

    expect(store.getState().wizard.cloudProviders.gcp).toEqual({
      accountType: 'user',
      email: 'user@example.com',
    });
  });
});
