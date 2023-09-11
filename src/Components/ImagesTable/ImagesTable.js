import React, { useEffect, useState } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Pagination,
  PaginationVariant,
  Text,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import {
  ActionsColumn,
  ExpandableRowContent,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import './ImagesTable.scss';
import { ImageBuildStatus } from './ImageBuildStatus';
import ImageDetails from './ImageDetails';
import ImageLink from './ImageLink';
import Release from './Release';
import Target from './Target';

import { AWS_S3_EXPIRATION_TIME_IN_HOURS } from '../../constants';
import { fetchComposes, fetchComposeStatus } from '../../store/actions/actions';
import { resolveRelPath } from '../../Utilities/path';
import {
  hoursToExpiration,
  timestampToDisplayString,
} from '../../Utilities/time';

const ImagesTable = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [expandedComposeIds, setExpandedComposeIds] = useState([]);
  const isExpanded = (compose) => expandedComposeIds.includes(compose.id);

  const handleToggle = (compose, isExpanding) => {
    if (isExpanding) {
      setExpandedComposeIds([...expandedComposeIds, compose.id]);
    } else {
      setExpandedComposeIds(
        expandedComposeIds.filter((id) => id !== compose.id)
      );
    }
  };

  const composes = useSelector((state) => state.composes);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  // @ts-ignore
  const ImageType = (compose) => {
    Object.entries(composes.byId).map(([id, compose]) => {
      /* Skip composes that have been complete */
      if (
        compose.request.image_requests[0].image_type !== 'rhel-edge-commit' &&
        compose.request.image_requests[0].image_type !== 'rhel-edge-installer'
      ) {
        return compose.id;
      } else {
        return null;
      }
    });
  };
  const pollComposeStatuses = () => {
    Object.entries(composes.byId).map(([id, compose]) => {
      /* Skip composes that have been complete */
      if (
        compose.image_status?.status === 'success' ||
        compose.image_status?.status === 'failure'
      ) {
        return;
      }

      dispatch(fetchComposeStatus(id));
    });
  };

  /* Get all composes once on mount */
  useEffect(() => {
    dispatch(fetchComposes(perPage, 0));
  }, []);

  /* Reset the polling each time the composes in the store are updated */
  useEffect(() => {
    const intervalId = setInterval(() => pollComposeStatuses(), 8000);
    // clean up interval on unmount
    return () => clearInterval(intervalId);
  });

  const onSetPage = (_, page) => {
    // if the next page's composes haven't been fetched from api yet
    // then fetch them with proper page index and offset
    if (composes.count > composes.allIds.length) {
      const pageIndex = page - 1;
      const offset = pageIndex * perPage;
      dispatch(fetchComposes(perPage, offset));
    }

    setPage(page);
  };

  const onPerPageSelect = (_, perPage) => {
    // if the new per page quantity is greater than the number of already fetched composes fetch more composes
    // if all composes haven't already been fetched
    if (
      composes.count > composes.allIds.length &&
      perPage > composes.allIds.length
    ) {
      dispatch(fetchComposes(perPage, 0));
    }

    // page should be reset to the first page when the page size is changed.
    setPerPage(perPage);
    setPage(1);
  };

  const actions = (compose) => [
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

  const awsActions = (compose) => [
    {
      title: 'Share to new region',
      onClick: () => navigate(resolveRelPath(`share/${compose.id}`)),
      isDisabled: compose?.image_status?.status === 'success' ? false : true,
    },
    ...actions(compose),
  ];

  // the state.page is not an index so must be reduced by 1 get the starting index
  const itemsStartInclusive = (page - 1) * perPage;
  const itemsEndExclusive = itemsStartInclusive + perPage;

  return (
    <React.Fragment>
      {(composes.allIds.length === 0 && (
        <EmptyState variant={EmptyStateVariant.large} data-testid="empty-state">
          <EmptyStateIcon icon={PlusCircleIcon} />
          <Title headingLevel="h4" size="lg">
            Create an RPM-DNF image
          </Title>
          <EmptyStateBody>
            <Text>
              Image builder is a tool for creating deployment-ready customized
              system images: installation disks, virtual machines, cloud
              vendor-specific images, and others. By using image builder, you
              can create these images faster than manual procedures because it
              eliminates the specific configurations required for each output
              type.
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
          <Link
            to={resolveRelPath('imagewizard')}
            className="pf-c-button pf-m-primary"
            data-testid="create-image-action"
          >
            Create image
          </Link>
          <EmptyStateSecondaryActions>
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
          </EmptyStateSecondaryActions>
        </EmptyState>
      )) || (
        <React.Fragment>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <Link
                  to={resolveRelPath('imagewizard')}
                  className="pf-c-button pf-m-primary"
                  data-testid="create-image-action"
                >
                  Create image
                </Link>
              </ToolbarItem>
              <ToolbarItem
                variant="pagination"
                align={{ default: 'alignRight' }}
              >
                <Pagination
                  itemCount={composes.count}
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
          <TableComposable variant="compact" data-testid="images-table">
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
            {composes.allIds
              .slice(itemsStartInclusive, itemsEndExclusive)
              .map((id, rowIndex) => {
                const compose = composes.byId[id];

                if (
                  compose &&
                  compose.request &&
                  compose.request.image_requests &&
                  compose.request.image_requests[0]
                ) {
                  const imageType =
                    compose.request.image_requests[0].image_type;

                  // Check if the image_type is not 'rhel-edge-commit' and 'rhel-edge-installer'
                  if (
                    imageType !== 'rhel-edge-commit' &&
                    imageType !== 'rhel-edge-installer'
                  ) {
                    return (
                      <Tbody key={id} isExpanded={isExpanded(compose)}>
                        <Tr className="no-bottom-border">
                          <Td
                            expand={{
                              rowIndex,
                              isExpanded: isExpanded(compose),
                              onToggle: () =>
                                handleToggle(compose, !isExpanded(compose)),
                            }}
                          />
                          <Td dataLabel="Image name">
                            {compose.request.image_name || id}
                          </Td>
                          <Td dataLabel="Created">
                            {timestampToDisplayString(compose.created_at)}
                          </Td>
                          <Td dataLabel="Release">
                            <Release release={compose.request.distribution} />
                          </Td>
                          <Td dataLabel="Target">
                            <Target composeId={id} />
                          </Td>
                          <Td dataLabel="Status">
                            <ImageBuildStatus
                              imageId={id}
                              isImagesTableRow={true}
                              imageStatus={compose.image_status}
                            />
                          </Td>
                          <Td dataLabel="Instance">
                            <ImageLink
                              imageId={id}
                              isExpired={
                                hoursToExpiration(compose.created_at) >=
                                AWS_S3_EXPIRATION_TIME_IN_HOURS
                                  ? true
                                  : false
                              }
                            />
                          </Td>
                          <Td>
                            {compose.request.image_requests[0].upload_request
                              .type === 'aws' ? (
                              <ActionsColumn items={awsActions(compose)} />
                            ) : (
                              <ActionsColumn items={actions(compose)} />
                            )}
                          </Td>
                        </Tr>
                        <Tr isExpanded={isExpanded(compose)}>
                          <Td colSpan={8}>
                            <ExpandableRowContent>
                              <ImageDetails id={id} />
                            </ExpandableRowContent>
                          </Td>
                        </Tr>
                      </Tbody>
                    );
                  }
                }

                return null; // Exclude composes that don't meet the criteria
              })}
          </TableComposable>
          <Toolbar className="pf-u-mb-xl">
            <ToolbarContent>
              <ToolbarItem
                variant="pagination"
                align={{ default: 'alignRight' }}
              >
                <Pagination
                  variant={PaginationVariant.bottom}
                  itemCount={composes.count}
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
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

ImagesTable.propTypes = {
  composes: PropTypes.object,
  composesGet: PropTypes.func,
  composeGetStatus: PropTypes.func,
};

export default ImagesTable;
