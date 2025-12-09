import React from 'react';

import { Content, FormGroup, Radio, Switch } from '@patternfly/react-core';

import ActivationKeysList from './ActivationKeysList';
import { ManualActivationKey } from './ManualActivationKey';
import SatelliteRegistration from './SatelliteRegistration';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeRegistrationType,
  selectRegistrationType,
} from '../../../../../store/wizardSlice';
import { RegistrationProps } from '../registrationTypes';

const Registration = ({ onErrorChange }: RegistrationProps) => {
  const dispatch = useAppDispatch();
  const registrationType = useAppSelector(selectRegistrationType);

  return (
    <FormGroup label='Registration method'>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          label='Automatically register to Red Hat Hybrid Cloud Console and enable advanced capabilities.'
          isChecked={
            registrationType === 'register-now' ||
            registrationType === 'register-now-insights' ||
            registrationType === 'register-now-rhc'
          }
          onChange={(_event, checked) => {
            if (checked) {
              dispatch(changeRegistrationType('register-now-rhc'));
            }
          }}
          id='register-system-now'
          name='register-system-now'
          autoFocus
          body={
            <>
              <Content className='pf-v6-u-pb-sm'>
                <Switch
                  label='Enable predictive analytics and management capabilities'
                  isChecked={
                    registrationType === 'register-now-insights' ||
                    registrationType === 'register-now-rhc'
                  }
                  onChange={(_event, checked) => {
                    if (checked) {
                      dispatch(changeRegistrationType('register-now-insights'));
                    } else {
                      dispatch(changeRegistrationType('register-now'));
                    }
                  }}
                  id='register-system-now-insights'
                  name='register-system-insights'
                  hasCheckIcon
                />
              </Content>
              <Content className='pf-v6-u-pb-sm'>
                <Switch
                  label='Enable remote remediations and system management with automation'
                  isChecked={registrationType === 'register-now-rhc'}
                  onChange={(_event, checked) => {
                    if (checked) {
                      dispatch(changeRegistrationType('register-now-rhc'));
                    } else {
                      dispatch(changeRegistrationType('register-now-insights'));
                    }
                  }}
                  id='register-system-now-rhc'
                  name='register-system-rhc'
                  hasCheckIcon
                />
              </Content>
              {!process.env.IS_ON_PREMISE &&
                registrationType.startsWith('register-now') && (
                  <Content className='pf-v6-u-pb-sm'>
                    <ActivationKeysList onErrorChange={onErrorChange} />
                  </Content>
                )}
              {process.env.IS_ON_PREMISE &&
                registrationType.startsWith('register-now') && (
                  <Content className='pf-v6-u-pb-sm'>
                    <ManualActivationKey />
                  </Content>
                )}
            </>
          }
        />
      </Content>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          label='Register later'
          isChecked={registrationType === 'register-later'}
          onChange={() => {
            dispatch(changeRegistrationType('register-later'));
            onErrorChange(false);
          }}
          id='register-later'
          name='register-later'
        />
      </Content>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          label='Register to a Satellite or Capsule'
          isChecked={registrationType === 'register-satellite'}
          onChange={() => {
            dispatch(changeRegistrationType('register-satellite'));
            onErrorChange(false);
          }}
          id='register-satellite'
          name='register-satellite'
          body={
            registrationType === 'register-satellite' && (
              <SatelliteRegistration />
            )
          }
        />
      </Content>
    </FormGroup>
  );
};

export default Registration;
