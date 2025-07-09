import React, { useState } from 'react';

import {
  Button,
  Checkbox,
  FormGroup,
  Icon,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';

import calculateNewIndex from './calculateNewIndex';
import RemoveUserModal from './RemoveUserModal';

import { GENERATING_SSH_KEY_PAIRS_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addUser,
  addUserGroupByIndex,
  removeUser,
  removeUserGroupByIndex,
  selectUsers,
  setUserAdministratorByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
} from '../../../../../store/wizardSlice';
import LabelInput from '../../../LabelInput';
import { PasswordValidatedInput } from '../../../utilities/PasswordValidatedInput';
import { useUsersValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { isUserGroupValid } from '../../../validators';

const UserInfo = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const stepValidation = useUsersValidation();

  const [index, setIndex] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);

  // Taken directly from PF5 Dynamic tabs documentation
  // https://v5-archive.patternfly.org/components/tabs#dynamic-tabs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabComponentRef = React.useRef<any>();
  const firstMount = React.useRef(true);

  const onSelect = (event: React.MouseEvent, tabIndex: number) => {
    setActiveTabKey(tabIndex);
    setIndex(tabIndex);
  };

  const onAdd = () => {
    setActiveTabKey(users.length);
    setIndex(index + 1);
    dispatch(addUser());
  };

  React.useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    } else {
      const first =
        tabComponentRef.current.tabList.current.childNodes[activeTabKey];
      if (first) {
        first.firstChild.focus();
      }
    }
  }, [users.length]);

  const onClose = (_event: React.MouseEvent, tabIndex: number) => {
    if (
      users[tabIndex].name === '' &&
      users[tabIndex].password === '' &&
      users[tabIndex].ssh_key === ''
    ) {
      const nextTabIndex = calculateNewIndex(
        tabIndex,
        activeTabKey,
        users.length
      );
      setActiveTabKey(nextTabIndex);
      setIndex(nextTabIndex);
      dispatch(removeUser(tabIndex));
    } else {
      setShowRemoveUserModal(true);
      setIndex(tabIndex);
    }
  };

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

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: boolean
  ) => {
    dispatch(
      setUserAdministratorByIndex({ index: index, isAdministrator: value })
    );
  };

  const getValidationByIndex = (index: number) => {
    const errors = stepValidation?.errors[index] || {};
    return {
      errors,
      disabledNext: stepValidation.disabledNext,
    };
  };

  return (
    <>
      <RemoveUserModal
        setShowRemoveUserModal={setShowRemoveUserModal}
        activeTabKey={activeTabKey}
        setActiveTabKey={setActiveTabKey}
        tabIndex={index}
        setIndex={setIndex}
        isOpen={showRemoveUserModal}
        userName={users[index] ? users[index].name : ''}
      />
      <Tabs
        aria-label="Users tabs"
        activeKey={activeTabKey}
        onSelect={onSelect}
        onAdd={onAdd}
        onClose={onClose}
        ref={tabComponentRef}
      >
        {users.map((user, index) => (
          <Tab
            aria-label={`User ${user.name} tab`}
            key={index}
            eventKey={index}
            title={
              <TabTitleText>
                {user.name || 'New user'}{' '}
                {Object.entries(getValidationByIndex(index).errors).some(
                  ([field, error]) =>
                    Boolean(error) &&
                    !(field === 'userName' && error === 'Required value')
                ) && (
                  <Icon status="danger">
                    <ExclamationCircleIcon title="Validation error" />
                  </Icon>
                )}
              </TabTitleText>
            }
          >
            <FormGroup isRequired label="Username" className="pf-v6-u-pb-md">
              <ValidatedInputAndTextArea
                ariaLabel="blueprint user name"
                value={user.name || ''}
                placeholder="Enter username"
                onChange={(_e, value) => handleNameChange(_e, value)}
                stepValidation={getValidationByIndex(index)}
                fieldName="userName"
              />
            </FormGroup>
            <PasswordValidatedInput
              value={user.password || ''}
              ariaLabel="blueprint user password"
              placeholder="Enter password"
              onChange={(_e, value) => handlePasswordChange(_e, value)}
              hasPassword={user.hasPassword}
            />
            <FormGroup label="SSH key" className="pf-v6-u-pb-md">
              <ValidatedInputAndTextArea
                inputType={'textArea'}
                ariaLabel="public SSH key"
                value={user.ssh_key || ''}
                type={'text'}
                onChange={(_e, value) => handleSshKeyChange(_e, value)}
                placeholder="Paste your public SSH key"
                stepValidation={getValidationByIndex(index)}
                fieldName="userSshKey"
              />
              <Button
                component="a"
                target="_blank"
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                href={GENERATING_SSH_KEY_PAIRS_URL}
                className="pf-v6-u-pl-0"
              >
                Learn more about SSH keys
              </Button>
            </FormGroup>
            <FormGroup className="pf-v6-u-pb-md">
              <Checkbox
                label="Administrator"
                isChecked={
                  user.isAdministrator || user.groups.includes('wheel')
                }
                onChange={(_e, value) => handleCheckboxChange(_e, value)}
                aria-label="Administrator"
                id={`${user.name}-${index}`}
                name="user Administrator"
              />
            </FormGroup>
            <FormGroup label="Groups">
              <LabelInput
                ariaLabel="Add user group"
                placeholder="Add user group"
                validator={isUserGroupValid}
                list={user.groups}
                item="Group"
                addAction={(value) =>
                  addUserGroupByIndex({ index: index, group: value })
                }
                removeAction={(value) =>
                  removeUserGroupByIndex({ index: index, group: value })
                }
                stepValidation={getValidationByIndex(index)}
                fieldName="groups"
              />
            </FormGroup>
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default UserInfo;
