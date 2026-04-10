import React from 'react';

import { Label, Skeleton, Truncate } from '@patternfly/react-core';

export const RepositoryLabel = ({
  name,
  uuid,
  isLoading,
}: {
  name: string | undefined;
  uuid: string;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <Skeleton
        width='80px'
        fontSize='sm'
        screenreaderText='Loading repo name'
      />
    );
  }

  if (!name) {
    return (
      <Label color='blue'>
        <Truncate content={uuid} maxCharsDisplayed={12} position='end' />
      </Label>
    );
  }

  return <Label color='blue'>{name}</Label>;
};
