import React from 'react';

import {
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
import SatelliteRegistration from './components/SatelliteRegistration';

import { useGetUser } from '../../../../Hooks';
import { useAppSelector } from '../../../../store/hooks';
import { selectRegistrationType } from '../../../../store/wizardSlice';

const RegistrationStep = () => {
  const { auth } = useChrome();
  const { orgId } = useGetUser(auth);

  const registrationType = useAppSelector(selectRegistrationType);
  return (
    <Form>
      <Content>
        <Title headingLevel='h1' size='xl'>
          Register
        </Title>
        <Content component='p'>
          Configure registration settings for systems that will use this image.
        </Content>
        <Content component='p'>
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
        </Content>
        <Registration />
        {registrationType === 'register-satellite' && <SatelliteRegistration />}
      </Content>
    </Form>
  );
};

export default RegistrationStep;
