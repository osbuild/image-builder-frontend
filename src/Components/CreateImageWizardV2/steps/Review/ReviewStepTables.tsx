import React from 'react';

import { Alert, Panel, PanelMain, Spinner } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useListRepositoriesQuery } from '../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectCustomRepositories,
  selectPackages,
  selectPartitions,
} from '../../../../store/wizardSlice';
import { getConversionFactor } from '../FileSystem/FileSystemConfiguration';

type repoPropType = {
  repoUrl: string[] | undefined;
};

const RepoName = ({ repoUrl }: repoPropType) => {
  const { data, isSuccess, isFetching, isError } = useListRepositoriesQuery(
    {
      // @ts-ignore if repoUrl is undefined the query is going to get skipped, so it's safe to ignore the linter here
      url: repoUrl,
      contentType: 'rpm',
      origin: 'external',
    },
    { skip: !repoUrl }
  );

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
  const partitions = useAppSelector(selectPartitions);
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
          <Tbody data-testid="file-system-configuration-tbody-review">
            {partitions.map((partition, partitionIndex) => (
              <Tr key={partitionIndex}>
                <Td className="pf-m-width-30">{partition.mountpoint}</Td>
                <Td className="pf-m-width-30">xfs</Td>
                <Td className="pf-m-width-30">
                  {(
                    parseInt(partition.min_size) /
                    getConversionFactor(partition.unit)
                  ).toString()}{' '}
                  {partition.unit}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};

export const PackagesTable = () => {
  const packages = useAppSelector(selectPackages);
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
                    : pkg.repository === 'custom'
                    ? 'Custom repository'
                    : 'EPEL Everything x86_64'}
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
  const repositoriesList = useAppSelector(selectCustomRepositories);
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
