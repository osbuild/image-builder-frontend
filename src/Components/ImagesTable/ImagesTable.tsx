import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  OnSetPage,
  Pagination,
  PaginationVariant,
  Text,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  EmptyStateActions,
  EmptyStateHeader,
  EmptyStateFooter,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
  SelectList,
  Badge,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
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
  ComposesResponseItem,
  ComposeStatus,
  useGetComposesQuery,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';
import { Blueprint } from '../../store/imageBuilderApiExperimental';
import { resolveRelPath } from '../../Utilities/path';
import {
  computeHoursToExpiration,
  timestampToDisplayString,
} from '../../Utilities/time';
interface imagesTableProps {
  blueprints?: Blueprint[];
  selectedBlueprint?: string;
  setSelectedBlueprint?: Dispatch<SetStateAction<string>>;
}
const ImagesTable = (props: imagesTableProps) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false);
  const [isVersionSelectOpen, setIsVersionSelectOpen] = useState(false);
  interface filterProps {
    imageType: string[];
    version: string[];
  }
  const [filters, setFilters] = useState<filterProps>({
    imageType: [],
    version: [],
  });

  const experimentalFlag = process.env.EXPERIMENTAL;

  const selectedBlueprintName = props.blueprints?.find(
    (blueprint: Blueprint) => blueprint.id === props.selectedBlueprint
  )?.name;

  const onSelect = (
    selectType: string,
    event: React.MouseEvent | React.ChangeEvent | undefined,
    selection: string
  ) => {
    const checked = (event?.target as HTMLInputElement).checked;
    setFilters((prev: filterProps) => {
      const prevSelections = prev[selectType as keyof filterProps];
      return {
        ...prev,
        [selectType]: checked
          ? [...prevSelections, selection]
          : prevSelections.filter((value: string) => value !== selection),
      };
    });
  };

  const onTypeSelect = (
    event: React.MouseEvent | React.ChangeEvent | undefined,
    selection: string
  ) => {
    onSelect('imageType', event, selection);
  };

  const onVersionSelect = (
    event: React.MouseEvent | React.ChangeEvent | undefined,
    selection: string
  ) => {
    onSelect('version', event, selection);
  };

  const onDelete = (filterType: string, selection: string) => {
    const filterTypeSelections = filters.imageType.filter(
      (fil: string) => fil !== selection
    );
    if (filterType === 'imageType') {
      setFilters({
        imageType: filterTypeSelections,
        version: filters.version,
      });
    } else if (filterType === 'version') {
      setFilters({
        imageType: filters.imageType.filter((fil: string) => fil !== selection),
        version: filters.version.filter((fil: string) => fil !== selection),
      });
    } else {
      setFilters({ imageType: [], version: [] });
    }
  };

  const onDeleteGroup = (filterType: string) => {
    if (filterType === 'imageType') {
      setFilters({ imageType: [], version: filters.version });
    } else if (filterType === 'version') {
      setFilters({ imageType: filters.imageType, version: [] });
    }
  };

  const onSetPage: OnSetPage = (_, page) => setPage(page);

  const onPerPageSelect: OnSetPage = (_, perPage) => {
    setPage(1);
    setPerPage(perPage);
  };

  const { data, isSuccess } = useGetComposesQuery({
    limit: perPage,
    offset: perPage * (page - 1),
    ignoreImageTypes: [
      'rhel-edge-commit',
      'rhel-edge-installer',
      'edge-commit',
      'edge-installer',
    ],
  });

  if (!isSuccess) {
    return undefined;
  }

  const composes = data.data;
  const itemCount = data.meta.count;

  const typeMenuItems = (
    <SelectList>
      <SelectOption
        hasCheckbox
        key="typeConventional"
        value="Conventional"
        isSelected={filters.imageType.includes('Conventional')}
      >
        Conventional
      </SelectOption>
      <SelectOption
        hasCheckbox
        key="typeImmutable"
        value="Immutable"
        isSelected={filters.imageType.includes('Immutable')}
        isDisabled
      >
        Immutable
      </SelectOption>
    </SelectList>
  );

  const versionMenuItems = (
    <SelectList>
      <SelectOption
        hasCheckbox
        key="versionNewest"
        value="Newest"
        isSelected={filters.version.includes('Newest')}
        isDisabled
      >
        Newest
      </SelectOption>
      <SelectOption
        hasCheckbox
        key="versionOldest"
        value="Oldest"
        isSelected={filters.version.includes('Oldest')}
        isDisabled
      >
        Oldest
      </SelectOption>
    </SelectList>
  );

  return (
    <>
      {data.meta.count === 0 && <EmptyImagesTable />}
      {data.meta.count > 0 && (
        <>
          <Toolbar
            clearAllFilters={() => {
              onDelete('', '');
              props.setSelectedBlueprint
                ? props.setSelectedBlueprint('')
                : null;
            }}
          >
            <ToolbarContent>
              {experimentalFlag && (
                <ToolbarGroup variant="filter-group">
                  <ToolbarFilter
                    categoryName="imageType"
                    chips={filters.imageType}
                    deleteChip={(category, chip) =>
                      onDelete(category as string, chip as string)
                    }
                    deleteChipGroup={(category) =>
                      onDeleteGroup(category as string)
                    }
                  >
                    <Select
                      aria-label="Select image type"
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsTypeSelectOpen(!isTypeSelectOpen)}
                          isExpanded={isTypeSelectOpen}
                        >
                          Image type
                          {filters.imageType.length > 0 && (
                            <Badge isRead>{filters.imageType.length}</Badge>
                          )}
                        </MenuToggle>
                      )}
                      onSelect={onTypeSelect}
                      selected={filters.imageType}
                      isOpen={isTypeSelectOpen}
                      onOpenChange={(isOpen) => setIsTypeSelectOpen(isOpen)}
                    >
                      {typeMenuItems}
                    </Select>
                  </ToolbarFilter>
                  <ToolbarFilter
                    categoryName="version"
                    chips={filters.version}
                    deleteChip={(category, chip) =>
                      onDelete(category as string, chip as string)
                    }
                    deleteChipGroup={(category) =>
                      onDeleteGroup(category as string)
                    }
                  >
                    <Select
                      aria-label="Select image version"
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() =>
                            setIsVersionSelectOpen(!isVersionSelectOpen)
                          }
                          isExpanded={isVersionSelectOpen}
                        >
                          Image version
                          {filters.version.length > 0 && (
                            <Badge isRead>{filters.version.length}</Badge>
                          )}
                        </MenuToggle>
                      )}
                      onSelect={onVersionSelect}
                      selected={filters.version}
                      isOpen={isVersionSelectOpen}
                      onOpenChange={(isOpen) => setIsVersionSelectOpen(isOpen)}
                    >
                      {versionMenuItems}
                    </Select>
                  </ToolbarFilter>
                  <ToolbarFilter
                    categoryName="blueprint"
                    chips={selectedBlueprintName ? [selectedBlueprintName] : []}
                    deleteChip={() =>
                      props.setSelectedBlueprint
                        ? props.setSelectedBlueprint('')
                        : null
                    }
                  >
                    {}
                  </ToolbarFilter>
                </ToolbarGroup>
              )}
              <ToolbarItem
                variant="pagination"
                align={{ default: 'alignRight' }}
              >
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
                <Th>Status</Th>
                <Th>Instance</Th>
                <Th />
              </Tr>
            </Thead>
            {composes.map((compose, rowIndex) => {
              if (
                props.selectedBlueprint &&
                compose.blueprint_id !== props.selectedBlueprint
              ) {
                return null;
              }
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
              <ToolbarItem
                variant="pagination"
                align={{ default: 'alignRight' }}
              >
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
      )}
    </>
  );
};

const EmptyImagesTable = () => {
  return (
    <EmptyState variant={EmptyStateVariant.lg} data-testid="empty-state">
      <EmptyStateHeader
        titleText="Create an RPM-DNF image"
        icon={<EmptyStateIcon icon={PlusCircleIcon} />}
        headingLevel="h4"
      />
      <EmptyStateBody>
        <Text>
          Image builder is a tool for creating deployment-ready customized
          system images: installation disks, virtual machines, cloud
          vendor-specific images, and others. By using image builder, you can
          create these images faster than manual procedures because it
          eliminates the specific configurations required for each output type.
        </Text>
        <br />
        <Text>
          With RPM-DNF, you can manage the system software by using the DNF
          package manager and updated RPM packages. This is a simple and
          adaptive method of managing and modifying the system over its
          lifecycle.
        </Text>
        <br />
        <Text>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={
              'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html-single/managing_software_with_the_dnf_tool/index'
            }
          >
            Learn more about managing images with DNF
          </Button>
        </Text>
      </EmptyStateBody>
      <EmptyStateFooter>
        <Link
          to={resolveRelPath('imagewizard')}
          className="pf-c-button pf-m-primary"
          data-testid="create-image-action"
        >
          Create image
        </Link>
        <EmptyStateActions>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={
              'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/creating_customized_rhel_images_using_the_image_builder_service'
            }
            className="pf-u-pt-md"
          >
            Image builder for RPM-DNF documentation
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
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
