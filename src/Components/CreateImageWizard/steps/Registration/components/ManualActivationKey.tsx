import React, { useEffect, useState } from 'react';

import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Popover,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { CDN_PROD_URL } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeActivationKey,
  changeBaseUrl,
  changeOrgId,
  changeServerUrl,
  selectActivationKey,
  selectOrgId,
  validateActivationKey,
  validateOrgId,
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
  const [draftKey, setDraftKey] = useState(activationKey ?? '');
  const [draftOrgId, setDraftOrgId] = useState(orgId ?? '');

  useEffect(() => {
    dispatch(changeServerUrl('subscription.rhsm.redhat.com'));
    dispatch(changeBaseUrl(CDN_PROD_URL));
  }, [dispatch]);

  useEffect(() => {
    // Reset the local draft when the activation key changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftKey(activationKey ?? '');
  }, [activationKey]);

  useEffect(() => {
    // Reset the local draft when the organization ID changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftOrgId(orgId ?? '');
  }, [orgId]);

  return (
    <>
      <FormGroup
        className='pf-v6-u-mb-md'
        label={'Activation key'}
        labelHelp={<ManualRegistrationPopover />}
        isRequired
      >
        <ValidatedTextInput
          placeholder='Activation key'
          ariaLabel='Activation key'
          value={draftKey}
          onChange={(_, value) => setDraftKey(value)}
          onCommit={(candidate) => {
            if (!candidate) return;

            dispatch(changeActivationKey(candidate));
          }}
          validator={validateActivationKey}
          handleClear={() => {
            setDraftKey('');
            dispatch(changeActivationKey(''));
          }}
        />
      </FormGroup>
      <FormGroup
        label={'Organization ID'}
        labelHelp={<ManualRegistrationPopover />}
        isRequired
      >
        <ValidatedTextInput
          placeholder='Organization ID'
          ariaLabel='Organization ID'
          value={draftOrgId}
          onChange={(_, value) => setDraftOrgId(value)}
          onCommit={(candidate) => {
            if (!candidate) return;

            dispatch(changeOrgId(candidate));
          }}
          validator={validateOrgId}
          handleClear={() => {
            setDraftOrgId('');
            dispatch(changeOrgId(''));
          }}
        />
      </FormGroup>
    </>
  );
};
