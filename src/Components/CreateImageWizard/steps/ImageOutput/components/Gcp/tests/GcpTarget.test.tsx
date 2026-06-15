import { configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';

import { mapRequestFromState } from '@/Components/CreateImageWizard/utilities/requestMapper';
import { serviceMiddleware, serviceReducer } from '@/store';
import { CreateBlueprintRequest, ImageRequest } from '@/store/api/backend';
import { initialState } from '@/store/slices/wizard';
import {
  clickWithWait,
  createUser,
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

const createStoreWithGcpState = (
  overrides: Partial<typeof initialState> = {},
) => {
  return configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState: {
      wizard: {
        ...initialState,
        imageTypes: ['gcp'],
        registration: {
          ...initialState.registration,
          registrationType: 'register-later',
        },
        ...overrides,
      },
    },
  });
};

const MOCK_ORG_ID = '5';

describe('GCP Component', () => {
  describe('Rendering', () => {
    test('displays step components', async () => {
      renderGcpStep();

      expect(
        await screen.findByRole('button', {
          name: /Google account/i,
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
        name: /Google account/i,
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
            email: '',
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

      expect(store.getState().wizard.cloudProviders.gcp.accountType).toBe(
        'user',
      );

      await selectAccountType(user, 'Service account');

      expect(store.getState().wizard.cloudProviders.gcp.accountType).toBe(
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

      await fillPrincipalValue(user, 'test@example.com');

      expect(
        screen.queryByText(/E-mail address is required/i),
      ).not.toBeInTheDocument();
    });

    test('displays error for invalid email after blur', async () => {
      renderGcpStep();
      const user = createUser();

      const principalInput = await screen.findByRole('textbox', {
        name: /google principal/i,
      });
      await typeWithWait(user, principalInput, 'invalidemail');
      await tabWithWait(user);

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter a valid e-mail address/i),
        ).toBeInTheDocument();
      });
    });

    test('validates domain for domain account type', async () => {
      renderGcpStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'domain',
            email: '',
          },
        },
      });
      const user = createUser();

      const principalInput = await screen.findByRole('textbox', {
        name: /google principal/i,
      });
      await typeWithWait(user, principalInput, 'example.com');

      expect(screen.queryByText(/Domain is required/i)).not.toBeInTheDocument();
    });

    test('displays domain error for invalid domain', async () => {
      renderGcpStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          gcp: {
            accountType: 'domain',
            email: '',
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
        expect(
          screen.getByText(/Please enter a valid domain/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Initial State', () => {
    test('renders without pre-populated values', async () => {
      renderGcpStep();

      await checkAccountTypeValue('Google account');
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

      expect(store.getState().wizard.cloudProviders.gcp.email).toBe('');

      await fillPrincipalValue(user, 'test@example.com');

      expect(store.getState().wizard.cloudProviders.gcp.email).toBe(
        'test@example.com',
      );
    });

    test('clears principal when clear button is clicked', async () => {
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

      const clearButton = await screen.findByRole('button', {
        name: /clear/i,
      });
      await clickWithWait(user, clearButton);

      expect(store.getState().wizard.cloudProviders.gcp.email).toBe('');
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

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

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

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

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

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

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
          email: 'example.com',
        },
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

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

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

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

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

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

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.customizations.subscription).toBeUndefined();
  });
});

describe('Form submission', () => {
  test('pressing Enter in principal input does not trigger page reload', async () => {
    const { store } = renderGcpStep();
    const user = createUser();

    const principalInput = await screen.findByRole('textbox', {
      name: /google principal/i,
    });
    await typeWithWait(user, principalInput, 'user@example.com{Enter}');

    expect(principalInput).toBeInTheDocument();
    expect(store.getState().wizard.cloudProviders.gcp.email).toBe(
      'user@example.com',
    );
  });
});
