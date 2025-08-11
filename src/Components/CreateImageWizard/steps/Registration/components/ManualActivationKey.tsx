import React from 'react';

import { Button, Content, FormGroup, Popover } from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';

import { ACTIVATIONKEYS_INFO_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeActivationKey,
  changeOrgId,
  selectActivationKey,
  selectOrgId,
} from '../../../../../store/wizardSlice';
import { ValidatedInput } from '../../../ValidatedInput';

const ActivationKeyPopover = ({ label }: { label: string }) => {
  return (
    <>
      {label}
      <Popover
        headerContent='About activation key'
        position='right'
        minWidth='30rem'
        bodyContent={
          <Content>
            <Content>
              Activation keys assist you in registering and configuring systems.
              Metadata such as role, system purpose, and usage can be
              automatically attached to systems via an activation key, and
              monitored with Subscription Watch.
            </Content>
            <Button
              component='a'
              target='_blank'
              variant='link'
              icon={<ExternalLinkAltIcon />}
              iconPosition='right'
              isInline
              href={ACTIVATIONKEYS_INFO_URL}
            >
              Learn more about activation keys
            </Button>
          </Content>
        }
      >
        <Button
          icon={<HelpIcon />}
          variant='plain'
          className='pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0'
          aria-label='About Organization ID'
          isInline
        />
      </Popover>
    </>
  );
};

const OrgIdPopover = ({ label }: { label: string }) => {
  return (
    <>
      {label}
      <Popover
        headerContent='About Organization ID'
        position='right'
        minWidth='30rem'
        bodyContent={
          <Content>
            The organization ID is the numeric identifier for your organization
            and is separate from your account number.
          </Content>
        }
      >
        <Button
          icon={<HelpIcon />}
          variant='plain'
          className='pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0'
          aria-label='About Organization ID'
          isInline
        />
      </Popover>
    </>
  );
};

export const ManualActivationKey = () => {
  const orgId = useAppSelector(selectOrgId);
  const activationKey = useAppSelector(selectActivationKey);
  const dispatch = useAppDispatch();

  return (
    <>
      <FormGroup label={<ActivationKeyPopover label='Activation Key' />}>
        <ValidatedInput
          placeholder='Activation Key'
          ariaLabel='Activation Key'
          value={activationKey || ''}
          onChange={(_, value) => {
            dispatch(changeActivationKey(value.trim()));
          }}
          validator={(v) => v !== undefined && v !== ''}
          helperText='The activation key cannot be empty'
        />
      </FormGroup>
      <FormGroup label={<OrgIdPopover label='Organization ID' />}>
        <ValidatedInput
          placeholder='Organization ID'
          ariaLabel='Organization ID'
          value={orgId || ''}
          onChange={(_, value) => {
            dispatch(changeOrgId(value.trim()));
          }}
          validator={(v) => {
            if (v === undefined || v === '') {
              return false;
            }
            return !isNaN(parseInt(v));
          }}
          helperText='Please enter a valid Organization ID'
        />
      </FormGroup>
    </>
  );
};
