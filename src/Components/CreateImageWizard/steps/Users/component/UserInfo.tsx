import React, { useState } from 'react';

import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  selectUsers,
  UserWithAdditionalInfo,
  editUser,
  addUser,
  selectUserName,
  selectUserPassword,
  selectConfirmUserPassword,
  selectUserSshKey,
  selectUserAdministrator,
  setUserName,
  setUserPassword,
  setConfirmUserPassword,
  setUserSshKey,
  changeUserAdministrator,
  selectUserindex,
} from '../../../../../store/wizardSlice';
import { useUserValidation } from '../../../utilities/useValidation';
import {
  HookValidatedInput,
  HookValidatedInputWithButton,
  HookValidatedTextArea,
} from '../../../ValidatedTextInput';
const UserInfo = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const userName = useAppSelector(selectUserName);
  const index = useAppSelector(selectUserindex);
  const userPassword = useAppSelector(selectUserPassword);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const confirmUserPassword = useAppSelector(selectConfirmUserPassword);
  const userSshKey = useAppSelector(selectUserSshKey);
  const userAdministrator = useAppSelector(selectUserAdministrator);

  const handleNameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    name: string
  ) => {
    dispatch(setUserName(userName));
    const updatedUser: UserWithAdditionalInfo = {
      index,
      name: name,
      password: userPassword,
      confirmPassword: confirmUserPassword,
      ssh_key: userSshKey,
      administrator: userAdministrator,
    };
    const userExists = users.some((user) => user.index === index);
    if (!userExists) {
      dispatch(addUser(updatedUser));
    } else {
      dispatch(editUser(updatedUser));
    }
  };
  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    password: string
  ) => {
    dispatch(setUserPassword(password));
    const updatedUser: UserWithAdditionalInfo = {
      index,
      name: userName,
      password: password,
      confirmPassword: confirmUserPassword,
      ssh_key: userSshKey,
      administrator: userAdministrator,
    };
    const userExists = users.some((user) => user.index === index);
    if (!userExists) {
      dispatch(addUser(updatedUser));
    } else {
      dispatch(editUser(updatedUser));
    }
  };
  const handleConfirmPasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    confirm: string
  ) => {
    dispatch(setConfirmUserPassword(confirm));
    const updatedUser: UserWithAdditionalInfo = {
      index,
      name: userName,
      password: userPassword,
      confirmPassword: confirm,
      ssh_key: userSshKey,
      administrator: userAdministrator,
    };
    const userExists = users.some((user) => user.index === index);
    if (!userExists) {
      dispatch(addUser(updatedUser));
    } else {
      dispatch(editUser(updatedUser));
    }
  };
  const handleSshKeyChange = (
    _event: React.ChangeEvent<HTMLTextAreaElement>,
    sshKey: string
  ) => {
    dispatch(setUserSshKey(sshKey));
    const updatedUser: UserWithAdditionalInfo = {
      index,
      name: userName,
      password: userPassword,
      confirmPassword: confirmUserPassword,
      ssh_key: sshKey,
      administrator: userAdministrator,
    };
    const userExists = users.some((user) => user.index === index);
    if (!userExists) {
      dispatch(addUser(updatedUser));
    } else {
      dispatch(editUser(updatedUser));
    }
  };

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    userAdministrator: boolean
  ) => {
    dispatch(changeUserAdministrator(userAdministrator));
    const updatedUser: UserWithAdditionalInfo = {
      index,
      name: userName,
      password: userPassword,
      confirmPassword: confirmUserPassword,
      ssh_key: userSshKey,
      administrator: userAdministrator,
    };
    const userExists = users.some((user) => user.index === index);
    if (!userExists) {
      dispatch(addUser(updatedUser));
    } else {
      dispatch(editUser(updatedUser));
    }
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const stepValidation = useUserValidation();
  return (
    <Form>
      <FormGroup isRequired label="Username" fieldId="blueprint-user-name">
        <HookValidatedInput
          ariaLabel="blueprint user name"
          value={userName}
          onChange={handleNameChange}
          placeholder="Enter username"
          stepValidation={stepValidation}
          fieldName="userName"
        />
      </FormGroup>
      <FormGroup isRequired label="Password" fieldId="blueprint-user-password">
        <HookValidatedInputWithButton
          ariaLabel="blueprint user password"
          value={userPassword || ''}
          type={isPasswordVisible ? 'text' : 'password'}
          onChange={handlePasswordChange}
          placeholder="Enter password"
          stepValidation={stepValidation}
          fieldName="userPassword"
          togglePasswordVisibility={togglePasswordVisibility}
          isPasswordVisible={isPasswordVisible}
          isEmpty={userPassword === ''}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Can contain at least 3 different character classes (uppercase
              letters, lowercase letters, digits).
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <FormGroup
        isRequired
        label="Confirm password"
        fieldId="blueprint-confirm-password"
      >
        <HookValidatedInputWithButton
          ariaLabel="blueprint user confirm password"
          value={confirmUserPassword || ''}
          type={isConfirmPasswordVisible ? 'text' : 'password'}
          onChange={handleConfirmPasswordChange}
          placeholder="Enter confirm password"
          stepValidation={stepValidation}
          fieldName="userConfirmPassword"
          togglePasswordVisibility={toggleConfirmPasswordVisibility}
          isPasswordVisible={isConfirmPasswordVisible}
          isEmpty={confirmUserPassword === ''}
        />
      </FormGroup>
      <FormGroup isRequired label="SSH key" fieldId="blueprint-ssh-key">
        <HookValidatedTextArea
          ariaLabel="Paste your public SSH key"
          value={userSshKey || ''}
          type={'text'}
          onChange={handleSshKeyChange}
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
      <FormGroup>
        <Checkbox
          label="Administrator"
          isChecked={userAdministrator}
          onChange={handleCheckboxChange}
          aria-label="Administrator"
          id="user Administrator"
          name="user Administrator"
        />
      </FormGroup>
    </Form>
  );
};
export default UserInfo;
