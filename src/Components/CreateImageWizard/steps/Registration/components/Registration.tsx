import React from 'react';

import { Content, FormGroup, Radio, Switch } from '@patternfly/react-core';

import ActivationKeysList from './ActivationKeysList';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeRegistrationType,
  selectRegistrationType,
} from '../../../../../store/wizardSlice';

const Registration = () => {
  const dispatch = useAppDispatch();
  const registrationType = useAppSelector(selectRegistrationType);

  return (
    <FormGroup label='Registration method'>
      <Radio
        label='Automatically register and enable advanced capabilities.'
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
        className='pf-v6-u-pb-sm'
        body={
          <>
            <Content component='p'>
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
            <Content component='p'>
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
                <Content component='p'>
                  <ActivationKeysList />
                </Content>
              )}
          </>
        }
      />
      <Radio
        label='Register later'
        isChecked={registrationType === 'register-later'}
        onChange={() => {
          dispatch(changeRegistrationType('register-later'));
        }}
        id='register-later'
        name='register-later'
      />
      <Radio
        label='Register with Satellite'
        isChecked={registrationType === 'register-satellite'}
        onChange={() => {
          dispatch(changeRegistrationType('register-satellite'));
        }}
        id='register-satellite'
        name='register-satellite'
      />
    </FormGroup>
  );
};

export default Registration;
