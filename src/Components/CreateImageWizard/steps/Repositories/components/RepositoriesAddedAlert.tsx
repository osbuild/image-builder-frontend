import React from 'react';

import { Alert, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { TEMPLATES_URL } from '@/constants';

type RepositoriesAddedAlertProps = {
  templateUuid: string;
};

const RepositoriesAddedAlert = ({
  templateUuid,
}: RepositoriesAddedAlertProps) => {
  return (
    <Alert
      variant='info'
      isInline
      title={
        <>
          The repositories seen below are from the selected content template and
          have been added automatically. If you do not want these repositories
          in your image, you can{' '}
          <Button
            component='a'
            target='_blank'
            variant='link'
            isInline
            icon={<ExternalLinkAltIcon />}
            iconPosition='end'
            href={`${TEMPLATES_URL}/${templateUuid}/edit`}
          >
            {' '}
            modify this content template
          </Button>{' '}
          or choose another snapshot option.
        </>
      }
    />
  );
};

export default RepositoriesAddedAlert;
