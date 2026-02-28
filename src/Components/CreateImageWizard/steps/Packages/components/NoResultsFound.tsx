import React from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, SearchIcon } from '@patternfly/react-icons';
import { Tbody, Td, Tr } from '@patternfly/react-table';

import { CONTENT_URL } from '../../../../../constants';
import { Repos } from '../packagesTypes';

type NoResultsFoundProps = {
  isOnPremise: boolean;
  activeTabKey: Repos;
  setActiveTabKey: (value: Repos) => void;
};

const NoResultsFound = ({
  isOnPremise,
  activeTabKey,
  setActiveTabKey,
}: NoResultsFoundProps) => {
  if (activeTabKey === Repos.INCLUDED) {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={5}>
            <Bullseye>
              <EmptyState
                headingLevel='h4'
                titleText='No results found'
                icon={SearchIcon}
                variant={EmptyStateVariant.sm}
              >
                {!isOnPremise && (
                  <EmptyStateBody>
                    Adjust your search and try again, or search in other
                    repositories (your repositories and popular repositories).
                  </EmptyStateBody>
                )}
                {isOnPremise && (
                  <EmptyStateBody>
                    Adjust your search and try again.
                  </EmptyStateBody>
                )}
                <EmptyStateFooter>
                  <EmptyStateActions>
                    {!isOnPremise && (
                      <Button
                        variant='primary'
                        onClick={() => setActiveTabKey(Repos.OTHER)}
                      >
                        Search other repositories
                      </Button>
                    )}
                  </EmptyStateActions>
                  {!isOnPremise && (
                    <EmptyStateActions>
                      <Button
                        className='pf-v6-u-pt-md'
                        variant='link'
                        isInline
                        component='a'
                        target='_blank'
                        iconPosition='right'
                        icon={<ExternalLinkAltIcon />}
                        href={CONTENT_URL}
                      >
                        Manage your repositories and popular repositories
                      </Button>
                    </EmptyStateActions>
                  )}
                </EmptyStateFooter>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  } else {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={5}>
            <Bullseye>
              <EmptyState
                headingLevel='h4'
                titleText='No results found'
                icon={SearchIcon}
                variant={EmptyStateVariant.sm}
              >
                <EmptyStateBody>
                  No packages found in known repositories. If you know of a
                  repository containing this packages, add it to{' '}
                  <Button
                    variant='link'
                    isInline
                    component='a'
                    target='_blank'
                    href={CONTENT_URL}
                  >
                    your repositories
                  </Button>{' '}
                  and try searching for it again.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  }
};

export default NoResultsFound;
