import React from 'react';

import {
  Alert,
  EmptyState,
  Panel,
  PanelMain,
  Spinner,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { ContentOrigin } from '../../../../constants';
import {
  ApiSnapshotForDate,
  useGetTemplateQuery,
  useListRepositoriesQuery,
} from '../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectCustomRepositories,
  selectDistribution,
  selectGroups,
  selectPackages,
  selectPartitions,
  selectRecommendedRepositories,
  selectTemplate,
} from '../../../../store/wizardSlice';
import { getEpelVersionForDistribution } from '../../../../Utilities/epel';
import PackageInfoNotAvailablePopover from '../Packages/components/PackageInfoNotAvailablePopover';

type repoPropType = {
  repoUuid: string | undefined;
};

const RepoName = ({ repoUuid }: repoPropType) => {
  const { data, isSuccess, isFetching, isError } = useListRepositoriesQuery(
    {
      // @ts-ignore if repoUrl is undefined the query is going to get skipped, so it's safe to ignore the linter here
      uuid: repoUuid ?? '',
      contentType: 'rpm',
      origin: ContentOrigin.ALL,
    },
    { skip: !repoUuid }
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
      {isSuccess && data?.data?.[0]?.name && <p>{data.data[0].name}</p>}
      {isSuccess && !data?.data?.[0]?.name && errorLoading()}
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
          <Tbody>
            {partitions.map((partition, partitionIndex) => (
              <Tr key={partitionIndex}>
                <Td className="pf-m-width-30">{partition.mountpoint}</Td>
                <Td className="pf-m-width-30">xfs</Td>
                <Td className="pf-m-width-30">
                  {parseInt(partition.min_size).toString()} {partition.unit}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};

const Error = () => {
  return (
    <Alert title="Repositories unavailable" variant="danger" isPlain isInline>
      Repositories cannot be reached, try again later.
    </Alert>
  );
};

const Loading = () => {
  return (
    <EmptyState
      headingLevel="h4"
      icon={Spinner}
      titleText="Loading"
    ></EmptyState>
  );
};

export const SnapshotTable = ({
  snapshotForDate,
}: {
  snapshotForDate: ApiSnapshotForDate[];
}) => {
  const template = useAppSelector(selectTemplate);

  const { data: templateData } = useGetTemplateQuery(
    {
      uuid: template,
    },
    { refetchOnMountOrArgChange: true, skip: template === '' }
  );

  const { data, isSuccess, isLoading, isError } = useListRepositoriesQuery({
    uuid:
      snapshotForDate.length > 0
        ? snapshotForDate.map(({ repository_uuid }) => repository_uuid).join()
        : template && templateData && templateData.repository_uuids
        ? templateData.repository_uuids.join(',')
        : '',
    origin: ContentOrigin.REDHAT + ',' + ContentOrigin.CUSTOM, // Make sure to show both redhat and external
  });

  const isAfterSet = new Set(
    snapshotForDate
      .filter(({ is_after }) => is_after)
      .map(({ repository_uuid }) => repository_uuid)
  );

  const stringToDateToMMDDYYYY = (strDate: string) => {
    const date = new Date(strDate);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
      .getDate()
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    (isError && <Error />) ||
    (isLoading && <Loading />) ||
    (isSuccess && (
      <Panel isScrollable>
        <PanelMain maxHeight="30ch">
          <Table aria-label="Packages table" variant="compact">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Last snapshot date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.data?.map(({ uuid, name, last_snapshot }, pkgIndex) => (
                <Tr key={pkgIndex}>
                  <Td>{name}</Td>
                  <Td>
                    {uuid && isAfterSet.has(uuid) ? (
                      <Alert
                        title={
                          last_snapshot?.created_at
                            ? stringToDateToMMDDYYYY(last_snapshot.created_at)
                            : 'N/A'
                        }
                        variant="warning"
                        isPlain
                        isInline
                      />
                    ) : last_snapshot?.created_at ? (
                      stringToDateToMMDDYYYY(last_snapshot.created_at)
                    ) : (
                      'N/A'
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </PanelMain>
      </Panel>
    ))
  );
};

export const PackagesTable = () => {
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);

  return (
    <Panel isScrollable>
      <PanelMain maxHeight="30ch">
        <Table aria-label="Packages table" variant="compact">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>
                Description <PackageInfoNotAvailablePopover />
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {packages.map((pkg, pkgIndex) => (
              <Tr key={pkgIndex}>
                <Td>{pkg.name}</Td>
                <Td>{pkg.summary ? pkg.summary : 'Not available'}</Td>
              </Tr>
            ))}
            {groups.map((grp, grpIndex) => (
              <Tr key={grpIndex}>
                <Td>@{grp.name}</Td>
                <Td>{grp.description ? grp.description : 'Not available'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};

export const RepositoriesTable = () => {
  const distribution = useAppSelector(selectDistribution);
  const repositoriesList = useAppSelector(selectCustomRepositories);
  const recommendedRepositoriesList = useAppSelector(
    selectRecommendedRepositories
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
          <Tbody>
            {repositoriesList.map((repo, repoIndex) => (
              <Tr key={repoIndex + 1}>
                <Td className="pf-m-width-60">
                  <RepoName repoUuid={repo.id} />
                </Td>
              </Tr>
            ))}
            {recommendedRepositoriesList.length > 0 && (
              <Tr key={0}>
                <Td className="pf-m-width-60">
                  EPEL {getEpelVersionForDistribution(distribution)} Everything
                  x86_64
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};
