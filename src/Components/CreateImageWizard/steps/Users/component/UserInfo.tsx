import React from 'react';

import { Form, FormGroup } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  selectUserNameByIndex,
  selectUserPasswordByIndex,
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
    </Form>
  );
};

export default UserInfo;
