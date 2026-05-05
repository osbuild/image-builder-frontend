import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectBlueprintMode } from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import UserInfo from './components/UserInfo';

type UsersStepProps = {
  attemptedNext?: boolean | undefined;
};

const UsersStep = ({ attemptedNext }: UsersStepProps) => {
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='users' />
      <Content>
        <Title headingLevel='h2' size='lg'>
          Users
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Create user accounts to manage access to your image. All usernames
          must be unique.
          {/* TO DO: learn more about accessing your SSH keys link */}
          {isOnPremise &&
            blueprintMode === 'image' &&
            ' You must create a user during the image build process to be able to log in.'}
        </Content>
      </Content>
      <UserInfo attemptedNext={attemptedNext} />
    </Wrapper>
  );
};

export default UsersStep;
