import { useEffect, useState } from 'react';

import { ChromeUser } from '@redhat-cloud-services/types';

import { selectIsOnPremise } from '../../store/envSlice';
import { useAppSelector } from '../../store/hooks';

export const useGetUser = (auth: { getUser(): Promise<void | ChromeUser> }) => {
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);
  const [orgId, setOrgId] = useState<string | undefined>(undefined);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  useEffect(() => {
    (async () => {
      if (!isOnPremise) {
        const data = await auth.getUser();
        const id = data?.identity.internal?.org_id;
        setUserData(data);
        setOrgId(id);
      }
    })();
  }, [isOnPremise]);

  return { userData, orgId };
};
