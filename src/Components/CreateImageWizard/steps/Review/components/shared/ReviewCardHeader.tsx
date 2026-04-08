import React from 'react';

import {
  Button,
  CardHeader,
  CardTitle,
  useWizardContext,
} from '@patternfly/react-core';

export const ReviewCardHeader = ({
  title,
  stepId,
}: {
  title: string;
  stepId: string;
}) => {
  const { goToStepById } = useWizardContext();

  return (
    <CardHeader
      className='pf-v6-u-mb-md'
      actions={{
        actions: (
          <Button variant='link' onClick={() => goToStepById(stepId)}>
            Edit
          </Button>
        ),
      }}
    >
      <CardTitle className='pf-v6-u-font-size-lg' component='h2'>
        {title}
      </CardTitle>
    </CardHeader>
  );
};
