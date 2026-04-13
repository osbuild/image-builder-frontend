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
import { selectImageTypes } from '@/store/slices/wizard';

import { FirstBootList } from './ReviewStepTextLists';

import { useAppSelector } from '../../../../../store/hooks';

const Review = () => {
  const { goToStepById } = useWizardContext();

  const environments = useAppSelector(selectImageTypes);

  const [isExpandableFirstBoot, setIsExpandedFirstBoot] = useState(true);

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  const onToggleFirstBoot = (isExpandableFirstBoot: boolean) =>
    setIsExpandedFirstBoot(isExpandableFirstBoot);

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

  return (
    <>
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
