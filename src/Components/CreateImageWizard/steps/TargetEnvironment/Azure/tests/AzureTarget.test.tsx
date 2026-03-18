import { screen } from '@testing-library/react';

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

describe('Azure Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderAzureStep();

      expect(
        await screen.findByRole('heading', {
          name: /Target environment - Microsoft Azure/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Upon build, Image Builder sends the image to the selected authorized Azure account./i,
        ),
      ).toBeInTheDocument();
    });

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
      await clearInputValue(user, 0);

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
      await clearInputValue(user, 1);

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
      await clearInputValue(user, 2);

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
