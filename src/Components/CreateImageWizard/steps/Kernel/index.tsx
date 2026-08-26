import React from 'react';

import { Alert, Content, Title } from '@patternfly/react-core';

import AddedByLabel from '@/Components/sharedComponents/AddedByLabel';
import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectComplianceType, selectFips } from '@/store/slices/wizard';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

const KernelStep = () => {
  const complianceType = useAppSelector(selectComplianceType);
  const fips = useAppSelector(selectFips);

  const {
    kernel: { append: requiredByOpenSCAP },
  } = useSecuritySummary();

  return (
    <>
      <CustomizationLabels customization='kernel' />
      <Content>
        <Title
          headingLevel='h2'
          size='lg'
          className='pf-v6-u-display-flex pf-v6-u-align-items-center'
        >
          Kernel
          <AddedByLabel
            count={requiredByOpenSCAP.length}
            complianceType={complianceType}
          />
        </Title>
        <Content component='small'>
          Choose a kernel package and append specific boot parameters to
          customize how your image initializes its core operating environment.
        </Content>
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
    </>
  );
};

export default KernelStep;
