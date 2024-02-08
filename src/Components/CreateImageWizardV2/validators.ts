export const isAwsAccountIdValid = (awsAccountId: string | undefined) => {
  return (
    awsAccountId !== undefined &&
    /^\d+$/.test(awsAccountId) &&
    awsAccountId.length === 12
  );
};

<<<<<<< HEAD
export const isAzureTenantGUIDValid = (azureTenantGUID: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    azureTenantGUID
  );
};

export const isAzureSubscriptionIdValid = (azureSubscriptionId: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    azureSubscriptionId
=======
export const isAzureTenantGUIDValid = (azureTenantGUID: string | undefined) => {
  return (
    azureTenantGUID !== undefined &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      azureTenantGUID
    )
  );
};

export const isAzureSubscriptionIdValid = (
  azureSubscriptionId: string | undefined
) => {
  return (
    azureSubscriptionId !== undefined &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      azureSubscriptionId
    )
  );
};

export const isAzureResourceGroupValid = (
  azureResourceGroup: string | undefined
) => {
  return (
    azureResourceGroup !== undefined &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      azureResourceGroup
    )
>>>>>>> 04343f8 (add some changes when user choose to fill source)
  );
};

export const isAzureResourceGroupValid = (azureResourceGroup: string) => {
  return /^[-\w._()]+[-\w_()]$/.test(azureResourceGroup);
};

export const isGcpEmailValid = (gcpShareWithAccount: string | undefined) => {
  return (
    gcpShareWithAccount !== undefined &&
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/.test(gcpShareWithAccount) &&
    gcpShareWithAccount.length <= 253
  );
};

export const isBlueprintNameValid = (blueprintName: string) =>
  blueprintName.length > 0 && blueprintName.length <= 100;

export const isBlueprintDescriptionValid = (blueprintDescription: string) => {
  return blueprintDescription.length <= 250;
};
