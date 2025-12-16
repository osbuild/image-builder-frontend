import React, { useState } from 'react';

import {
  Button,
  Checkbox,
  FormGroup,
  Grid,
  GridItem,
  Icon,
} from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import AddCircleOIcon from '@patternfly/react-icons/dist/esm/icons/add-circle-o-icon';

import RemoveUserModal from './RemoveUserModal';

import { useAppDispatch } from '../../../../../store/hooks';
import {
  addUser,
  assignGroupToUserByIndex,
  removeGroupFromUserByIndex,
  removeUser,
  setUserAdministratorByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  UserWithAdditionalInfo,
} from '../../../../../store/wizardSlice';
import LabelInput from '../../../LabelInput';
import { PasswordValidatedInput } from '../../../utilities/PasswordValidatedInput';
import { useUsersValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { isUserGroupValid } from '../../../validators';

type UserRowProps = {
  user: UserWithAdditionalInfo;
  index: number;
  userCount: number;
  isAddButtonDisabled: boolean;
};

const UserRow = ({
  user,
  index,
  userCount,
  isAddButtonDisabled,
}: UserRowProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useUsersValidation();
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const getValidationByIndex = (idx: number) => {
    const errors =
      idx in stepValidation.errors ? stepValidation.errors[idx] : {};
    return {
      errors,
      disabledNext: stepValidation.disabledNext,
    };
  };

  const onAddUserClick = () => {
    dispatch(addUser());
  };

  const onRemove = () => {
    if (
      user.name === '' &&
      user.password === '' &&
      user.ssh_key === '' &&
      !user.isAdministrator
    ) {
      dispatch(removeUser(index));
    } else {
      setShowRemoveUserModal(true);
    }
  };

  const handleNameChange = (
    _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    if (userCount === 0) {
      dispatch(addUser());
    }
    dispatch(setUserNameByIndex({ index: index, name: value }));
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    if (userCount === 0) {
      dispatch(addUser());
    }
    dispatch(setUserPasswordByIndex({ index: index, password: value }));
  };

  const handleSshKeyChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    if (userCount === 0) {
      dispatch(addUser());
    }
    dispatch(setUserSshKeyByIndex({ index: index, sshKey: value }));
  };

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: boolean,
  ) => {
    if (userCount === 0) {
      dispatch(addUser());
    }
    dispatch(
      setUserAdministratorByIndex({ index: index, isAdministrator: value }),
    );
  };
  const validation = getValidationByIndex(index);

  return (
    <>
      <Grid hasGutter md={11}>
        <GridItem span={2}>
          <FormGroup isRequired label='Username' className='pf-v6-u-pb-md'>
            <ValidatedInputAndTextArea
              ariaLabel='blueprint user name'
              value={user.name || ''}
              placeholder='Set username'
              onChange={(_e, value) => handleNameChange(_e, value)}
              stepValidation={getValidationByIndex(index)}
              fieldName='userName'
              forceErrorDisplay={true}
            />
            {index === userCount - 1 && (
              <Button
                variant='link'
                onClick={onAddUserClick}
                icon={<AddCircleOIcon />}
                isDisabled={isAddButtonDisabled}
                className='pf-v6-u-mt-md'
              >
                Add user
              </Button>
            )}
          </FormGroup>
        </GridItem>
        <GridItem span={2}>
          <PasswordValidatedInput
            value={user.password || ''}
            ariaLabel='blueprint user password'
            placeholder='Set password'
            onChange={(_e, value) => handlePasswordChange(_e, value)}
            hasPassword={user.hasPassword}
          />
        </GridItem>
        <GridItem span={2}>
          <FormGroup
            label={
              <>
                SSH key{' '}
                {validation.errors.userSshKey && (
                  <Icon status='danger'>
                    <ExclamationCircleIcon title='Validation error' />
                  </Icon>
                )}
              </>
            }
          >
            <ValidatedInputAndTextArea
              ariaLabel='public SSH key'
              value={user.ssh_key || ''}
              type={'text'}
              onChange={(_e, value) => handleSshKeyChange(_e, value)}
              placeholder='Set SSH key'
              stepValidation={getValidationByIndex(index)}
              fieldName='userSshKey'
            />
          </FormGroup>
        </GridItem>
        <GridItem span={3}>
          <FormGroup
            label={
              <>
                Groups{' '}
                {validation.errors.groups && (
                  <Icon status='danger'>
                    <ExclamationCircleIcon title='Validation error' />
                  </Icon>
                )}
              </>
            }
          >
            <LabelInput
              ariaLabel='Add user group'
              placeholder='Add user group'
              validator={isUserGroupValid}
              list={user.groups}
              item='Group'
              addAction={(value) =>
                assignGroupToUserByIndex({ index: index, group: value })
              }
              removeAction={(value) =>
                removeGroupFromUserByIndex({ index: index, group: value })
              }
              stepValidation={getValidationByIndex(index)}
              fieldName='groups'
            />
          </FormGroup>
        </GridItem>
        <GridItem span={1}>
          <FormGroup label='Admin'>
            <Checkbox
              isChecked={user.isAdministrator || user.groups.includes('wheel')}
              onChange={(_e, value) => handleCheckboxChange(_e, value)}
              aria-label='Administrator'
              id={`${user.name}-${index}`}
              name='user Administrator'
            />
          </FormGroup>
        </GridItem>
        <GridItem span={1}>
          <FormGroup label=' ' className='pf-v6-u-pb-md'>
            <Button
              isDisabled={userCount <= 1}
              variant='plain'
              icon={<MinusCircleIcon />}
              onClick={() => onRemove()}
              aria-label='Remove user'
            />
          </FormGroup>
        </GridItem>
      </Grid>
      <RemoveUserModal
        setShowRemoveUserModal={setShowRemoveUserModal}
        index={index}
        isOpen={showRemoveUserModal}
        userName={user.name || ''}
      />
    </>
  );
};

export default UserRow;
