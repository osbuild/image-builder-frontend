import React from 'react';

import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  InProgressIcon,
} from '@patternfly/react-icons';

import { CONTENT_URL } from '../../../../constants';
import { ApiRepositoryResponse } from '../../../../store/contentSourcesApi';
import {
  convertStringToDate,
  timestampToDisplayString,
} from '../../../../Utilities/time';
import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';
import { betaPath } from '../../utilities/betaPath';

const getLastIntrospection = (
  repoIntrospections: RepositoryStatusProps['repoIntrospections']
) => {
  const currentDate = Date.now();
  const lastIntrospectionDate = convertStringToDate(repoIntrospections);
  const timeDeltaInSeconds = Math.floor(
    (currentDate - lastIntrospectionDate) / 1000
  );

  if (timeDeltaInSeconds <= 60) {
    return 'A few seconds ago';
  } else if (timeDeltaInSeconds <= 60 * 60) {
    return 'A few minutes ago';
  } else if (timeDeltaInSeconds <= 60 * 60 * 24) {
    return 'A few hours ago';
  } else {
    return timestampToDisplayString(repoIntrospections);
  }
};

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
  const { isBeta } = useGetEnvironment();
  if (repoStatus === 'Valid') {
    return (
      <>
        <CheckCircleIcon className="success" /> {repoStatus}
      </>
    );
  } else if (repoStatus === 'Invalid' || repoStatus === 'Unavailable') {
    return (
      <>
        <Popover
          position="bottom"
          minWidth="30rem"
          bodyContent={
            <>
              <Alert
                variant={repoStatus === 'Invalid' ? 'danger' : 'warning'}
                title={repoStatus}
                className="pf-u-pb-sm"
                isInline
                isPlain
              />
              <p className="pf-u-pb-md">Cannot fetch {repoUrl}</p>
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
                component="a"
                target="_blank"
                variant="link"
                iconPosition="right"
                isInline
                icon={<ExternalLinkAltIcon />}
                href={betaPath(CONTENT_URL, isBeta())}
              >
                Go to Repositories
              </Button>
            </>
          }
        >
          <Button variant="link" className="pf-u-p-0 pf-u-font-size-sm">
            {repoStatus === 'Invalid' && (
              <ExclamationCircleIcon className="error" />
            )}
            {repoStatus === 'Unavailable' && (
              <ExclamationTriangleIcon className="expiring" />
            )}{' '}
            <span className="failure-button">{repoStatus}</span>
          </Button>
        </Popover>
      </>
    );
  } else if (repoStatus === 'Pending') {
    return (
      <>
        <InProgressIcon className="pending" /> {repoStatus}
      </>
    );
  }
};

export default RepositoriesStatus;
