import React, { useEffect, useState } from 'react';

import {
  OnSetPage,
  Pagination,
  PaginationVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Alert,
  Spinner,
  Bullseye,
  Badge,
  Title,
} from '@patternfly/react-core';
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
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';

import './ImagesTable.scss';
import ImagesEmptyState from './EmptyState';
import {
  AwsDetails,
  AwsS3Details,
  AzureDetails,
  GcpDetails,
  OciDetails,
} from './ImageDetails';
import { AwsS3Instance, CloudInstance, OciInstance } from './Instance';
import Release from './Release';
import { ExpiringStatus, CloudStatus } from './Status';
import { AwsTarget, Target } from './Target';

import {
  AWS_S3_EXPIRATION_TIME_IN_HOURS,
  OCI_STORAGE_EXPIRATION_TIME_IN_DAYS,
  STATUS_POLLING_INTERVAL,
} from '../../constants';
import {
  selectBlueprintSearchInput,
  selectSelectedBlueprintId,
} from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintItem,
  ComposesResponseItem,
  ComposeStatus,
  useGetBlueprintComposesQuery,
  useGetBlueprintsQuery,
  useGetComposesQuery,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';
import {
  computeHoursToExpiration,
  timestampToDisplayString,
} from '../../Utilities/time';
import { useExperimentalFlag } from '../../Utilities/useExperimentalFlag';
import { BlueprintActionsMenu } from '../Blueprints/BlueprintActionsMenu';
import { BuildImagesButton } from '../Blueprints/BuildImagesButton';
import { DeleteBlueprintModal } from '../Blueprints/DeleteBlueprintModal';

const ImagesTable = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);

  const { selectedBlueprintVersion } = useGetBlueprintsQuery(
    { search: blueprintSearchInput },
    {
      selectFromResult: ({ data }) => ({
        selectedBlueprintVersion: data?.data?.find(
          (blueprint: BlueprintItem) => blueprint.id === selectedBlueprintId
        )?.version,
      }),
    }
  );
  const experimentalFlag = useExperimentalFlag();
  const onSetPage: OnSetPage = (_, page) => setPage(page);

  const onPerPageSelect: OnSetPage = (_, perPage) => {
    setPage(1);
    setPerPage(perPage);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const {
    data: blueprintsComposes,
    isSuccess: isBlueprintsSuccess,
    isLoading: isLoadingBlueprintsCompose,
    isFetching: isFetchingBlueprintsCompose,
    isError: isBlueprintsError,
  } = useGetBlueprintComposesQuery(
    {
      id: selectedBlueprintId as string,
      limit: perPage,
      offset: perPage * (page - 1),
    },
    { skip: !selectedBlueprintId }
  );

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
    { skip: !!selectedBlueprintId }
  );

  const data = selectedBlueprintId ? blueprintsComposes : composesData;
  const isSuccess = selectedBlueprintId
    ? isBlueprintsSuccess
    : isComposesSuccess;
  const isError = selectedBlueprintId ? isBlueprintsError : isComposesError;
  const isLoading = selectedBlueprintId
    ? isLoadingBlueprintsCompose
    : isLoadingComposes;

  const isBlueprintOutSync =
    selectedBlueprintId &&
    !isFetchingBlueprintsCompose &&
    blueprintsComposes?.data[0]?.blueprint_version !== selectedBlueprintVersion;

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (!isSuccess) {
    if (isError) {
      return (
        <Alert variant="warning" title="Service unavailable">
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

  const composes = data?.data;
  const itemCount = data?.meta.count || 0;

  return (
    <>
      <>
        <DeleteBlueprintModal
          setShowDeleteModal={setShowDeleteModal}
          isOpen={showDeleteModal}
        />
        <Toolbar>
          {experimentalFlag && (
            <ToolbarContent>
              <Title headingLevel="h1">All image types</Title>
            </ToolbarContent>
          )}
          <ToolbarContent>
            {!experimentalFlag && (
              <ToolbarItem>
                <Link
                  to={resolveRelPath('imagewizard')}
                  className="pf-c-button pf-m-primary"
                  data-testid="create-image-action"
                >
                  Create image
                </Link>
              </ToolbarItem>
            )}
            {experimentalFlag && (
              <>
                <ToolbarItem>
                  <BuildImagesButton selectedBlueprint={selectedBlueprintId} />
                </ToolbarItem>
                <ToolbarItem>
                  <BlueprintActionsMenu
                    setShowDeleteModal={setShowDeleteModal}
                  />
                </ToolbarItem>
              </>
            )}
            <ToolbarItem variant="pagination" align={{ default: 'alignRight' }}>
              <Pagination
                itemCount={itemCount}
                perPage={perPage}
                page={page}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                widgetId="compose-pagination-top"
                data-testid="images-pagination-top"
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table variant="compact" data-testid="images-table">
          <Thead>
            <Tr>
              <Th />
              <Th>Image name</Th>
              <Th>Created/Updated</Th>
              <Th>Release</Th>
              <Th>Target</Th>
              {experimentalFlag && <Th>Version</Th>}
              <Th>Status</Th>
              <Th>Instance</Th>
              <Th />
            </Tr>
          </Thead>
          {itemCount === 0 ? (
            <Tbody>
              <Tr>
                <Td colSpan={12}>
                  <ImagesEmptyState selectedBlueprint={selectedBlueprintId} />
                </Td>
              </Tr>
            </Tbody>
          ) : (
            experimentalFlag &&
            isBlueprintOutSync && (
              <Tbody>
                <Tr>
                  <Td colSpan={12}>
                    <Alert
                      isInline
                      title="You haven't built new images for this version of your blueprint yet"
                      ouiaId="blueprint-out-of-sync-alert"
                    />
                  </Td>
                </Tr>
              </Tbody>
            )
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
        <Toolbar className="pf-u-mb-xl">
          <ToolbarContent>
            <ToolbarItem variant="pagination" align={{ default: 'alignRight' }}>
              <Pagination
                variant={PaginationVariant.bottom}
                itemCount={itemCount}
                perPage={perPage}
                page={page}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                widgetId="compose-pagination-bottom"
                data-testid="images-pagination-bottom"
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </>
    </>
  );
};

type ImagesTableRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const ImagesTableRow = ({ compose, rowIndex }: ImagesTableRowPropTypes) => {
  const [pollingInterval, setPollingInterval] = useState(
    STATUS_POLLING_INTERVAL
  );

  const { data: composeStatus } = useGetComposeStatusQuery(
    {
      composeId: compose.id,
    },
    { pollingInterval: pollingInterval }
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

  const type = compose.request.image_requests[0].upload_request.type;

  switch (type) {
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
    computeHoursToExpiration(compose.created_at) / 24
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

  const target = <AwsTarget compose={compose} />;

  const status = <CloudStatus compose={compose} />;

  const instance = <CloudInstance compose={compose} />;

  const details = <AwsDetails compose={compose} />;

  const actions = (
    <ActionsColumn items={awsActions(compose, composeStatus, navigate)} />
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

type RowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  status: JSX.Element;
  target?: JSX.Element;
  actions?: JSX.Element;
  instance: JSX.Element;
  details: JSX.Element;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggle = () => setIsExpanded(!isExpanded);
  const experimentalFlag = useExperimentalFlag();
  const navigate = useNavigate();

  return (
    <Tbody key={compose.id} isExpanded={isExpanded}>
      <Tr className="no-bottom-border">
        <Td
          expand={{
            rowIndex: rowIndex,
            isExpanded: isExpanded,
            onToggle: () => handleToggle(),
          }}
        />
        <Td dataLabel="Image name">{compose.image_name || compose.id}</Td>
        <Td dataLabel="Created">
          {timestampToDisplayString(compose.created_at)}
        </Td>
        <Td dataLabel="Release">
          <Release release={compose.request.distribution} />
        </Td>
        <Td dataLabel="Target">
          {target ? target : <Target compose={compose} />}
        </Td>
        {experimentalFlag && (
          <Td dataLabel="Version">
            <Badge isRead>{compose.blueprint_version || 'N/A'}</Badge>
          </Td>
        )}
        <Td dataLabel="Status">{status}</Td>
        <Td dataLabel="Instance">{instance}</Td>
        <Td>
          {actions ? (
            actions
          ) : (
            <ActionsColumn items={defaultActions(compose, navigate)} />
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
  navigate: NavigateFunction
) => [
  {
    title: 'Recreate image',
    onClick: () => {
      navigate(resolveRelPath(`imagewizard/${compose.id}`));
    },
  },
  {
    title: (
      <a
        className="ib-subdued-link"
        href={`data:text/plain;charset=utf-8,${encodeURIComponent(
          JSON.stringify(compose.request, null, '  ')
        )}`}
        download={`request-${compose.id}.json`}
      >
        Download compose request (.json)
      </a>
    ),
  },
];

const awsActions = (
  compose: ComposesResponseItem,
  status: ComposeStatus | undefined,
  navigate: NavigateFunction
) => [
  {
    title: 'Share to new region',
    onClick: () => navigate(resolveRelPath(`share/${compose.id}`)),
    isDisabled: status?.image_status.status === 'success' ? false : true,
  },
  ...defaultActions(compose, navigate),
];

export default ImagesTable;
