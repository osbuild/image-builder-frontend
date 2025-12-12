import { useEffect, useState } from 'react';

import { ChromeUser } from '@redhat-cloud-services/types';

export const useGetUser = (auth: { getUser(): Promise<void | ChromeUser> }) => {
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);
  const [orgId, setOrgId] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (!process.env.IS_ON_PREMISE) {
        const data = await auth.getUser();
        const id = data?.identity.internal?.org_id;
        setUserData(data);
        setOrgId(id);
      }
    })();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { userData, orgId };
};
