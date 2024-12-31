import React from 'react';

import { Form, FormGroup } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  selectUserConfirmPassword,
  selectUserNameByIndex,
  selectUserPasswordByIndex,
  setUserConfirmPasswordByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
} from '../../../../../store/wizardSlice';
import { HookValidatedInput } from '../../../ValidatedTextInput';
const UserInfo = () => {
  const dispatch = useAppDispatch();
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userConfirmPasswordSelector = selectUserConfirmPassword(0);
  const userConfirmPassword = useAppSelector(userConfirmPasswordSelector);

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

  const handleConfirmPasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    const index = 0;
    dispatch(
      setUserConfirmPasswordByIndex({ index: index, confirmPassword: value })
    );
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
      <FormGroup isRequired label="Cnofrim Password">
        <HookValidatedInput
          ariaLabel="blueprint user confirm password"
          value={userConfirmPassword || ''}
          onChange={(_e, value) => handleConfirmPasswordChange(_e, value)}
          placeholder="Enter confirm password"
          stepValidation={stepValidation}
          fieldName="userCofirmPassword"
        />
      </FormGroup>
    </Form>
  );
};

export default UserInfo;
