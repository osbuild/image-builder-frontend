import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useFlag } from '@/Utilities/useGetEnvironment';

import Snapshot from './components/Snapshot';

import ManageRepositoriesButton from '../Repositories/components/ManageRepositoriesButton';

const RepeatableBuildStep = () => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='repositories' />
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
          id='repeatable-build-section'
        >
          Enable repeatable build
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Create images that can be reproduced consistently with the same
          package versions and configurations. <ManageRepositoriesButton />
        </Content>
      </Content>
      <Snapshot />
    </Wrapper>
  );
};

export default RepeatableBuildStep;
