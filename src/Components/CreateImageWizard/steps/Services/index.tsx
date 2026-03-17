import React from 'react';

import { Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { useGetOscapCustomizationsQuery } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  selectComplianceProfileID,
  selectDistribution,
} from '@/store/slices/wizard';
import { asDistribution } from '@/store/typeGuards';

import ServicesInput from './components/ServicesInputs';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const ServicesStep = () => {
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

  const services = oscapProfileInfo?.services;
  let requiredByOpenSCAPCount = 0;

  if (services) {
    requiredByOpenSCAPCount =
      (services.disabled?.length ?? 0) +
      (services.masked?.length ?? 0) +
      (services.enabled?.length ?? 0);
  }

  return (
    <Form>
      <CustomizationLabels customization='services' />
      <Title
        headingLevel='h1'
        size='xl'
        className='pf-v6-u-display-flex pf-v6-u-align-items-center'
      >
        Systemd services
        {requiredByOpenSCAPCount > 0 && (
          <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
            {requiredByOpenSCAPCount} Added by OpenSCAP
          </Label>
        )}
      </Title>
      <Content>
        Configure systemd units to manage your system’s services and startup
        logic. Enable services to start at boot, disable them to prevent
        automatic starting, or mask them to completely block execution.
      </Content>
      <ServicesInput />
    </Form>
  );
};

export default ServicesStep;
