import React, { useState } from 'react';

import {
  Button,
  FormGroup,
  Checkbox,
  Tabs,
  Tab,
  TabTitleText,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import calculateNewIndex from './calculateNewIndex';
import RemoveUserModal from './RemoveUserModal';

import { GENERATING_SSH_KEY_PAIRS_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  setUserAdministratorByIndex,
  addUser,
  selectUsers,
  addUserGroupByIndex,
  removeUserGroupByIndex,
  removeUser,
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
    return {
      errors: {
        userName: stepValidation?.errors[index]?.userName,
        userSshKey: stepValidation?.errors[index]?.userSshKey,
      },
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
            title={<TabTitleText>{user.name || 'New user'}</TabTitleText>}
          >
            <FormGroup isRequired label="Username" className="pf-v5-u-pb-md">
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
            />
            <FormGroup label="SSH key" className="pf-v5-u-pb-md">
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
                className="pf-v5-u-pl-0"
              >
                Learn more about SSH keys
              </Button>
            </FormGroup>
            <FormGroup className="pf-v5-u-pb-md">
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
