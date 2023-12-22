import React, { useState } from 'react';

import { ExpandableSection, Form, Title } from '@patternfly/react-core';

import { ImageOutputList } from './imageOutput';

const ReviewStep = () => {
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
          <ImageOutputList />
        </ExpandableSection>
      </Form>
    </>
  );
};

export default ReviewStep;
