import React from 'react';

import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Text,
  TextArea,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeUserName,
  changeUserSshKey,
  selectUserName,
  selectUserSshKey,
} from '../../../../store/wizardSlice';
import { ValidatedTextInput } from '../../ValidatedTextInput';
import { isUserNameValid } from '../../validators';

const UsersStep = () => {
  const dispatch = useAppDispatch();
  const userName = useAppSelector(selectUserName);
  const userSshKey = useAppSelector(selectUserSshKey);
  const handleNameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    name: string
  ) => {
    dispatch(changeUserName(name));
  };

  const handleSshKeyChange = (
    _event: React.ChangeEvent<HTMLTextAreaElement>,
    description: string
  ) => {
    dispatch(changeUserSshKey(description));
  };

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        User
      </Title>

      <Text>
        Enter a name to identify your blueprint. If no name is entered, the
        images created from this blueprint will use the name of the parent
        blueprint.
      </Text>
      <FormGroup isRequired label="User name" fieldId="blueprint-name">
        <ValidatedTextInput
          ariaLabel="user name"
          value={userName}
          validator={isUserNameValid}
          onChange={handleNameChange}
          helperText="Please enter a valid user name"
          placeholder="Add user name"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              The name can be 2-100 characters with at least two word characters
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <FormGroup isRequired label="SSH key" fieldId="blueprint-name">
        <TextArea
          aria-label="ssh key"
          value={userSshKey}
          // validator={(name: string) => !!name && name.length > 2}
          onChange={handleSshKeyChange}
          placeholder="Add public ssh key"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              The SSH Key must be a valid public key
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </Form>
  );
};

export default UsersStep;
