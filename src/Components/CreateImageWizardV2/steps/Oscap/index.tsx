import React, { useEffect } from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';

import { Oscap } from './Oscap';

import { COMPLIANCE_AND_VULN_SCANNING_URL } from '../../../../constants';
import { imageBuilderApi } from '../../../../store/enhancedImageBuilderApi';
import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';

const OscapStep = () => {
  const prefetchOscapProfile = imageBuilderApi.usePrefetch(
    'getOscapProfiles',
    {}
  );
  const release = useAppSelector(selectDistribution);
  useEffect(() => {
    prefetchOscapProfile({ distribution: release });
  }, []);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        OpenSCAP profile
      </Title>
      <Text>
        OpenSCAP enables you to automatically monitor the adherence of your
        registered RHEL systems to a selected regulatory compliance profile.
        <br />
        <Button
          component="a"
          target="_blank"
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          isInline
          href={COMPLIANCE_AND_VULN_SCANNING_URL}
        >
          Documentation
        </Button>
      </Text>
      <Oscap />
    </Form>
  );
};

export default OscapStep;
