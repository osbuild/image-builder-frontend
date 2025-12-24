import React, { useEffect } from 'react';

import GroupRow from './GroupRow';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addUserGroup,
  selectUserGroups,
} from '../../../../../store/wizardSlice';
import { useUserGroupsValidation } from '../../../utilities/useValidation';

const GroupInfo = () => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectUserGroups);
  const groupsValidation = useUserGroupsValidation();

  // Ensure there's always at least one empty group in the store
  // This provides a UX placeholder for users to start entering groups
  useEffect(() => {
    // Only add initial empty group if none exist and we haven't already initialized
    // This defensive check prevents potential infinite loops if addUserGroup fails
    if (groups.length === 0) {
      dispatch(addUserGroup(''));
    }
  }, [groups.length, dispatch]);

  return (
    <>
      {groups.map((group, index) => (
        <GroupRow
          key={group.id}
          groupId={group.id}
          groupName={group.name}
          {...(group.gid !== undefined && { groupGid: group.gid })}
          index={index}
          groupCount={groups.length}
          isAddButtonDisabled={!!groupsValidation.disabledNext}
        />
      ))}
    </>
  );
};

export default GroupInfo;
