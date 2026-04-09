import React from 'react';

import { Alert, Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectFips } from '@/store/slices/wizard';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

const KernelStep = () => {
  const fips = useAppSelector(selectFips);

  const {
    kernel: { append: requiredByOpenSCAP },
  } = useSecuritySummary();

  return (
    <Form>
      <CustomizationLabels customization='kernel' />
      <Title
        headingLevel='h1'
        size='xl'
        className='pf-v6-u-display-flex pf-v6-u-align-items-center'
      >
        Kernel
        {requiredByOpenSCAP.length > 0 && (
          <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
            {requiredByOpenSCAP.length} Added by OpenSCAP
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
