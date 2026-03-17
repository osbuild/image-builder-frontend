import React from 'react';

import { Alert, Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { useGetOscapCustomizationsQuery } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  selectComplianceProfileID,
  selectDistribution,
  selectFips,
} from '@/store/slices/wizard';
import { asDistribution } from '@/store/typeGuards';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const KernelStep = () => {
  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: asDistribution(release),
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    },
  );

  const requiredByOpenSCAPCount =
    oscapProfileInfo?.kernel?.append?.split(' ').filter(Boolean).length ?? 0;

  const fips = useAppSelector(selectFips);

  return (
    <Form>
      <CustomizationLabels customization='kernel' />
      <Title
        headingLevel='h1'
        size='xl'
        className='pf-v6-u-display-flex pf-v6-u-align-items-center'
      >
        Kernel
        {requiredByOpenSCAPCount > 0 && (
          <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
            {requiredByOpenSCAPCount} Added by OpenSCAP
          </Label>
        )}
      </Title>
      <Content>
        Choose a kernel package and append specific boot parameters to customize
        how your image initializes its core operating environment.
      </Content>
      {fips.enabled && (
        <Alert
          title='Kernel will be configured to use FIPS, no additional configuration needed.'
          variant='info'
          isInline
        />
      )}
      <KernelName />
      <KernelArguments />
    </Form>
  );
};

export default KernelStep;
