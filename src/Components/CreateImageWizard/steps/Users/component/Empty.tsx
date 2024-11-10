import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import UserIcon from '@patternfly/react-icons/dist/esm/icons/user-icon';

import { useAppDispatch } from '../../../../../store/hooks';
import { addUser } from '../../../../../store/wizardSlice';

const EmptyUserState = () => {
  const dispatch = useAppDispatch();
  const onAddUserClick = () => {
    dispatch(addUser());
  };
  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        icon={<EmptyStateIcon icon={UserIcon} />}
        headingLevel="h4"
      />
      <EmptyStateFooter>
        <Button variant="secondary" onClick={onAddUserClick}>
          Add a user
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};
export default EmptyUserState;
