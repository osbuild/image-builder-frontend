import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Pagination,
  PaginationVariant,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import './ImagesTable.scss';
import ImageBuildStatus from './ImageBuildStatus';
import Release from './Release';
import Target from './Target';
import ImageLink from './ImageLink';
import ErrorDetails from './ImageBuildErrorDetails';
import DocumentationButton from '../sharedComponents/DocumentationButton';
import { fetchComposes, fetchComposeStatus } from '../../store/actions/actions';
import { resolveRelPath } from '../../Utilities/path';

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

  const timestampToDisplayString = (ts) => {
    // timestamp has format 2021-04-27 12:31:12.794809 +0000 UTC
    // must be converted to ms timestamp and then reformatted to Apr 27, 2021
    if (!ts) {
      return '';
    }

    // get YYYY-MM-DD format
    const date = ts.slice(0, 10);
    const ms = Date.parse(date);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const tsDisplay = new Intl.DateTimeFormat('en-US', options).format(ms);
    return tsDisplay;
  };

  const convertStringToDate = (createdAtAsString) => {
    if (isNaN(Date.parse(createdAtAsString))) {
      // converts property created_at of the image object from string to UTC
      const [dateValues, timeValues] = createdAtAsString.split(' ');
      const datetimeString = `${dateValues}T${timeValues}Z`;
      return Date.parse(datetimeString);
    } else {
      return Date.parse(createdAtAsString);
    }
  };

  const setComposeStatus = (compose) => {
    if (!compose.image_status) {
      return '';
    } else if (
      compose.request.image_requests[0].upload_request.type !== 'aws.s3' ||
      compose.image_status.status !== 'success'
    ) {
      return compose.image_status.status;
    } else if (
      hoursToExpiration(compose.created_at) >= s3ExpirationTimeInHours
    ) {
      return 'expired';
    } else {
      return 'expiring';
    }
  };

  const hoursToExpiration = (imageCreatedAt) => {
    if (imageCreatedAt) {
      const currentTime = Date.now();
      // miliseconds in hour - needed for calculating the difference
      // between current date and the date of the image creation
      const msInHour = 1000 * 60 * 60;
      const timeUntilExpiration = Math.floor(
        (currentTime - convertStringToDate(imageCreatedAt)) / msInHour
      );
      return timeUntilExpiration;
    } else {
      // when creating a new image, the compose.created_at can be undefined when first queued
      return 0;
    }
  };

  const actions = (compose) => [
    {
      title: 'Recreate image',
      onClick: () =>
        navigate(resolveRelPath('imagewizard'), {
          state: { composeRequest: compose.request, initialStep: 'review' },
        }),
    },
    {
      title: (
        <a
          className="ib-subdued-link"
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(
            JSON.stringify(compose.request)
          )}`}
          download={`request-${compose.id}.json`}
        >
          Download compose request (.json)
        </a>
      ),
    },
  ];

  // the state.page is not an index so must be reduced by 1 get the starting index
  const itemsStartInclusive = (page - 1) * perPage;
  const itemsEndExclusive = itemsStartInclusive + perPage;

  const s3ExpirationTimeInHours = 6;

  return (
    <React.Fragment>
      {(composes.allIds.length === 0 && (
        <EmptyState variant={EmptyStateVariant.large} data-testid="empty-state">
          <EmptyStateIcon icon={PlusCircleIcon} />
          <Title headingLevel="h4" size="lg">
            Create an image
          </Title>
          <EmptyStateBody>
            Create OS images for deployment in Amazon Web Services, Microsoft
            Azure and Google Cloud Platform. Images can include a custom package
            set and an activation key to automate the registration process.
          </EmptyStateBody>
          <Link
            to={resolveRelPath('imagewizard')}
            className="pf-c-button pf-m-primary"
            data-testid="create-image-action"
          >
            Create image
          </Link>
          <EmptyStateSecondaryActions>
            <DocumentationButton />
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
                <Th>Created</Th>
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
                return (
                  <Tbody key={id} isExpanded={isExpanded(compose)}>
                    <Tr>
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
                        <Target
                          uploadType={
                            compose.request.image_requests[0].upload_request
                              .type
                          }
                          imageType={
                            compose.request.image_requests[0].image_type
                          }
                        />
                      </Td>
                      <Td dataLabel="Status">
                        <ImageBuildStatus
                          status={setComposeStatus(compose)}
                          remainingHours={
                            s3ExpirationTimeInHours -
                            hoursToExpiration(compose.created_at)
                          }
                        />
                      </Td>
                      <Td dataLabel="Instance">
                        <ImageLink
                          imageId={id}
                          imageName={compose.request.image_name || id}
                          imageStatus={compose.image_status}
                          imageType={
                            compose.request.image_requests[0].image_type
                          }
                          uploadOptions={
                            compose.request.image_requests[0].upload_request
                              .options
                          }
                          isExpired={
                            hoursToExpiration(compose.created_at) >=
                            s3ExpirationTimeInHours
                              ? true
                              : false
                          }
                          recreateImage={compose.request}
                        />
                      </Td>
                      <Td>
                        <ActionsColumn items={actions(compose)} />
                      </Td>
                    </Tr>
                    <Tr isExpanded={isExpanded(compose)}>
                      <Td colSpan={8}>
                        <ExpandableRowContent>
                          <strong>UUID</strong>
                          <div>{id}</div>
                          <ErrorDetails status={compose.image_status} />
                        </ExpandableRowContent>
                      </Td>
                    </Tr>
                  </Tbody>
                );
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
