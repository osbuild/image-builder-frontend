import React, { useEffect, useState } from 'react';

import {
  Alert,
  Badge,
  Bullseye,
  Button,
  PageSection,
  Pagination,
  PaginationVariant,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { OnSetPage } from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';
import {
  ActionsColumn,
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';
import { useDispatch } from 'react-redux';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import ImagesEmptyState from './EmptyState';
import {
  AwsDetails,
  AwsS3Details,
  AzureDetails,
  GcpDetails,
  LocalDetails,
  OciDetails,
} from './ImageDetails';
import ImagesTableToolbar from './ImagesTableToolbar';
import {
  AwsS3Instance,
  CloudInstance,
  LocalInstance,
  OciInstance,
} from './Instance';
import Release from './Release';
import { CloudStatus, ExpiringStatus, LocalStatus } from './Status';
import { AwsTarget, Target } from './Target';

import {
  AMPLITUDE_MODULE_NAME,
  AWS_S3_EXPIRATION_TIME_IN_HOURS,
  OCI_STORAGE_EXPIRATION_TIME_IN_DAYS,
  PAGINATION_LIMIT,
  PAGINATION_OFFSET,
  SEARCH_INPUT,
  STATUS_POLLING_INTERVAL,
} from '../../constants';
import {
  useGetBlueprintComposesQuery,
  useGetBlueprintsQuery,
  useGetComposesQuery,
  useGetComposeStatusQuery,
} from '../../store/backendApi';
import {
  selectBlueprintSearchInput,
  selectBlueprintVersionFilter,
  selectBlueprintVersionFilterAPI,
  selectLimit,
  selectOffset,
  selectSelectedBlueprintId,
  setBlueprintId,
} from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintItem,
  ComposesResponseItem,
  ComposeStatus,
  GetBlueprintComposesApiArg,
  GetBlueprintsApiArg,
} from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';
import {
  computeHoursToExpiration,
  timestampToDisplayString,
  timestampToDisplayStringDetailed,
} from '../../Utilities/time';

const ImagesTable = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);

  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput =
    useAppSelector(selectBlueprintSearchInput) || SEARCH_INPUT;
  const blueprintVersionFilter = useAppSelector(selectBlueprintVersionFilter);
  const blueprintVersionFilterAPI = useAppSelector(
    selectBlueprintVersionFilterAPI,
  );
  const blueprintsOffset = useAppSelector(selectOffset) || PAGINATION_OFFSET;
  const blueprintsLimit = useAppSelector(selectLimit) || PAGINATION_LIMIT;

  const { analytics, auth } = useChrome();

  useEffect(() => {
    (async () => {
      const data = await auth.getUser();
      setUserData(data);
    })();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchParamsGetBlueprints: GetBlueprintsApiArg = {
    limit: blueprintsLimit,
    offset: blueprintsOffset,
  };

  if (blueprintSearchInput) {
    searchParamsGetBlueprints.search = blueprintSearchInput;
  }

  const { selectedBlueprintVersion } = useGetBlueprintsQuery(
    searchParamsGetBlueprints,
    {
      selectFromResult: ({ data }) => ({
        selectedBlueprintVersion: data?.data.find(
          (blueprint: BlueprintItem) => blueprint.id === selectedBlueprintId,
        )?.version,
      }),
    },
  );
  const onSetPage: OnSetPage = (_, page) => setPage(page);

  const onPerPageSelect: OnSetPage = (_, perPage) => {
    setPage(1);
    setPerPage(perPage);
  };

  const searchParamsGetBlueprintComposes: GetBlueprintComposesApiArg = {
    id: selectedBlueprintId as string,
    limit: perPage,
    offset: perPage * (page - 1),
  };

  if (blueprintVersionFilterAPI) {
    searchParamsGetBlueprintComposes.blueprintVersion =
      blueprintVersionFilterAPI;
  }

  const {
    data: blueprintsComposes,
    isSuccess: isBlueprintsSuccess,
    isLoading: isLoadingBlueprintsCompose,
    isError: isBlueprintsError,
  } = useGetBlueprintComposesQuery(searchParamsGetBlueprintComposes, {
    skip: !selectedBlueprintId,
  });

  const {
    data: composesData,
    isSuccess: isComposesSuccess,
    isError: isComposesError,
    isLoading: isLoadingComposes,
  } = useGetComposesQuery(
    {
      limit: perPage,
      offset: perPage * (page - 1),
      ignoreImageTypes: [
        'rhel-edge-commit',
        'rhel-edge-installer',
        'edge-commit',
        'edge-installer',
      ],
    },
    { skip: !!selectedBlueprintId },
  );

  const data = selectedBlueprintId ? blueprintsComposes : composesData;
  const isSuccess = selectedBlueprintId
    ? isBlueprintsSuccess
    : isComposesSuccess;
  const isError = selectedBlueprintId ? isBlueprintsError : isComposesError;
  const isLoading = selectedBlueprintId
    ? isLoadingBlueprintsCompose
    : isLoadingComposes;

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  // TODO: the check for `IS_ON_PREMISE` should be removed when
  // we create query functions for the other endpoints. We're skipping
  // this check because the query request fails, since the `cockpitApi`
  // still doesn't know how to query the composes endpoint
  if (!process.env.IS_ON_PREMISE && !isSuccess) {
    if (isError) {
      return (
        <Alert variant='warning' title='Service unavailable'>
          <p>
            The Images service is unavailable right now. We&apos;re working on
            it... please check back later.
          </p>
        </Alert>
      );
    }
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  let composes = data?.data;
  if (selectedBlueprintId && blueprintVersionFilter === 'latest') {
    composes = composes?.filter((compose) => {
      return compose.blueprint_version === selectedBlueprintVersion;
    });
  }
  const itemCount = data?.meta.count || 0;

  if (!process.env.IS_ON_PREMISE) {
    const orgId = userData?.identity.internal?.org_id;

    analytics.group(orgId, {
      imagebuilder_image_count: composesData?.meta.count,
    });
  }

  return (
    <PageSection>
      <ImagesTableToolbar
        itemCount={itemCount}
        perPage={perPage}
        page={page}
        setPage={setPage}
        onPerPageSelect={onPerPageSelect}
      />
      <Table variant='compact' data-testid='images-table'>
        <Thead>
          <Tr>
            <Th
              style={{ minWidth: itemCount === 0 ? '30px' : 'auto' }}
              aria-label='Details expandable'
            />
            <Th>Name</Th>
            <Th>Updated</Th>
            <Th>OS</Th>
            <Th>Target</Th>
            <Th>Version</Th>
            <Th>Status</Th>
            <Th>Instance</Th>
            <Th aria-label='Actions menu' />
          </Tr>
        </Thead>
        {itemCount === 0 && (
          <Tbody>
            <Tr>
              <Td colSpan={12}>
                <ImagesEmptyState
                  selectedBlueprint={selectedBlueprintId || ''}
                />
              </Td>
            </Tr>
          </Tbody>
        )}

        {composes?.map((compose, rowIndex) => {
          return (
            <ImagesTableRow
              compose={compose}
              rowIndex={rowIndex}
              key={compose.id}
            />
          );
        })}
      </Table>
      <Toolbar className='pf-v6-u-mb-xl'>
        <ToolbarContent>
          <ToolbarItem variant='pagination' align={{ default: 'alignEnd' }}>
            <Pagination
              variant={PaginationVariant.bottom}
              itemCount={itemCount}
              perPage={perPage}
              page={page}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              widgetId='compose-pagination-bottom'
              data-testid='images-pagination-bottom'
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </PageSection>
  );
};

type ImagesTableRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const ImagesTableRow = ({ compose, rowIndex }: ImagesTableRowPropTypes) => {
  const [pollingInterval, setPollingInterval] = useState(
    STATUS_POLLING_INTERVAL,
  );

  const { data: composeStatus } = useGetComposeStatusQuery(
    {
      composeId: compose.id,
    },
    { pollingInterval: pollingInterval },
  );

  useEffect(() => {
    if (
      composeStatus?.image_status.status === 'success' ||
      composeStatus?.image_status.status === 'failure'
    ) {
      setPollingInterval(0);
    } else {
      setPollingInterval(STATUS_POLLING_INTERVAL);
    }
  }, [setPollingInterval, composeStatus]);

  const type = compose.request.image_requests[0]?.upload_request?.type;

  switch (type as string) {
    case 'aws':
      return (
        <AwsRow
          compose={compose}
          composeStatus={composeStatus}
          rowIndex={rowIndex}
        />
      );
    case 'gcp':
      return <GcpRow compose={compose} rowIndex={rowIndex} />;
    case 'azure':
      return <AzureRow compose={compose} rowIndex={rowIndex} />;
    case 'oci.objectstorage':
      return <OciRow compose={compose} rowIndex={rowIndex} />;
    case 'aws.s3':
      return <AwsS3Row compose={compose} rowIndex={rowIndex} />;
    case 'local':
      return <LocalRow compose={compose} rowIndex={rowIndex} />;
  }
};

type GcpRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const GcpRow = ({ compose, rowIndex }: GcpRowPropTypes) => {
  const details = <GcpDetails compose={compose} />;
  const instance = <CloudInstance compose={compose} />;
  const status = <CloudStatus compose={compose} />;

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      details={details}
      status={status}
      instance={instance}
    />
  );
};

type AzureRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const AzureRow = ({ compose, rowIndex }: AzureRowPropTypes) => {
  const details = <AzureDetails compose={compose} />;
  const instance = <CloudInstance compose={compose} />;
  const status = <CloudStatus compose={compose} />;

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      details={details}
      instance={instance}
      status={status}
    />
  );
};

type OciRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const OciRow = ({ compose, rowIndex }: OciRowPropTypes) => {
  const daysToExpiration = Math.floor(
    computeHoursToExpiration(compose.created_at) / 24,
  );
  const isExpired = daysToExpiration >= OCI_STORAGE_EXPIRATION_TIME_IN_DAYS;

  const details = <OciDetails compose={compose} />;
  const instance = <OciInstance compose={compose} isExpired={isExpired} />;
  const status = (
    <ExpiringStatus
      compose={compose}
      isExpired={isExpired}
      timeToExpiration={daysToExpiration}
    />
  );

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      details={details}
      instance={instance}
      status={status}
    />
  );
};

type AwsS3RowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const AwsS3Row = ({ compose, rowIndex }: AwsS3RowPropTypes) => {
  const hoursToExpiration = computeHoursToExpiration(compose.created_at);
  const isExpired = hoursToExpiration >= AWS_S3_EXPIRATION_TIME_IN_HOURS;

  const details = <AwsS3Details compose={compose} />;
  const instance = <AwsS3Instance compose={compose} isExpired={isExpired} />;
  const status = (
    <ExpiringStatus
      compose={compose}
      isExpired={isExpired}
      timeToExpiration={hoursToExpiration}
    />
  );

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      details={details}
      instance={instance}
      status={status}
    />
  );
};

type AwsRowPropTypes = {
  compose: ComposesResponseItem;
  composeStatus: ComposeStatus | undefined;
  rowIndex: number;
};

const AwsRow = ({ compose, composeStatus, rowIndex }: AwsRowPropTypes) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);
  const { analytics, auth } = useChrome();

  useEffect(() => {
    (async () => {
      const data = await auth.getUser();
      setUserData(data);
    })();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const target = <AwsTarget compose={compose} />;
  const status = <CloudStatus compose={compose} />;
  const instance = <CloudInstance compose={compose} />;
  const details = <AwsDetails compose={compose} />;

  const actions = (
    <ActionsColumn
      items={awsActions(
        compose,
        composeStatus,
        navigate,
        analytics,
        userData?.identity.internal?.account_id,
      )}
    />
  );

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      status={status}
      target={target}
      actions={actions}
      instance={instance}
      details={details}
    />
  );
};

type LocalRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const LocalRow = ({ compose, rowIndex }: LocalRowPropTypes) => {
  const details = <LocalDetails compose={compose} />;
  const instance = <LocalInstance compose={compose} />;
  const status = <LocalStatus compose={compose} />;
  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      details={details}
      instance={instance}
      status={status}
    />
  );
};

type RowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  status: JSX.Element;
  target?: JSX.Element;
  actions?: JSX.Element;
  instance: JSX.Element;
  details: JSX.Element;
};

type Analytics = {
  track: (event: string, props?: Record<string, unknown>) => void;
};

const Row = ({
  compose,
  rowIndex,
  status,
  target,
  actions,
  details,
  instance,
}: RowPropTypes) => {
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);
  const { analytics, auth } = useChrome();

  useEffect(() => {
    (async () => {
      const data = await auth.getUser();
      setUserData(data);
    })();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggle = () => setIsExpanded(!isExpanded);
  const dispatch = useDispatch();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);

  const handleClick = ({
    blueprintId,
  }: {
    blueprintId: BlueprintItem['id'];
  }) => {
    if (blueprintId) {
      dispatch(setBlueprintId(blueprintId));
    }
  };

  return (
    <Tbody key={compose.id} isExpanded={isExpanded}>
      <Tr className='no-bottom-border'>
        <Td
          expand={{
            rowIndex: rowIndex,
            isExpanded: isExpanded,
            onToggle: () => handleToggle(),
          }}
        />
        <Td dataLabel='Image name'>
          {compose.blueprint_id && !selectedBlueprintId ? (
            <Button
              component='a'
              variant='link'
              isInline
              onClick={() =>
                compose.blueprint_id &&
                handleClick({ blueprintId: compose.blueprint_id })
              }
            >
              {compose.image_name || compose.id}
            </Button>
          ) : (
            <span> {compose.image_name || compose.id}</span>
          )}
        </Td>
        <Td
          dataLabel='Created'
          title={timestampToDisplayStringDetailed(compose.created_at)}
        >
          {timestampToDisplayString(compose.created_at)}
        </Td>
        <Td dataLabel='Release'>
          <Release release={compose.request.distribution} />
        </Td>
        <Td dataLabel='Target'>
          {target ? target : <Target compose={compose} />}
        </Td>
        <Td dataLabel='Version'>
          <Badge isRead>{compose.blueprint_version || 'N/A'}</Badge>
        </Td>
        <Td dataLabel='Status'>{status}</Td>
        <Td dataLabel='Instance'>{instance}</Td>
        <Td>
          {actions ? (
            actions
          ) : (
            <ActionsColumn
              items={defaultActions(
                compose,
                analytics,
                userData?.identity.internal?.account_id,
              )}
            />
          )}
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={8}>
          <ExpandableRowContent>{details}</ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

const defaultActions = (
  compose: ComposesResponseItem,
  analytics: Analytics,
  account_id: string | undefined,
) => {
  const name = `request-${compose.id}.json`;

  return [
    {
      title: (
        <a
          className='ib-subdued-link'
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(
            JSON.stringify(compose.request, null, '  '),
          )}`}
          download={name}
          onClick={() => {
            analytics.track(`${AMPLITUDE_MODULE_NAME} - File Downloaded`, {
              module: AMPLITUDE_MODULE_NAME,
              link_name: name,
              current_path: window.location.pathname,
              account_id: account_id || 'Not found',
            });
          }}
        >
          Download compose request (.json)
        </a>
      ),
    },
  ];
};

const awsActions = (
  compose: ComposesResponseItem,
  status: ComposeStatus | undefined,
  navigate: NavigateFunction,
  analytics: Analytics,
  account_id: string | undefined,
) => {
  return [
    {
      title: 'Share to new region',
      onClick: () => navigate(resolveRelPath(`share/${compose.id}`)),
      isDisabled: status?.image_status.status === 'success' ? false : true,
    },
    ...defaultActions(compose, analytics, account_id),
  ];
};

export default ImagesTable;
