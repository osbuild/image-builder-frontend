import React, { MutableRefObject, useEffect, useRef } from 'react';

import {
  Content,
  ContentVariants,
  FormGroup,
  FormGroupLabelHelp,
  Popover,
} from '@patternfly/react-core';

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

const ManualRegistrationPopover = ({
  ref,
}: {
  ref: MutableRefObject<null>;
}) => {
  return (
    <Popover
      triggerRef={ref}
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
      <FormGroupLabelHelp
        ref={ref}
        aria-label='About Activation Keys & Organization ID'
      />
    </Popover>
  );
};

export const ManualActivationKey = () => {
  const dispatch = useAppDispatch();
  const orgId = useAppSelector(selectOrgId);
  const activationKey = useAppSelector(selectActivationKey);
  const orgIdRef = useRef(null);
  const activationKeyRef = useRef(null);

  useEffect(() => {
    dispatch(changeServerUrl('subscription.rhsm.redhat.com'));
    dispatch(changeBaseUrl(CDN_PROD_URL));
  }, [dispatch]);

  return (
    <>
      <FormGroup
        className='pf-v6-u-mb-md'
        label={'Activation key'}
        labelHelp={<ManualRegistrationPopover ref={activationKeyRef} />}
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
        labelHelp={<ManualRegistrationPopover ref={orgIdRef} />}
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
