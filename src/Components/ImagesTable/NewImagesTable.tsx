import React, { useState } from 'react';

import {
  Alert,
  Bullseye,
  PageSection,
  Pagination,
  PaginationVariant,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { OnSetPage } from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import {
  BlueprintItem,
  GetBlueprintComposesApiArg,
  GetBlueprintsApiArg,
  useGetBlueprintComposesQuery,
  useGetBlueprintsQuery,
  useGetComposesQuery,
} from '@/store/api/backend';
import {
  selectBlueprintSearchInput,
  selectBlueprintVersionFilter,
  selectBlueprintVersionFilterAPI,
  selectLimit,
  selectOffset,
} from '@/store/slices/blueprint';
import { selectIsOnPremise } from '@/store/slices/env';

import ImagesEmptyState from './components/EmptyState';
import NewImagesTableToolbar from './components/NewImagesTableToolbar';
import { ImagesTableRow } from './components/Row';

import {
  PAGINATION_LIMIT,
  PAGINATION_OFFSET,
  SEARCH_INPUT,
} from '../../constants';
import { useEffectiveBlueprintId, useGetUser } from '../../Hooks';
import { useAppSelector } from '../../store/hooks';

const NewImagesTable = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const effectiveBlueprintId = useEffectiveBlueprintId();
  const blueprintSearchInput =
    useAppSelector(selectBlueprintSearchInput) || SEARCH_INPUT;
  const blueprintVersionFilter = useAppSelector(selectBlueprintVersionFilter);
  const blueprintVersionFilterAPI = useAppSelector(
    selectBlueprintVersionFilterAPI,
  );
  const blueprintsOffset = useAppSelector(selectOffset) || PAGINATION_OFFSET;
  const blueprintsLimit = useAppSelector(selectLimit) || PAGINATION_LIMIT;

  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

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
          (blueprint: BlueprintItem) => blueprint.id === effectiveBlueprintId,
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
    id: effectiveBlueprintId as string,
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
    error: blueprintsError,
  } = useGetBlueprintComposesQuery(searchParamsGetBlueprintComposes, {
    skip: !effectiveBlueprintId,
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
    { skip: !!effectiveBlueprintId },
  );

  const data = effectiveBlueprintId ? blueprintsComposes : composesData;
  const isSuccess = effectiveBlueprintId
    ? isBlueprintsSuccess
    : isComposesSuccess;
  const isError = effectiveBlueprintId ? isBlueprintsError : isComposesError;
  const isLoading = effectiveBlueprintId
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
  const isBlueprintNotFound =
    effectiveBlueprintId &&
    blueprintsError &&
    typeof blueprintsError === 'object' &&
    'status' in blueprintsError &&
    blueprintsError.status === 404;

  if (!isOnPremise && !isSuccess) {
    if (isBlueprintNotFound) {
      return (
        <Alert variant='warning' title='Blueprint not found'>
          <p>Blueprint {effectiveBlueprintId} not found.</p>
        </Alert>
      );
    }
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
  if (effectiveBlueprintId && blueprintVersionFilter === 'latest') {
    composes = composes?.filter((compose) => {
      return compose.blueprint_version === selectedBlueprintVersion;
    });
  }
  const itemCount = data?.meta.count || 0;

  if (!isOnPremise) {
    const orgId = userData?.identity.internal?.org_id;

    analytics.group(orgId, {
      imagebuilder_image_count: composesData?.meta.count,
    });
  }

  return (
    <PageSection>
      <NewImagesTableToolbar
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
            <Th>Last updated</Th>
            <Th>Operating system</Th>
            <Th>Target environment</Th>
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
                  selectedBlueprint={effectiveBlueprintId || ''}
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

export default NewImagesTable;
