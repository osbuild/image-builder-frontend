import { configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { mapRequestFromState } from '@/Components/CreateImageWizard/utilities/requestMapper';
import { serviceMiddleware, serviceReducer } from '@/store';
import { CreateBlueprintRequest, ImageRequest } from '@/store/api/backend';
import { initialState } from '@/store/slices/wizard';
import { clickWithWait, createUser, tabWithWait } from '@/test/testUtils';

import {
  checkHyperVGenValue,
  checkResourceGroupValue,
  checkSubscriptionIdValue,
  checkTenantGuidValue,
  clearInputValue,
  fillResourceGroupValue,
  fillSubscriptionIdValue,
  fillTenantGuidValue,
  openHyperVGenerationDropdown,
  renderAzureStep,
} from './helpers';

const createStoreWithAzureState = (
  overrides: Partial<typeof initialState> = {},
) => {
  return configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState: {
      wizard: {
        ...initialState,
        imageTypes: ['azure'],
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

describe('Azure Component', () => {
  describe('Rendering', () => {
    test('displays step components', async () => {
      renderAzureStep();

      expect(
        await screen.findByRole('button', { name: /Generation 2 \(UEFI\)/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByPlaceholderText(/Enter your 36-character GUID/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByPlaceholderText(/Enter your 36-character ID/i),
      ).toBeInTheDocument();
      expect(
        await screen.findByPlaceholderText(/Enter your resource group/i),
      ).toBeInTheDocument();
    });
  });

  describe('Hyper-V generation dropdown', () => {
    test('renders two options in the dropdown', async () => {
      renderAzureStep();
      const user = createUser();

      const hyperVDropdownToggle = await screen.findByRole('button', {
        name: /Generation 2 \(UEFI\)/i,
      });

      await clickWithWait(user, hyperVDropdownToggle);

      expect(
        await screen.findByRole('option', {
          name: /Hyper-V generation 1 \(BIOS\)/i,
        }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('option', {
          name: /Hyper-V generation 2 \(UEFI\)/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Tenant GUID Input', () => {
    test('does not show error for valid values', async () => {
      renderAzureStep();
      const user = createUser();

      await fillTenantGuidValue(user, '3cf15247-e9db-4ace-abad-e9f797347d00');

      expect(
        screen.queryByText(/Please enter a valid tenant ID/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Tenant ID is required/i),
      ).not.toBeInTheDocument();
    });

    test('displays error for invalid value', async () => {
      renderAzureStep();
      const user = createUser();

      await fillTenantGuidValue(user, 'invalid-guid');
      await tabWithWait(user);

      expect(
        await screen.findByText(/Please enter a valid tenant ID/i),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Tenant ID is required/i),
      ).not.toBeInTheDocument();
    });

    test('display error for empty value', async () => {
      renderAzureStep();
      const user = createUser();

      await fillTenantGuidValue(user, 'valid-value');
      await clearInputValue(user, /clear azure tenant guid input/i);
      await checkTenantGuidValue('');

      expect(
        screen.queryByText(/Please enter a valid tenant ID/i),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByText(/Tenant ID is required/i),
      ).toBeInTheDocument();
    });
  });

  describe('Subscription ID Input', () => {
    test('does not show error for valid values', async () => {
      renderAzureStep();
      const user = createUser();

      await fillSubscriptionIdValue(
        user,
        'e8134a71-ac0b-4fb8-81c0-4979240ce891',
      );

      expect(
        screen.queryByText(/Please enter a valid subscription ID/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Subscription ID is required/i),
      ).not.toBeInTheDocument();
    });

    test('displays error for invalid value', async () => {
      renderAzureStep();
      const user = createUser();

      await fillSubscriptionIdValue(user, 'invalid-id');
      await tabWithWait(user);

      expect(
        await screen.findByText(/Please enter a valid subscription ID/i),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Subscription ID is required/i),
      ).not.toBeInTheDocument();
    });

    test('display error for empty value', async () => {
      renderAzureStep();
      const user = createUser();

      await fillSubscriptionIdValue(user, 'valid-value');
      await clearInputValue(user, /clear subscription id input/i);
      await checkSubscriptionIdValue('');

      expect(
        screen.queryByText(/Please enter a valid subscription ID/i),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByText(/Subscription ID is required/i),
      ).toBeInTheDocument();
    });
  });

  describe('Resource Group Input', () => {
    test('does not show error for valid values', async () => {
      renderAzureStep();
      const user = createUser();

      await fillResourceGroupValue(user, 'resource-group-name');

      expect(
        screen.queryByText(
          /Resource group names only allow alphanumeric characters, periods, underscores, hyphens, and parenthesis and cannot end in a period/i,
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Resource group is required/i),
      ).not.toBeInTheDocument();
    });

    test('displays error for invalid value', async () => {
      renderAzureStep();
      const user = createUser();

      await fillResourceGroupValue(user, '**invalid-group**');
      await tabWithWait(user);

      expect(
        await screen.findByText(
          /Resource group names only allow alphanumeric characters, periods, underscores, hyphens, and parenthesis and cannot end in a period/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Resource group is required/i),
      ).not.toBeInTheDocument();
    });

    test('display error for empty value', async () => {
      renderAzureStep();
      const user = createUser();

      await fillResourceGroupValue(user, 'valid-group');
      await clearInputValue(user, /clear resource group input/i);
      await checkResourceGroupValue('');

      expect(
        screen.queryByText(
          /Resource group names only allow alphanumeric characters, periods, underscores, hyphens, and parenthesis and cannot end in a period/i,
        ),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByText(/Resource group is required/i),
      ).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders without pre-populated values', async () => {
      renderAzureStep();

      await checkHyperVGenValue('Generation 2 (UEFI)');
      await checkTenantGuidValue('');
      await checkSubscriptionIdValue('');
      await checkResourceGroupValue('');
    });

    test('renders with pre-populated values', async () => {
      renderAzureStep({
        azure: {
          tenantId: 'e4e46e25-3c82-4de8-8923-511d03cda11e',
          subscriptionId: 'ed0768a6-ed56-4bf3-bddd-5060460810e8',
          resourceGroup: 'test-resource-group',
          hyperVGeneration: 'V1',
        },
      });

      await checkHyperVGenValue('Generation 1 (BIOS)');
      await checkTenantGuidValue('e4e46e25-3c82-4de8-8923-511d03cda11e');
      await checkSubscriptionIdValue('ed0768a6-ed56-4bf3-bddd-5060460810e8');
      await checkResourceGroupValue('test-resource-group');
    });
  });

  describe('State Updates', () => {
    test('updates store when Hyper-V generation changes', async () => {
      const { store } = renderAzureStep();
      const user = createUser();

      expect(store.getState().wizard.azure.hyperVGeneration).toBe('V2');

      await openHyperVGenerationDropdown(user);
      await clickWithWait(
        user,
        await screen.findByRole('option', {
          name: /Hyper-V generation 1 \(BIOS\)/i,
        }),
      );

      expect(store.getState().wizard.azure.hyperVGeneration).toBe('V1');
    });

    test('updates store when tenant GUID changes', async () => {
      const { store } = renderAzureStep();
      const user = createUser();

      expect(store.getState().wizard.azure.tenantId).toBe(undefined);

      await fillTenantGuidValue(user, 'fcbaf465-9c7e-49df-ac4f-9f70c0bc5022');

      expect(store.getState().wizard.azure.tenantId).toBe(
        'fcbaf465-9c7e-49df-ac4f-9f70c0bc5022',
      );
    });

    test('updates store when subscription ID changes', async () => {
      const { store } = renderAzureStep();
      const user = createUser();

      expect(store.getState().wizard.azure.subscriptionId).toBe(undefined);

      await fillSubscriptionIdValue(
        user,
        '9023c919-2e5b-4213-a21a-c6e0ed5abb15',
      );

      expect(store.getState().wizard.azure.subscriptionId).toBe(
        '9023c919-2e5b-4213-a21a-c6e0ed5abb15',
      );
    });

    test('updates store when resource group changes', async () => {
      const { store } = renderAzureStep();
      const user = createUser();

      expect(store.getState().wizard.azure.resourceGroup).toBe(undefined);

      await fillResourceGroupValue(user, 'test-resource-group');

      expect(store.getState().wizard.azure.resourceGroup).toBe(
        'test-resource-group',
      );
    });
  });
});

describe('Azure CreateBlueprintRequest payload', () => {
  test('generates correct payload with default Hyper-V generation (V2)', () => {
    const store = createStoreWithAzureState({
      azure: {
        tenantId: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
        subscriptionId: '60631143-a7dc-4d15-988b-ba83f3c99711',
        resourceGroup: 'testResourceGroup',
        hyperVGeneration: 'V2',
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'azure',
      upload_request: {
        type: 'azure',
        options: {
          tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
          subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
          resource_group: 'testResourceGroup',
          hyper_v_generation: 'V2',
        },
      },
    };

    expect(request.image_requests).toHaveLength(1);
    expect(request.image_requests[0]).toEqual(
      expect.objectContaining(expectedImageRequest),
    );
  });

  test('generates correct payload with Hyper-V generation V1', () => {
    const store = createStoreWithAzureState({
      azure: {
        tenantId: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
        subscriptionId: '60631143-a7dc-4d15-988b-ba83f3c99711',
        resourceGroup: 'testResourceGroup',
        hyperVGeneration: 'V1',
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.image_requests).toHaveLength(1);
    expect(request.image_requests[0].image_type).toBe('azure');
    expect(request.image_requests[0].upload_request).toEqual({
      type: 'azure',
      options: {
        tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
        subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
        resource_group: 'testResourceGroup',
        hyper_v_generation: 'V1',
      },
    });
  });

  test('sets upload_request type to azure', () => {
    const store = createStoreWithAzureState({
      azure: {
        tenantId: 'e4e46e25-3c82-4de8-8923-511d03cda11e',
        subscriptionId: 'ed0768a6-ed56-4bf3-bddd-5060460810e8',
        resourceGroup: 'my-resource-group',
        hyperVGeneration: 'V2',
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.image_requests[0].upload_request.type).toBe('azure');
    expect(request.image_requests[0].image_type).toBe('azure');
  });

  test('defaults resource_group to empty string when undefined', () => {
    const store = createStoreWithAzureState({
      azure: {
        tenantId: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
        subscriptionId: '60631143-a7dc-4d15-988b-ba83f3c99711',
        resourceGroup: undefined,
        hyperVGeneration: 'V2',
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    const options = request.image_requests[0].upload_request.options;
    expect(options).toHaveProperty('resource_group', '');
  });

  test('includes all required Azure upload options', () => {
    const store = createStoreWithAzureState({
      azure: {
        tenantId: 'fcbaf465-9c7e-49df-ac4f-9f70c0bc5022',
        subscriptionId: '9023c919-2e5b-4213-a21a-c6e0ed5abb15',
        resourceGroup: 'production-rg',
        hyperVGeneration: 'V2',
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    const options = request.image_requests[0].upload_request.options;
    expect(options).toEqual({
      tenant_id: 'fcbaf465-9c7e-49df-ac4f-9f70c0bc5022',
      subscription_id: '9023c919-2e5b-4213-a21a-c6e0ed5abb15',
      resource_group: 'production-rg',
      hyper_v_generation: 'V2',
    });
  });

  test('sets architecture to x86_64 by default', () => {
    const store = createStoreWithAzureState({
      azure: {
        tenantId: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
        subscriptionId: '60631143-a7dc-4d15-988b-ba83f3c99711',
        resourceGroup: 'testResourceGroup',
        hyperVGeneration: 'V2',
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.image_requests[0].architecture).toBe('x86_64');
  });

  test('omits subscription customization when registration is register-later', () => {
    const store = createStoreWithAzureState({
      azure: {
        tenantId: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
        subscriptionId: '60631143-a7dc-4d15-988b-ba83f3c99711',
        resourceGroup: 'testResourceGroup',
        hyperVGeneration: 'V2',
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.customizations.subscription).toBeUndefined();
  });
});
