import React, { useState } from 'react';

import {
  Button,
  ExpandableSection,
  Split,
  SplitItem,
  useWizardContext,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';

import './ReviewStep.scss';
import { useCustomizationRestrictions } from '@/store/api/distributions';
import {
  selectImageTypes,
  selectIsImageMode,
  selectUserGroups,
  selectUsers,
  UserGroup,
} from '@/store/slices/wizard';

import { FirstBootList, GroupsList, UsersList } from './ReviewStepTextLists';

import { useAppSelector } from '../../../../../store/hooks';

const Review = () => {
  const { goToStepById } = useWizardContext();

  const isImageMode = useAppSelector(selectIsImageMode);
  const environments = useAppSelector(selectImageTypes);
  const users = useAppSelector(selectUsers);
  const userGroups = useAppSelector(selectUserGroups);

  const [isExpandableFirstBoot, setIsExpandedFirstBoot] = useState(true);
  const [isExpandedUsers, setIsExpandedUsers] = useState(true);
  const [isExpandedGroups, setIsExpandedGroups] = useState(true);

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  const onToggleFirstBoot = (isExpandableFirstBoot: boolean) =>
    setIsExpandedFirstBoot(isExpandableFirstBoot);
  const onToggleUsers = (isExpandedUsers: boolean) =>
    setIsExpandedUsers(isExpandedUsers);
  const onToggleGroups = (isExpandedGroups: boolean) =>
    setIsExpandedGroups(isExpandedGroups);

  type RevisitStepButtonProps = {
    ariaLabel: string;
    testId: string;
    stepId: string;
  };

  const RevisitStepButton = ({
    ariaLabel,
    testId,
    stepId,
  }: RevisitStepButtonProps) => {
    return (
      <Button
        icon={<ArrowRightIcon />}
        variant='link'
        aria-label={ariaLabel}
        data-testid={testId}
        component='span'
        onClick={() => revisitStep(stepId)}
        className='pf-v6-u-p-0 pf-v6-u-font-weight-bold'
        isInline
      >
        Revisit step
      </Button>
    );
  };

  const revisitStep = (stepId: string) => {
    goToStepById(stepId);
  };

  const composeExpandable = (label: string, testId: string, stepId: string) => {
    return (
      <Split hasGutter>
        <SplitItem
          isFilled
          className='pf-v6-u-min-width pf-v6-u-text-align-start'
        >
          <Button variant='link' component='span' isInline>
            {label}
          </Button>
        </SplitItem>
        <SplitItem isFilled>
          <RevisitStepButton
            ariaLabel={`Revisit ${label} step`}
            testId={testId}
            stepId={stepId}
          />
        </SplitItem>
      </Split>
    );
  };

  const wizardStepId = isImageMode ? 'wizard-users' : 'wizard-users-optional';

  const filterNonEmptyGroups = (groups: UserGroup[]) => {
    return groups.filter((group) => group.name.trim());
  };

  return (
    <>
      {!restrictions.users.shouldHide && users.length > 0 && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Users',
            'revisit-users',
            wizardStepId,
          )}
          onToggle={(_event, isExpandedUsers) => onToggleUsers(isExpandedUsers)}
          isExpanded={isExpandedUsers}
          isIndented
          data-testid='users-expandable'
        >
          <UsersList />
        </ExpandableSection>
      )}
      {!restrictions.users.shouldHide &&
        filterNonEmptyGroups(userGroups).length > 0 && (
          <ExpandableSection
            toggleContent={composeExpandable(
              'Groups',
              'revisit-groups',
              wizardStepId,
            )}
            onToggle={(_event, isExpandedGroups) =>
              onToggleGroups(isExpandedGroups)
            }
            isExpanded={isExpandedGroups}
            isIndented
            data-testid='groups-expandable'
          >
            <GroupsList groups={filterNonEmptyGroups(userGroups)} />
          </ExpandableSection>
        )}
      {!restrictions.firstBoot.shouldHide && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'First boot',
            'revisit-first-boot',
            'wizard-first-boot',
          )}
          onToggle={(_event, isExpandableFirstBoot) =>
            onToggleFirstBoot(isExpandableFirstBoot)
          }
          isExpanded={isExpandableFirstBoot}
          isIndented
          data-testid='firstboot-expandable'
        >
          <FirstBootList />
        </ExpandableSection>
      )}
    </>
  );
};

export default Review;
