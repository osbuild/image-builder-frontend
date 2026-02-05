import React, { useEffect, useState } from 'react';

import {
  Alert,
  ClipboardCopy,
  Content,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Title,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import Registration from './components/Registration';

import { useGetUser } from '../../../../Hooks';
import { selectIsOnPremise } from '../../../../store/envSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { changeOrgId } from '../../../../store/wizardSlice';

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
    <Form>
      <Content>
        <Title headingLevel='h1' size='xl'>
          Register
        </Title>
        <Content className='pf-v6-u-pb-md'>
          Configure registration settings for systems that will use this image.
        </Content>
        <Content className='pf-v6-u-pb-md'>
          {!isOnPremise && (
            <FormGroup label='Organization ID'>
              <ClipboardCopy
                hoverTip='Copy to clipboard'
                clickTip='Successfully copied to clipboard!'
                isReadOnly
                className='pf-v6-u-w-25'
              >
                {orgId || ''}
              </ClipboardCopy>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    If you&apos;re using an activation key with command line
                    registration, you must provide your organization&apos;s ID.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          )}
        </Content>
        <Registration onErrorChange={setShowAlert} />
      </Content>
      {showAlert && (
        <Alert title='Activation keys unavailable' variant='danger' isInline>
          Activation keys cannot be reached, try again later.
        </Alert>
      )}
    </Form>
  );
};

export default RegistrationStep;
