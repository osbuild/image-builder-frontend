import React from 'react';

import {
  Alert,
  Button,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
  Spinner,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { selectIsOnPremise } from '../../../../../store/envSlice';
import { useAppSelector } from '../../../../../store/hooks';
import { useShowActivationKeyQuery } from '../../../../../store/rhsmApi';
import { selectActivationKey } from '../../../../../store/wizardSlice';

const ActivationKeyInformation = (): JSX.Element => {
  const activationKey = useAppSelector(selectActivationKey);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const {
    data: activationKeyInfo,
    isFetching: isFetchingActivationKeyInfo,
    isSuccess: isSuccessActivationKeyInfo,
    isError: isErrorActivationKeyInfo,
  } = useShowActivationKeyQuery(
    { name: activationKey! },
    {
      skip: !activationKey || isOnPremise,
    },
  );

  if (isOnPremise) {
    return <Content component={ContentVariants.dd}>{activationKey}</Content>;
  }

  return (
    <>
      {isFetchingActivationKeyInfo && <Spinner size='lg' />}
      {isSuccessActivationKeyInfo && (
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDescription>
              {activationKey}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {activationKeyInfo.body?.description && (
            <DescriptionListGroup>
              <DescriptionListTerm>Description</DescriptionListTerm>
              <DescriptionListDescription>
                {activationKeyInfo.body.description}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>Role</DescriptionListTerm>
            <DescriptionListDescription>
              {activationKeyInfo.body?.role || 'Not defined'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>SLA</DescriptionListTerm>
            <DescriptionListDescription>
              {activationKeyInfo.body?.serviceLevel || 'Not defined'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Usage</DescriptionListTerm>
            <DescriptionListDescription>
              {activationKeyInfo.body?.usage || 'Not defined'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Additional repositories</DescriptionListTerm>
            <DescriptionListDescription>
              {activationKeyInfo.body?.additionalRepositories &&
              activationKeyInfo.body.additionalRepositories.length > 0 ? (
                <Popover
                  position='right'
                  minWidth='30rem'
                  bodyContent={
                    <Content>
                      <Content component={ContentVariants.h3}>
                        Additional repositories
                      </Content>
                      <Table
                        aria-label='Additional repositories table'
                        variant='compact'
                      >
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {activationKeyInfo.body.additionalRepositories.map(
                            (repo, index) => (
                              <Tr key={index}>
                                <Td>{repo.repositoryLabel}</Td>
                              </Tr>
                            ),
                          )}
                        </Tbody>
                      </Table>
                    </Content>
                  }
                >
                  <Button
                    variant='link'
                    aria-label='Show additional repositories'
                    className='pf-v6-u-pl-0 pf-v6-u-pt-0 pf-v6-u-pb-0'
                  >
                    {activationKeyInfo.body.additionalRepositories.length}{' '}
                    repositories
                  </Button>
                </Popover>
              ) : (
                'None'
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      )}
      {isErrorActivationKeyInfo && (
        <Content>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>Name:</Content>
            <Content component={ContentVariants.dd}>{activationKey}</Content>
          </Content>
          <br />
          <Alert
            title='Information about the activation key unavailable'
            variant='danger'
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
