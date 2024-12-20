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
  selectUserName,
  selectUserPassword,
  selectConfirmUserPassword,
  selectUserSshKey,
  selectUserAdministrator,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserConfirmPasswordByIndex,
  setUserSshKedByIndex,
  setUserAdministratorByIndex,
} from '../../../../../store/wizardSlice';
import {
  HookValidatedInput,
  HookValidatedInputWithPasswordVisibilityButton,
  HookValidatedTextArea,
} from '../../../ValidatedTextInput';
const UserInfo = () => {
  const dispatch = useAppDispatch();
  // eslint-disable-next-line react-redux/useSelector-prefer-selectors
  const userNameSelector = selectUserName(0);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPassword(0);
  const userPassword = useAppSelector(userPasswordSelector);
  const userConfirmPasswordSelector = selectConfirmUserPassword(0);
  const confirmUserPassword = useAppSelector(userConfirmPasswordSelector);
  const userSshKeySelector = selectUserSshKey(0);
  const userSshKey = useAppSelector(userSshKeySelector);
  const userIsAdministratorSelector = selectUserAdministrator(0);
  const userAdministrator = useAppSelector(userIsAdministratorSelector);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const handleNameChange = (
    _e: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    const index = 0;
    dispatch(setUserNameByIndex({ index: index, name: value }));
  };
  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    const index = 0;
    dispatch(setUserPasswordByIndex({ index: index, password: value }));
  };
  const handleConfirmPasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    const index = 0;
    dispatch(
      setUserConfirmPasswordByIndex({ index: index, confirmPassword: value })
    );
  };
  const handleSshKeyChange = (
    _event: React.FormEvent<HTMLTextAreaElement>,
    value: string
  ) => {
    const index = 0;
    dispatch(setUserSshKedByIndex({ index: index, sshKey: value }));
  };
  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: boolean
  ) => {
    const index = 0;
    dispatch(
      setUserAdministratorByIndex({ index: index, isAdministrator: value })
    );
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  // TODO implement validation hooks
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
        <HookValidatedInputWithPasswordVisibilityButton
          ariaLabel="blueprint user password"
          value={userPassword || ''}
          type={isPasswordVisible ? 'text' : 'password'}
          onChange={(_e, value) => handlePasswordChange(_e, value)}
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
              Special characters are not allowed and must contain at least 3
              different character classes (uppercase letters, lowercase letters,
              digits).
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <FormGroup isRequired label="Confirm password">
        <HookValidatedInputWithPasswordVisibilityButton
          ariaLabel="blueprint user confirm password"
          value={confirmUserPassword || ''}
          type={isConfirmPasswordVisible ? 'text' : 'password'}
          onChange={(_e, value) => handleConfirmPasswordChange(_e, value)}
          placeholder="Enter confirm password"
          stepValidation={stepValidation}
          fieldName="userConfirmPassword"
          togglePasswordVisibility={toggleConfirmPasswordVisibility}
          isPasswordVisible={isConfirmPasswordVisible}
          isEmpty={confirmUserPassword === ''}
        />
      </FormGroup>
      <FormGroup isRequired label="SSH key">
        <HookValidatedTextArea
          ariaLabel="public SSH key"
          value={userSshKey || ''}
          type={'text'}
          onChange={(_e, value) => handleSshKeyChange(_e, value)}
          placeholder="Paste your public SSH key"
          stepValidation={stepValidation}
          fieldName="userSshKey"
          isEmpty={userSshKey === ''}
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
          onChange={(_e, value) => handleCheckboxChange(_e, value)}
          aria-label="Administrator"
          id="user Administrator"
          name="user Administrator"
        />
      </FormGroup>
    </Form>
  );
};
export default UserInfo;
