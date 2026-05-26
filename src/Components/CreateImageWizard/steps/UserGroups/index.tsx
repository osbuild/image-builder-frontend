import React from 'react';

import { Content, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';

import GroupInfo from './components/GroupInfo';

type UserGroupsStepProps = {
  attemptedNext?: boolean | undefined;
};

const UserGroupsStep = ({ attemptedNext }: UserGroupsStepProps) => {
  return (
    <>
      <CustomizationLabels customization='users' />
      <Content>
        <Title headingLevel='h2' size='lg'>
          Groups
        </Title>
        <Content component='small'>
          Define groups to organize user permissions and shared resource access.
        </Content>
      </Content>
      <GroupInfo attemptedNext={attemptedNext} />
    </>
  );
};

export default UserGroupsStep;
