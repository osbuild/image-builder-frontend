import React, { useEffect, useState } from 'react';

import { Button, Popover, Spinner, Content } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

const PopoverActivation = () => {
  const { auth } = useChrome();
  const [orgId, setOrgId] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const userData = await auth?.getUser();
      const id = userData?.identity?.internal?.org_id;
      setOrgId(id);
    })();
  });

  return (
    <Popover
      hasAutoWidth
      maxWidth="35rem"
      bodyContent={
        <Content>
          <Content>
            Activation keys enable you to register a system with appropriate
            subscriptions, system purpose, and repositories attached.
          </Content>
          <Content>
            If using an activation key with command line registration, you must
            provide your organization&apos;s ID.
          </Content>
          {orgId ? (
            <Content>Your organization&apos;s ID is {orgId}</Content>
          ) : (
            <Spinner size="md" />
          )}
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant="plain"
        aria-label="Activation key popover"
        className="pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0 pf-v6-u-pr-0"
      />
    </Popover>
  );
};

export default PopoverActivation;
