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

// TODO: this validator thinks asdf@asdf is a valid e-mail address, is that intentional or a bug?
export const isGcpEmailValid = (gcpShareWithAccount: string | undefined) => {
  if (
    gcpShareWithAccount !== undefined &&
    /^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$/.test(gcpShareWithAccount)
  ) {
    return true;
  }
  return false;
};
