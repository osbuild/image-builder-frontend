import React, { useState } from 'react';

import { ExpandableSection, Form, Title } from '@patternfly/react-core';

import { ImageOutputList } from './imageOutput';

import {
  ArchitectureItem,
  Distributions,
} from '../../../../store/imageBuilderApi';

type ReviewStepPropTypes = {
  release: Distributions;
  arch: ArchitectureItem['arch'];
};

const ReviewStep = ({ release, arch }: ReviewStepPropTypes) => {
  const [isExpandedImageOutput, setIsExpandedImageOutput] = useState(false);

  const onToggleImageOutput = (isExpandedImageOutput: boolean) =>
    setIsExpandedImageOutput(isExpandedImageOutput);
  return (
    <>
      <Form>
        <Title headingLevel="h2">Review</Title>
        <ExpandableSection
          toggleContent={'Image output'}
          onToggle={(_event, isExpandedImageOutput) =>
            onToggleImageOutput(isExpandedImageOutput)
          }
          isExpanded={isExpandedImageOutput}
          isIndented
          data-testid="image-output-expandable"
        >
          <ImageOutputList release={release} arch={arch} />
        </ExpandableSection>
      </Form>
    </>
  );
};

export default ReviewStep;
