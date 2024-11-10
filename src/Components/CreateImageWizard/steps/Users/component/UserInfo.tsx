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
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

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
  const handleFieldChange = <K extends keyof UserWithAdditionalInfo>(
    field: K,
    value: UserWithAdditionalInfo[K],
    setterAction?: ActionCreatorWithPayload<
      string | boolean | undefined | number
    >,
    additionalLogic?: (updatedUser: UserWithAdditionalInfo) => void
  ) => {
    // Create updated user object
    const updatedUser: UserWithAdditionalInfo = {
      index,
      name: userName,
      password: userPassword,
      confirmPassword: confirmUserPassword,
      ssh_key: userSshKey,
      administrator: userAdministrator,
      [field]: value,
    };
    // Call specific setter action if provided
    if (setterAction) {
      dispatch(setterAction(value));
    }
    // Optional additional logic
    if (additionalLogic) {
      additionalLogic(updatedUser);
    }
    // Determine if user exists by index, not name
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
    setIsConfirmPasswordVisible((prevState) => !prevState);

  const stepValidation = useUserValidation();
  return (
    <Form>
      <FormGroup isRequired label="Username" fieldId="blueprint-user-name">
        <HookValidatedInput
          ariaLabel="blueprint user name"
          value={userName}
          onChange={(event, userName) =>
            handleFieldChange('name', userName, setUserName)
          }
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
          onChange={(event, userPassword) =>
            handleFieldChange('password', userPassword, setUserPassword)
          }
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
          onChange={(event, confirmPassword) =>
            handleFieldChange(
              'confirmPassword',
              confirmPassword,
              setConfirmUserPassword
            )
          }
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
          onChange={(event, ssh_key) =>
            handleFieldChange('ssh_key', ssh_key, setUserSshKey, () => {
              // Additional logic for SSH key
            })
          }
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
          onChange={(event, administrator) =>
            handleFieldChange(
              'administrator',
              administrator,
              changeUserAdministrator
            )
          }
          aria-label="Administrator"
          id="user Administrator"
          name="user Administrator"
        />
      </FormGroup>
    </Form>
  );
};
export default UserInfo;
