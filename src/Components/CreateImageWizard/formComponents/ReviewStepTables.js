import React from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';
import { Alert, Panel, PanelMain, Spinner } from '@patternfly/react-core';
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import PropTypes from 'prop-types';

import { UNIT_GIB, UNIT_MIB } from '../../../constants';
import { useListRepositoriesQuery } from '../../../store/contentSourcesApi';

const RepoName = ({ repoUrl }) => {
  const { data, isSuccess, isFetching, isError } = useListRepositoriesQuery({
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
      {isFetching && <Spinner isSVG size="md" />}
      {isError && errorLoading()}
    </>
  );
};

export const FSReviewTable = () => {
  const { getState } = useFormApi();
  const fsc = getState().values['file-system-configuration'];
  return (
    <Panel isScrollable>
      <PanelMain maxHeight="30ch">
        <TableComposable
          aria-label="File system configuration table"
          variant="compact"
        >
          <Thead>
            <Tr>
              <Th>Mount point</Th>
              <Th>File system type</Th>
              <Th>Minimum size</Th>
            </Tr>
          </Thead>
          <Tbody data-testid="file-system-configuration-tbody-review">
            {fsc.map((partition, partitionIndex) => (
              <Tr key={partitionIndex}>
                <Td className="pf-m-width-30">{partition.mountpoint}</Td>
                <Td className="pf-m-width-30">xfs</Td>
                <Td className="pf-m-width-30">
                  {partition.size}{' '}
                  {partition.unit === UNIT_GIB
                    ? 'GiB'
                    : partition.unit === UNIT_MIB
                    ? 'MiB'
                    : 'KiB'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </PanelMain>
    </Panel>
  );
};

export const PackagesTable = () => {
  const { getState } = useFormApi();
  const packages = getState()?.values['selected-packages'];
  return (
    <Panel isScrollable>
      <PanelMain maxHeight="30ch">
        <TableComposable aria-label="Packages table" variant="compact">
          <Thead>
            <Tr>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <Tbody data-testid="packages-tbody-review">
            {packages.map((pkg, pkgIndex) => (
              <Tr key={pkgIndex}>
                <Td className="pf-m-width-30">{pkg.name}</Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </PanelMain>
    </Panel>
  );
};

export const RepositoriesTable = () => {
  const { getState } = useFormApi();
  const repositories = getState()?.values?.['payload-repositories'];
  return (
    <Panel isScrollable>
      <PanelMain maxHeight="30ch">
        <TableComposable
          aria-label="Custom repositories table"
          variant="compact"
        >
          <Thead>
            <Tr>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <Tbody data-testid="repositories-tbody-review">
            {repositories.map((repo, repoIndex) => (
              <Tr key={repoIndex}>
                <Td className="pf-m-width-60">
                  <RepoName repoUrl={repo.baseurl} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </PanelMain>
    </Panel>
  );
};

RepoName.propTypes = {
  repoUrl: PropTypes.string,
};
