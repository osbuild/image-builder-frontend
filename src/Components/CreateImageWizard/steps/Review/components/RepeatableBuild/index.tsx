import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectSnapshotDate, selectUseLatest } from '@/store/slices';
import { timestampToDisplayString } from '@/Utilities/time';
import { useFlag } from '@/Utilities/useGetEnvironment';

import {
  ReviewCardHeader,
  ReviewGroup,
  ReviewList,
  StatusItem,
} from '../shared';
import { ReviewCardProps } from '../types';

const RepeatableBuild = ({ restrictions }: ReviewCardProps) => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const useLatest = useAppSelector(selectUseLatest);
  const snapshotDate = useAppSelector(selectSnapshotDate);

  if (restrictions.repositories.shouldHide || useLatest) {
    return null;
  }

  return (
    <Card>
      <ReviewCardHeader
        title='Enable repeatable build'
        stepId={
          isWizardRevampEnabled
            ? 'base-settings-step'
            : 'wizard-repository-snapshot'
        }
        {...(isWizardRevampEnabled && {
          sectionId: 'repeatable-build-section',
        })}
      />
      <CardBody>
        <ReviewList>
          <ReviewGroup
            heading='Repeatable build'
            description={<StatusItem>Enabled</StatusItem>}
          />
          {snapshotDate && (
            <ReviewGroup
              heading='Snapshot date'
              description={timestampToDisplayString(snapshotDate)}
            />
          )}
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default RepeatableBuild;
