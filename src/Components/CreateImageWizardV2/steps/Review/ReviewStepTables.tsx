import React from 'react';

import { Alert, Panel, PanelMain, Spinner } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useListRepositoriesQuery } from '../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectCustomRepositories,
  selectPackages,
} from '../../../../store/wizardSlice';

type repoPropType = {
  repoUrl: string[] | undefined;
};

const RepoName = ({ repoUrl }: repoPropType) => {
  const { data, isSuccess, isFetching, isError } = useListRepositoriesQuery({
    // @ts-ignore
    url: repoUrl,
    contentType: 'rpm',
    origin: 'external',
  });

  const errorLoading = () => {
    return (
      <Alert
        variant="danger"
        isInline
        isPlain
        title="Error loading repository name"
      />
    );
  };

  return (
    <>
      {/*
        this might be a tad bit hacky
        "isSuccess" indicates only that the query fetched successfuly, but it
        doesn't differentiate between a scenario when the repository was found
        in the response and when it was not
        for this reason I've split the "isSuccess" into two paths:
        - query finished and the repo was found -> render the name of the repo
        - query finished, but the repo was not found -> render an error
      */}
      {isSuccess && data.data?.[0]?.name && <p>{data.data?.[0].name}</p>}
      {isSuccess && !data.data?.[0]?.name && errorLoading()}
      {isFetching && <Spinner size="md" />}
      {isError && errorLoading()}
    </>
  );
};

export const FSReviewTable = () => {
  return (
    <Panel isScrollable>
      <PanelMain maxHeight="30ch">
        <Table aria-label="File system configuration table" variant="compact">
          <Thead>
            <Tr>
              <Th>Mount point</Th>
              <Th>File system type</Th>
              <Th>Minimum size</Th>
            </Tr>
          </Thead>
          <Tbody data-testid="file-system-configuration-tbody-review"></Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};

export const PackagesTable = () => {
  const packages = useAppSelector((state) => selectPackages(state));
  return (
    <Panel isScrollable>
      <PanelMain maxHeight="30ch">
        <Table aria-label="Packages table" variant="compact">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Package repository</Th>
            </Tr>
          </Thead>
          <Tbody data-testid="packages-tbody-review">
            {packages.map((pkg, pkgIndex) => (
              <Tr key={pkgIndex}>
                <Td className="pf-m-width-30">{pkg.name}</Td>
                <Td>{pkg.summary}</Td>
                <Td className="pf-m-width-20">
                  {pkg.repository === 'distro'
                    ? 'Red Hat repository'
                    : 'Custom repository'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};

export const RepositoriesTable = () => {
  const repositoriesList = useAppSelector((state) =>
    selectCustomRepositories(state)
  );
  return (
    <Panel isScrollable>
      <PanelMain maxHeight="30ch">
        <Table aria-label="Custom repositories table" variant="compact">
          <Thead>
            <Tr>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <Tbody data-testid="repositories-tbody-review">
            {repositoriesList?.map((repo, repoIndex) => (
              <Tr key={repoIndex}>
                <Td className="pf-m-width-60">
                  <RepoName repoUrl={repo.baseurl} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};
