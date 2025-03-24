import React from 'react';

import { Button, FormGroup, Checkbox, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon, TrashIcon } from '@patternfly/react-icons';

import { GENERATING_SSH_KEY_PAIRS_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  selectUserAdministrator,
  selectUserNameByIndex,
  selectUserPasswordByIndex,
  selectUserSshKeyByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  setUserAdministratorByIndex,
  removeUser,
  selectUserGroupsByIndex,
  addUserGroupByIndex,
  removeUserGroupByIndex,
} from '../../../../../store/wizardSlice';
import LabelInput from '../../../LabelInput';
import { PasswordValidatedInput } from '../../../utilities/PasswordValidatedInput';
import { useUsersValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { isUserGroupValid } from '../../../validators';

const UserInfo = () => {
  const dispatch = useAppDispatch();
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(index);
  const userSshKey = useAppSelector(userSshKeySelector);
  const userIsAdministratorSelector = selectUserAdministrator(index);
  const userIsAdministrator = useAppSelector(userIsAdministratorSelector);
  const userGroupsSelector = selectUserGroupsByIndex(index);
  const userGroups = useAppSelector(userGroupsSelector);

  const handleNameChange = (
    _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string
  ) => {
    dispatch(setUserSshKeyByIndex({ index: index, sshKey: value }));
  };

  const stepValidation = useUsersValidation();

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: boolean
  ) => {
    dispatch(
      setUserAdministratorByIndex({ index: index, isAdministrator: value })
    );
  };

  const onRemoveUserClick = () => {
    dispatch(removeUser(index));
  };

  return (
    <>
      <FormGroup isRequired label="Username">
        <ValidatedInputAndTextArea
          ariaLabel="blueprint user name"
          value={userName || ''}
          placeholder="Enter username"
          onChange={(_e, value) => handleNameChange(_e, value)}
          stepValidation={stepValidation}
          fieldName="userName"
        />
      </FormGroup>
      <PasswordValidatedInput
        value={userPassword || ''}
        ariaLabel="blueprint user password"
        placeholder="Enter password"
        onChange={(_e, value) => handlePasswordChange(_e, value)}
      />
      <FormGroup isRequired label="SSH key">
        <ValidatedInputAndTextArea
          inputType={'textArea'}
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
          href={GENERATING_SSH_KEY_PAIRS_URL}
          className="pf-v5-u-pl-0"
        >
          Learn more about SSH keys
        </Button>
      </FormGroup>
      <FormGroup>
        <Checkbox
          label="Administrator"
          isChecked={userIsAdministrator || userGroups.includes('wheel')}
          onChange={(_e, value) => handleCheckboxChange(_e, value)}
          aria-label="Administrator"
          id="user Administrator"
          name="user Administrator"
        />
      </FormGroup>
      <FormGroup label="Groups">
        <LabelInput
          ariaLabel="Add user group"
          placeholder="Add user group"
          validator={isUserGroupValid}
          list={userGroups}
          item="Group"
          addAction={(value) =>
            addUserGroupByIndex({ index: index, group: value })
          }
          removeAction={(value) =>
            removeUserGroupByIndex({ index: index, group: value })
          }
          stepValidation={stepValidation}
          fieldName="groups"
        />
      </FormGroup>
      <Tooltip position="top-start" content={'Remove user'}>
        <FormGroup>
          <Button
            aria-label="remove user"
            onClick={onRemoveUserClick}
            variant="tertiary"
            icon={<TrashIcon />}
          ></Button>
        </FormGroup>
      </Tooltip>
    </>
  );
};

export default UserInfo;
