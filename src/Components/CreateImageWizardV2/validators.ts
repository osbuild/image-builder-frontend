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
