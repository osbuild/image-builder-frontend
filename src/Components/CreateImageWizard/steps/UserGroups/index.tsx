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
        Define groups before assigning users to them. Each group will be created
        on systems using this image. Each group will automatically be assigned
        an ID number.
      </Content>
      <GroupInfo attemptedNext={attemptedNext} />
    </Wrapper>
  );
};

export default UserGroupsStep;
