import { Partition } from './steps/FileSystem/FileSystemConfiguration';

export const isAwsAccountIdValid = (awsAccountId: string | undefined) => {
  return (
    awsAccountId !== undefined &&
    /^\d+$/.test(awsAccountId) &&
    awsAccountId.length === 12
  );
};

export const isAzureTenantGUIDValid = (azureTenantGUID: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    azureTenantGUID
  );
};

export const isAzureSubscriptionIdValid = (azureSubscriptionId: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    azureSubscriptionId
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

export const isFileSystemConfigValid = (partition: Partition[]) => {
  if (!partition) {
    return undefined;
  }
  const mpFreqs = {} as { [key: string]: number };
  for (const fs of partition) {
    const mp = fs.mountpoint;
    if (mp in mpFreqs) {
      mpFreqs[mp]++;
    } else {
      mpFreqs[mp] = 1;
    }
  }
  const duplicates = [];
  for (const [k, v] of Object.entries(mpFreqs)) {
    if (v > 1) {
      duplicates.push(k);
    }
  }
  const root = mpFreqs['/'] >= 1;
  return duplicates.length === 0 && root
    ? undefined
    : {
        duplicates: duplicates.length === 0 ? undefined : duplicates,
        root,
      };
};
