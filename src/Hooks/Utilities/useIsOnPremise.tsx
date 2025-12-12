export const useIsOnPremise = () => {
  return (
    process.env.IS_ON_PREMISE === 'true' ||
    // @ts-expect-error - webpack DefinePlugin may inject boolean true, not just string
    process.env.IS_ON_PREMISE === true
  );
};
