import React from 'react';

import { Alert, Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectFips } from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

const KernelStep = () => {
  const fips = useAppSelector(selectFips);

  const {
    kernel: { append: requiredByOpenSCAP },
  } = useSecuritySummary();

  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='kernel' />
      <Title
        headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
        size={isWizardRevampEnabled ? 'lg' : 'xl'}
        className='pf-v6-u-display-flex pf-v6-u-align-items-center'
      >
        Kernel
        {requiredByOpenSCAP.length > 0 && (
          <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
            {requiredByOpenSCAP.length} Added by OpenSCAP
          </Label>
        )}
      </Title>
      <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
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
    </Wrapper>
  );
};

export default KernelStep;
