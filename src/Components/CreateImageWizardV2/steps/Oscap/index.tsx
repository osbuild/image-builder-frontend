import React from 'react';

import { Form, Text, Title } from '@patternfly/react-core';

import { Oscap } from './Oscap';

import { imageBuilderApi } from '../../../../store/enhancedImageBuilderApi';
import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';
import DocumentationButton from '../../../sharedComponents/DocumentationButton';

const OscapStep = () => {
  const prefetchOscapProfile = imageBuilderApi.usePrefetch('getOscapProfiles');
  const release = useAppSelector(selectDistribution);
  prefetchOscapProfile({ distribution: release });

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        OpenSCAP profile
      </Title>
      <Text>
        Use OpenSCAP to monitor the adherence of your registered RHEL systems to
        a selected regulatory compliance profile
        <br />
        <DocumentationButton />
      </Text>
      <Oscap />
    </Form>
  );
};

export default OscapStep;
