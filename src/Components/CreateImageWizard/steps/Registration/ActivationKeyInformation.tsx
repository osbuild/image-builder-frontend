import React from 'react';

import {
  Alert,
  Spinner,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import { Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useAppSelector } from '../../../../store/hooks';
import { useShowActivationKeyQuery } from '../../../../store/rhsmApi';
import { selectActivationKey } from '../../../../store/wizardSlice';

const ActivationKeyInformation = (): JSX.Element => {
  const activationKey = useAppSelector(selectActivationKey);

  const {
    data: activationKeyInfo,
    isFetching: isFetchingActivationKeyInfo,
    isSuccess: isSuccessActivationKeyInfo,
    isError: isErrorActivationKeyInfo,
  } = useShowActivationKeyQuery(
    { name: activationKey! },
    {
      skip: !activationKey,
    }
  );

  return (
    <>
      {isFetchingActivationKeyInfo && <Spinner size="lg" />}
      {isSuccessActivationKeyInfo && (
        <Content>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>Name:</Content>
            <Content component={ContentVariants.dd}>{activationKey}</Content>
            <Content component={ContentVariants.dt}>Role:</Content>
            <Content component={ContentVariants.dd}>
              {activationKeyInfo?.body?.role || 'Not defined'}
            </Content>
            <Content component={ContentVariants.dt}>SLA:</Content>
            <Content component={ContentVariants.dd}>
              {activationKeyInfo?.body?.serviceLevel || 'Not defined'}
            </Content>
            <Content component={ContentVariants.dt}>Usage:</Content>
            <Content component={ContentVariants.dd}>
              {activationKeyInfo?.body?.usage || 'Not defined'}
            </Content>
            <Content component={ContentVariants.dt}>
              Additional repositories:
              <Popover
                bodyContent={
                  <Content>
                    <Content component="p">
                      The core repositories for your operating system version
                      are always enabled and do not need to be explicitly added
                      to the activation key.
                    </Content>
                  </Content>
                }
              >
                <Button
                  icon={<HelpIcon />}
                  variant="plain"
                  aria-label="About additional repositories"
                  className="pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0"
                />
              </Popover>
            </Content>
            <Content
              component={ContentVariants.dd}
              className="pf-v6-u-display-flex pf-v6-u-align-items-flex-end"
            >
              {activationKeyInfo?.body?.additionalRepositories &&
              activationKeyInfo?.body?.additionalRepositories?.length > 0 ? (
                <Popover
                  position="right"
                  minWidth="30rem"
                  bodyContent={
                    <Content>
                      <Content component={ContentVariants.h3}>
                        Additional repositories
                      </Content>
                      <Table
                        aria-label="Additional repositories table"
                        variant="compact"
                      >
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {activationKeyInfo.body?.additionalRepositories?.map(
                            (repo, index) => (
                              <Tr key={index}>
                                <Td>{repo.repositoryLabel}</Td>
                              </Tr>
                            )
                          )}
                        </Tbody>
                      </Table>
                    </Content>
                  }
                >
                  <Button
                    variant="link"
                    aria-label="Show additional repositories"
                    className="pf-v6-u-pl-0 pf-v6-u-pt-0 pf-v6-u-pb-0"
                  >
                    {activationKeyInfo.body?.additionalRepositories?.length}{' '}
                    repositories
                  </Button>
                </Popover>
              ) : (
                'None'
              )}
            </Content>
          </Content>
        </Content>
      )}
      {isErrorActivationKeyInfo && (
        <Content>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>Name:</Content>
            <Content component={ContentVariants.dd}>{activationKey}</Content>
          </Content>
          <br />
          <Alert
            title="Information about the activation key unavailable"
            variant="danger"
            isPlain
            isInline
          >
            Information about the activation key cannot be loaded. Please check
            the key was not removed and try again later.
          </Alert>
        </Content>
      )}
    </>
  );
};

export default ActivationKeyInformation;
