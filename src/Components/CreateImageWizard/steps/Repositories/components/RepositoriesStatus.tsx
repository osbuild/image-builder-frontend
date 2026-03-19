import React from 'react';

import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon,
  Popover,
  Spinner,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';

import { CONTENT_URL } from '@/constants';
import { ApiRepositoryResponse } from '@/store/api/contentSources';

import '@/Components/ImagesTable/ImageBuildStatus.scss';
import { getLastIntrospection } from '../repositoriesUtilities';

type RepositoryStatusProps = {
  repoStatus: ApiRepositoryResponse['status'];
  repoUrl: ApiRepositoryResponse['url'];
  repoIntrospections: ApiRepositoryResponse['last_introspection_time'];
  repoFailCount: ApiRepositoryResponse['failed_introspections_count'];
};

const RepositoriesStatus = ({
  repoStatus,
  repoUrl,
  repoIntrospections,
  repoFailCount,
}: RepositoryStatusProps) => {
  if (repoStatus === 'Valid') {
    return (
      <>
        <Icon status='success'>
          <CheckCircleIcon />
        </Icon>{' '}
        {repoStatus}
      </>
    );
  } else if (repoStatus === 'Invalid' || repoStatus === 'Unavailable') {
    return (
      <>
        <Popover
          position='bottom'
          minWidth='30rem'
          bodyContent={
            <>
              <Alert
                variant={repoStatus === 'Invalid' ? 'danger' : 'warning'}
                title={repoStatus}
                className='pf-v6-u-pb-sm'
                isInline
                isPlain
              />
              {repoUrl ? (
                <p className='pf-v6-u-pb-md'>Cannot fetch {repoUrl}</p>
              ) : (
                ''
              )}
              {(repoIntrospections || repoFailCount) && (
                <>
                  <DescriptionList
                    columnModifier={{
                      default: '2Col',
                    }}
                  >
                    {repoIntrospections && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          Last introspection
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          {getLastIntrospection(repoIntrospections)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {repoFailCount && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          Failed attempts
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          {repoFailCount}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                  </DescriptionList>
                  <br />
                </>
              )}
              <Button
                component='a'
                target='_blank'
                variant='link'
                iconPosition='right'
                isInline
                icon={<ExternalLinkAltIcon />}
                href={CONTENT_URL}
              >
                Go to Repositories
              </Button>
            </>
          }
        >
          <Button variant='link' className='pf-v6-u-p-0 pf-v6-u-font-size-sm'>
            {repoStatus === 'Invalid' && (
              <>
                <Icon status='danger'>
                  <ExclamationCircleIcon />
                </Icon>{' '}
                {repoStatus}
              </>
            )}
            {repoStatus === 'Unavailable' && (
              <>
                <Icon status='warning'>
                  <ExclamationTriangleIcon />
                </Icon>{' '}
                {repoStatus}
              </>
            )}
          </Button>
        </Popover>
      </>
    );
  } else if (repoStatus === 'Pending') {
    return (
      <>
        <Spinner isInline /> {repoStatus}
      </>
    );
  }
};

export default RepositoriesStatus;
