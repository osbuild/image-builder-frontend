import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useFlag } from '@/Utilities/useGetEnvironment';

import GroupInfo from './components/GroupInfo';

type UserGroupsStepProps = {
  attemptedNext?: boolean | undefined;
};

const UserGroupsStep = ({ attemptedNext }: UserGroupsStepProps) => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='users' />
      <Content>
        <Title headingLevel='h2' size='lg'>
          Groups
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Define groups to organize user permissions and shared resource access.
        </Content>
      </Content>
      <GroupInfo attemptedNext={attemptedNext} />
    </Wrapper>
  );
};

export default UserGroupsStep;
