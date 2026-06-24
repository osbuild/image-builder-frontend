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
  checkAccountIdValue,
  fillAccountIdValue,
  renderAwsStep,
} from './helpers';

const createStoreWithAwsState = (
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
          imageTypes: ['aws'],
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

describe('AWS Component', () => {
  describe('Rendering', () => {
    test('displays step components', async () => {
      renderAwsStep();

      expect(
        await screen.findByRole('textbox', { name: /aws account id/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('textbox', { name: /default region/i }),
      ).toBeInTheDocument();
    });

    test('displays helper text', async () => {
      renderAwsStep();

      expect(
        await screen.findByText(
          /Images are built in the default region but can be copied to other regions later/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('AWS Account ID Input', () => {
    test('does not show error for valid 12-digit account ID', async () => {
      renderAwsStep();
      const user = createUser();

      await fillAccountIdValue(user, '123456789012');

      expect(
        screen.queryByText(/AWS account ID is required/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Should be 12 characters long/i),
      ).not.toBeInTheDocument();
    });

    test('displays error for account ID with wrong length', async () => {
      renderAwsStep();
      const user = createUser();

      const accountIdInput = await screen.findByRole('textbox', {
        name: /aws account id/i,
      });
      await typeWithWait(user, accountIdInput, '12345');
      await tabWithWait(user);

      await waitFor(() => {
        expect(
          screen.getByText(/Should be 12 characters long/i),
        ).toBeInTheDocument();
      });
    });

    test('displays error for account ID with non-digits', async () => {
      renderAwsStep();
      const user = createUser();

      const accountIdInput = await screen.findByRole('textbox', {
        name: /aws account id/i,
      });
      await typeWithWait(user, accountIdInput, 'abc123456789');
      await tabWithWait(user);

      await waitFor(() => {
        expect(
          screen.getByText(/Should be 12 characters long/i),
        ).toBeInTheDocument();
      });
    });

    test('displays error when field is focused then blurred without input', async () => {
      renderAwsStep();
      const user = createUser();

      const accountIdInput = await screen.findByRole('textbox', {
        name: /aws account id/i,
      });
      accountIdInput.focus();
      await tabWithWait(user);

      await waitFor(() => {
        expect(
          screen.getByText(/AWS account ID is required/i),
        ).toBeInTheDocument();
      });
    });

    test('displays error when field is cleared after having a value', async () => {
      renderAwsStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          aws: {
            accountId: '123456789012',
            shareMethod: 'manual',
            source: undefined,
          },
        },
      });
      const user = createUser();

      const clearButton = await screen.findByRole('button', {
        name: /clear/i,
      });
      await clickWithWait(user, clearButton);
      await tabWithWait(user);

      await waitFor(() => {
        expect(
          screen.getByText(/AWS account ID is required/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Initial State', () => {
    test('renders without pre-populated values', async () => {
      renderAwsStep();

      await checkAccountIdValue('');
    });

    test('renders with pre-populated account ID', async () => {
      renderAwsStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          aws: {
            accountId: '123123123123',
            shareMethod: 'manual',
            source: undefined,
          },
        },
      });

      await checkAccountIdValue('123123123123');
    });
  });

  describe('State Updates', () => {
    test('updates store when account ID changes', async () => {
      const { store } = renderAwsStep();
      const user = createUser();

      expect(store.getState().wizard.cloudProviders.aws.accountId).toBe('');

      await fillAccountIdValue(user, '123456789012');

      expect(store.getState().wizard.cloudProviders.aws.accountId).toBe(
        '123456789012',
      );
    });

    test('clears account ID when clear button is clicked', async () => {
      const { store } = renderAwsStep({
        cloudProviders: {
          ...initialState.cloudProviders,
          aws: {
            accountId: '123456789012',
            shareMethod: 'manual',
            source: undefined,
          },
        },
      });
      const user = createUser();

      const clearButton = await screen.findByRole('button', {
        name: /clear/i,
      });
      await clickWithWait(user, clearButton);

      expect(store.getState().wizard.cloudProviders.aws.accountId).toBe('');
    });
  });
});

describe('AWS CreateBlueprintRequest payload', () => {
  test('generates correct payload with account ID', () => {
    const store = createStoreWithAwsState({
      cloudProviders: {
        ...initialState.cloudProviders,
        aws: {
          accountId: '123123123123',
          shareMethod: 'manual',
          source: undefined,
        },
      },
    });

    const request = mapRequestFromState(store) as CreateBlueprintRequest;

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'aws',
      upload_request: {
        type: 'aws',
        options: {
          share_with_accounts: ['123123123123'],
        },
      },
    };

    expect(request.image_requests).toHaveLength(1);
    expect(request.image_requests[0]).toEqual(
      expect.objectContaining(expectedImageRequest),
    );
  });

  test('sets upload_request type to aws', () => {
    const store = createStoreWithAwsState({
      cloudProviders: {
        ...initialState.cloudProviders,
        aws: {
          accountId: '999888777666',
          shareMethod: 'manual',
          source: undefined,
        },
      },
    });

    const request = mapRequestFromState(store) as CreateBlueprintRequest;

    expect(request.image_requests[0].upload_request.type).toBe('aws');
    expect(request.image_requests[0].image_type).toBe('aws');
  });

  test('includes account ID in share_with_accounts', () => {
    const store = createStoreWithAwsState({
      cloudProviders: {
        ...initialState.cloudProviders,
        aws: {
          accountId: '111222333444',
          shareMethod: 'manual',
          source: undefined,
        },
      },
    });

    const request = mapRequestFromState(store) as CreateBlueprintRequest;

    const options = request.image_requests[0].upload_request.options;
    expect(options).toHaveProperty('share_with_accounts', ['111222333444']);
  });

  test('sets architecture to x86_64 by default', () => {
    const store = createStoreWithAwsState({
      cloudProviders: {
        ...initialState.cloudProviders,
        aws: {
          accountId: '123123123123',
          shareMethod: 'manual',
          source: undefined,
        },
      },
    });

    const request = mapRequestFromState(store) as CreateBlueprintRequest;

    expect(request.image_requests[0].architecture).toBe('x86_64');
  });

  test('omits subscription customization when registration is register-later', () => {
    const store = createStoreWithAwsState({
      cloudProviders: {
        ...initialState.cloudProviders,
        aws: {
          accountId: '123123123123',
          shareMethod: 'manual',
          source: undefined,
        },
      },
    });

    const request = mapRequestFromState(store) as CreateBlueprintRequest;

    expect(request.customizations.subscription).toBeUndefined();
  });
});

describe('Form submission', () => {
  test('pressing Enter in account ID input does not trigger page reload', async () => {
    const { store } = renderAwsStep();
    const user = createUser();

    const accountIdInput = await screen.findByRole('textbox', {
      name: /aws account id/i,
    });
    await typeWithWait(user, accountIdInput, '123456789012{Enter}');

    expect(accountIdInput).toBeInTheDocument();
    expect(store.getState().wizard.cloudProviders.aws.accountId).toBe(
      '123456789012',
    );
  });
});
