const onPremFlag = (flag: string): boolean => {
  switch (flag) {
    case 'image-builder.images-table-revamp.enabled':
      return true;
    default:
      return false;
  }
};

export const useGetEnvironment = () => ({
  isBeta: () => false,
  isProd: () => true,
});

export const useFlag = onPremFlag;

export const useFlagWithEphemDefault = (
  _flag: string,
  _ephemDefault: boolean = true,
): boolean => {
  return false;
};
