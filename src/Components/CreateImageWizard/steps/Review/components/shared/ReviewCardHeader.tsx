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
  sectionId,
}: {
  title: string;
  stepId: string;
  sectionId?: string;
}) => {
  const { goToStepById } = useWizardContext();

  const handleEdit = () => {
    goToStepById(stepId);
    if (sectionId) {
      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <CardHeader
      className='pf-v6-u-mb-md'
      actions={{
        actions: (
          <Button variant='link' onClick={handleEdit}>
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
