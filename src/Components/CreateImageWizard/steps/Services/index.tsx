import React from 'react';

import { Content, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectComplianceType } from '@/store/slices';

import ServicesInput from './components/ServicesInputs';

const ServicesStep = () => {
  const { services: requiredByOpenSCAP } = useSecuritySummary();
  const complianceType = useAppSelector(selectComplianceType);

  return (
    <>
      <CustomizationLabels customization='services' />
      <Content>
        <Title
          headingLevel='h2'
          size='lg'
          className='pf-v6-u-display-flex pf-v6-u-align-items-center'
        >
          Systemd services
          {requiredByOpenSCAP.total > 0 && (
            <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
              {requiredByOpenSCAP.total} Added by{' '}
              {complianceType === 'openscap' ? 'OpenSCAP' : 'compliance'}
            </Label>
          )}
        </Title>
        <Content component='small'>
          Configure systemd units to manage your system’s services and startup
          logic. Enable services to start at boot, disable them to prevent
          automatic starting, or mask them to completely block execution.
        </Content>
      </Content>
      <ServicesInput />
    </>
  );
};

export default ServicesStep;
