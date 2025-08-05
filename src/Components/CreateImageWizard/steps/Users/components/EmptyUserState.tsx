import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateFooter,
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
    <EmptyState
      headingLevel='h4'
      icon={UserIcon}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateFooter>
        <Button variant='secondary' onClick={onAddUserClick}>
          Add a user
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default EmptyUserState;
