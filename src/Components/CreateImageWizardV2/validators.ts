export const isAwsAccountIdValid = (awsAccountId: string | undefined) => {
  return (
    awsAccountId !== undefined &&
    /^\d+$/.test(awsAccountId) &&
    awsAccountId.length === 12
  );
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
