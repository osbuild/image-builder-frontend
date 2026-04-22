import React from 'react';

import { Button, Tooltip } from '@patternfly/react-core';
import { LockIcon, MinusCircleIcon } from '@patternfly/react-icons';

import { ApiRepositoryResponseRead } from '@/store/api/contentSources';

type RemoveRepositoryButtonProps = {
  repo: ApiRepositoryResponseRead;
  isDisabled: boolean;
  disabledReason: string;
  onRemove: (repo: ApiRepositoryResponseRead) => void;
};

const RemoveRepositoryButton = ({
  repo,
  isDisabled,
  disabledReason,
  onRemove,
}: RemoveRepositoryButtonProps) => {
  const button = (
    <Button
      isDisabled={isDisabled}
      variant='plain'
      icon={isDisabled ? <LockIcon /> : <MinusCircleIcon />}
      aria-label='Remove repository'
      onClick={() => onRemove(repo)}
      isInline
      hasNoPadding
    />
  );

  if (isDisabled) {
    return (
      <Tooltip content={disabledReason} isContentLeftAligned>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

export default RemoveRepositoryButton;
