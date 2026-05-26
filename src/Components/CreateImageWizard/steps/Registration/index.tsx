import React, { useEffect, useState } from 'react';

import { Alert, Content, Title } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useGetUser } from '@/Hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { changeOrgId } from '@/store/slices/wizard';

import AnsibleAutomationPlatform from './components/AnsibleAutomationPlatform';
import Registration from './components/Registration';

const RegistrationStep = () => {
  const dispatch = useAppDispatch();
  const { auth } = useChrome();
  const { orgId } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!isOnPremise && orgId) {
      dispatch(changeOrgId(orgId));
    }
  }, [isOnPremise, orgId, dispatch]);

  return (
    <>
      <CustomizationLabels customization='registration' />
      <Content>
        <Title headingLevel='h2' size='lg' id='registration-section'>
          Register
        </Title>
        <Content component='small'>
          Configure registration settings for systems that will use this image.
        </Content>
      </Content>
      <Registration onErrorChange={setShowAlert} />
      <AnsibleAutomationPlatform />
      {showAlert && (
        <Alert title='Activation keys unavailable' variant='danger' isInline>
          Activation keys cannot be reached, try again later.
        </Alert>
      )}
    </>
  );
};

export default RegistrationStep;
