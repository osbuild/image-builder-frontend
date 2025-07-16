import React from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { INSIGHTS_URL, RHC_URL } from '../../../../../constants';

const RegisterLaterAlert = () => {
  return (
    <Alert
      variant="info"
      title={
        <>
          You should register your image now if you may want to connect to Red
          Hat Insights at any point in the future. Otherwise, you&apos;ll need
          to revisit this step during the initial boot.
        </>
      }
    >
      <Content>
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          isInline
          href={INSIGHTS_URL}
        >
          About Red Hat Insights
        </Button>
      </Content>
      <Content>
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          isInline
          href={RHC_URL}
        >
          About Remote Host Configuration
        </Button>
      </Content>
    </Alert>
  );
};

export default RegisterLaterAlert;
