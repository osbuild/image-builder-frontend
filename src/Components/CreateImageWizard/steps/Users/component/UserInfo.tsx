import React from 'react';

import { Button, Form, FormGroup } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  selectUserNameByIndex,
  selectUserPasswordByIndex,
  selectUserSshKeyByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
} from '../../../../../store/wizardSlice';
import { HookValidatedInput } from '../../../ValidatedTextInput';
const UserInfo = () => {
  const dispatch = useAppDispatch();
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(0);
  const userSshKey = useAppSelector(userSshKeySelector);

  const handleNameChange = (
    _e: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    dispatch(setUserNameByIndex({ index: index, name: value }));
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    dispatch(setUserPasswordByIndex({ index: index, password: value }));
  };

  const handleSshKeyChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    const index = 0;
    dispatch(setUserSshKeyByIndex({ index: index, sshKey: value }));
  };

  const stepValidation = {
    errors: {},
    disabledNext: false,
  };

  return (
    <Form>
      <FormGroup isRequired label="Username">
        <HookValidatedInput
          ariaLabel="blueprint user name"
          value={userName || ''}
          placeholder="Enter username"
          onChange={(_e, value) => handleNameChange(_e, value)}
          stepValidation={stepValidation}
          fieldName="userName"
        />
      </FormGroup>
      <FormGroup isRequired label="Password">
        <HookValidatedInput
          ariaLabel="blueprint user password"
          value={userPassword || ''}
          onChange={(_e, value) => handlePasswordChange(_e, value)}
          placeholder="Enter password"
          stepValidation={stepValidation}
          fieldName="userPassword"
        />
      </FormGroup>
      <FormGroup isRequired label="SSH key">
        <HookValidatedInput
          ariaLabel="public SSH key"
          value={userSshKey || ''}
          type={'text'}
          onChange={(_e, value) => handleSshKeyChange(_e, value)}
          placeholder="Paste your public SSH key"
          stepValidation={stepValidation}
          fieldName="userSshKey"
        />
        <Button
          component="a"
          target="_blank"
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_basic_system_settings/assembly_using-secure-communications-between-two-systems-with-openssh_configuring-basic-system-settings#generating-ssh-key-pairs_assembly_using-secure-communications-between-two-systems-with-openssh"
          className="pf-u-pl-0"
        >
          Learn more about SSH keys
        </Button>
      </FormGroup>
    </Form>
  );
};

export default UserInfo;
