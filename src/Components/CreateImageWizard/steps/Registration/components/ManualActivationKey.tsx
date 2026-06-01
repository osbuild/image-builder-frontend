import React, { useEffect } from 'react';

import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Popover,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { ValidatedInput } from '@/Components/CreateImageWizard/ValidatedInput';
import { CDN_PROD_URL } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeActivationKey,
  changeBaseUrl,
  changeOrgId,
  changeServerUrl,
  selectActivationKey,
  selectOrgId,
} from '@/store/slices/wizard';

const ManualRegistrationPopover = () => {
  return (
    <Popover
      headerContent='About Activation Keys & Organization ID'
      position='right'
      minWidth='30rem'
      bodyContent={
        <Content>
          <Content component={ContentVariants.p}>
            Activation keys assist you in registering and configuring systems.
            Metadata such as role, system purpose, and usage can be
            automatically attached to systems via an activation key, and
            monitored with Subscription Watch.
          </Content>
          <Content component={ContentVariants.p}>
            The Organization ID is the numeric identifier for your organization
            and is separate from your account number.
          </Content>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant='plain'
        size='sm'
        aria-label='About Activation Keys & Organization ID'
        hasNoPadding
      />
    </Popover>
  );
};

export const ManualActivationKey = () => {
  const dispatch = useAppDispatch();
  const orgId = useAppSelector(selectOrgId);
  const activationKey = useAppSelector(selectActivationKey);

  useEffect(() => {
    dispatch(changeServerUrl('subscription.rhsm.redhat.com'));
    dispatch(changeBaseUrl(CDN_PROD_URL));
  }, [dispatch]);

  return (
    <>
      <FormGroup
        className='pf-v6-u-mb-md'
        label={'Activation key'}
        labelHelp={<ManualRegistrationPopover />}
        isRequired
      >
        <ValidatedInput
          placeholder='Activation key'
          aria-label='Activation key'
          value={activationKey || ''}
          onChange={(_, value) => {
            dispatch(changeActivationKey(value.trim()));
          }}
          validator={(v) => v !== undefined && v !== ''}
          helperText='The activation key cannot be empty'
          handleClear={() => dispatch(changeActivationKey(''))}
        />
      </FormGroup>
      <FormGroup
        label={'Organization ID'}
        labelHelp={<ManualRegistrationPopover />}
        isRequired
      >
        <ValidatedInput
          placeholder='Organization ID'
          aria-label='Organization ID'
          value={orgId || ''}
          onChange={(_, value) => {
            dispatch(changeOrgId(value.trim()));
          }}
          validator={(v) => {
            if (v === undefined || v === '') {
              return false;
            }
            return /^\d+$/.test(v.trim());
          }}
          helperText='Please enter a valid Organization ID'
          handleClear={() => dispatch(changeOrgId(''))}
        />
      </FormGroup>
    </>
  );
};
