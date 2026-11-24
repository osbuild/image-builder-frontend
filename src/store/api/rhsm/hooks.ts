import { skipToken } from '@reduxjs/toolkit/query';

import { useAppSelector } from '@/store/hooks';
import {
  selectActivationKey,
  selectIsOnPremise,
  selectRegistrationType,
} from '@/store/slices';

import { useShowActivationKeyQuery } from './rhsmApi';

type Status = 'VALID' | 'INVALID' | 'FETCHING';

// NOTE: this is not feature complete, it is just mapping
// to existing behaviour. A more robust solution might
// be to create a custom rtk endpoint to handle this
// more gracefully, but I will leave that for a follow up
export const useVerifyActivationKey = (): Status => {
  const onprem = useAppSelector(selectIsOnPremise);
  const key = useAppSelector(selectActivationKey);
  const registrationType = useAppSelector(selectRegistrationType);
  const shouldCheck = !onprem && registrationType === 'register-now';

  const { isError, isFetching } = useShowActivationKeyQuery(
    // NOTE: we have to assert the key here, the should
    // check doesn't narrow this down enough
    shouldCheck && key ? { name: key } : skipToken,
  );

  if (!shouldCheck) return 'VALID';
  if (!key) return 'INVALID';
  if (isFetching) return 'FETCHING';
  if (isError) return 'INVALID';

  return 'VALID';
};
