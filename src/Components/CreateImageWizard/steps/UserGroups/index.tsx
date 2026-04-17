import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { useFlag } from '@/Utilities/useGetEnvironment';

import GroupInfo from './components/GroupInfo';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

type UsersStepProps = {
  attemptedNext?: boolean | undefined;
};

const UserGroupsStep = ({ attemptedNext }: UsersStepProps) => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='users' />
      <Title headingLevel='h2' size='lg'>
        Groups
      </Title>
      <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
        Define groups to organize user permissions and shared resource access.
        <GroupInfo attemptedNext={attemptedNext} />
      </Content>
    </Wrapper>
  );
};

export default UserGroupsStep;
