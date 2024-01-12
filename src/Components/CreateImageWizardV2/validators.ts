export const isAwsAccountIdValid = (awsAccountId: string | undefined) => {
  if (
    awsAccountId !== undefined &&
    /^\d+$/.test(awsAccountId) &&
    awsAccountId.length === 12
  ) {
    return true;
  }
  return false;
};

export const isGcpEmailValid = (gcpShareWithAccount: string | undefined) => {
  if (
    gcpShareWithAccount !== undefined &&
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/.test(gcpShareWithAccount) &&
    gcpShareWithAccount.length <= 253
  ) {
    return true;
  }
  return false;
};
