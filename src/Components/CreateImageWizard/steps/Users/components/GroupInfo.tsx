import React from 'react';

import GroupRow from './GroupRow';

import { useAppSelector } from '../../../../../store/hooks';
import { selectUserGroups } from '../../../../../store/wizardSlice';
import { useUserGroupsValidation } from '../../../utilities/useValidation';

const GroupInfo = () => {
  const groups = useAppSelector(selectUserGroups);
  const groupsValidation = useUserGroupsValidation();

  const groupsToRender =
    groups.length === 0 ? [{ name: '', gid: undefined }] : groups;

  return (
    <>
      {groupsToRender.map((group, index) => (
        <GroupRow
          key={index}
          groupName={group.name}
          {...(group.gid !== undefined && { groupId: group.gid })}
          index={index}
          groupCount={groups.length}
          isAddButtonDisabled={!!groupsValidation.disabledNext}
        />
      ))}
    </>
  );
};

export default GroupInfo;
