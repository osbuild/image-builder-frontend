import React, { useEffect, useState } from 'react';

import {
  Button,
  Popover,
  Spinner,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

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
        <TextContent>
          <Text>
            Activation keys enable you to register a system with appropriate
            subscriptions, system purpose, and repositories attached.
          </Text>
          <Text>
            If using an activation key with command line registration, you must
            provide your organization&apos;s ID.
          </Text>
          {orgId ? (
            <Text>Your organization&apos;s ID is {orgId}</Text>
          ) : (
            <Spinner size="md" />
          )}
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Activation key popover"
        aria-describedby="subscription-activation-key"
        className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0 pf-v5-u-pr-0"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

export default PopoverActivation;
