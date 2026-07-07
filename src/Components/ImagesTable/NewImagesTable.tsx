import React, { useEffect, useMemo, useState } from 'react';

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
} from '@/store/slices/blueprint';
import { selectIsOnPremise } from '@/store/slices/env';

import ImagesEmptyState from './components/EmptyState';
import NewImagesTableToolbar from './components/NewImagesTableToolbar';
import { ImagesTableRow } from './components/Row';
import BlueprintTableRow from './components/Row/components/BlueprintTableRow';

import { SEARCH_INPUT } from '../../constants';
import { useEffectiveBlueprintId, useGetUser } from '../../Hooks';
import { useAppSelector } from '../../store/hooks';

const NewImagesTable = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<
    string | undefined
  >(undefined);

  const effectiveBlueprintId = useEffectiveBlueprintId();
  const blueprintSearchInput =
    useAppSelector(selectBlueprintSearchInput) || SEARCH_INPUT;
  const blueprintVersionFilter = useAppSelector(selectBlueprintVersionFilter);
  const blueprintVersionFilterAPI = useAppSelector(
    selectBlueprintVersionFilterAPI,
  );

  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const handleBlueprintSelect = (id: string) => {
    setSelectedBlueprintId((prev) => (prev === id ? undefined : id));
  };

  const searchParamsGetBlueprints: GetBlueprintsApiArg = {
    limit: 100,
    offset: 0,
  };

  if (blueprintSearchInput) {
    searchParamsGetBlueprints.search = blueprintSearchInput;
  }

  const { data: blueprintsData, isLoading: isLoadingBlueprints } =
    useGetBlueprintsQuery(searchParamsGetBlueprints);

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
      limit: 100,
      offset: 0,
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
  const isLoading =
    isLoadingComposes ||
    isLoadingBlueprints ||
    (effectiveBlueprintId && isLoadingBlueprintsCompose);

  const blueprints = blueprintsData?.data || [];

  let composes = data?.data;
  if (effectiveBlueprintId && blueprintVersionFilter === 'latest') {
    composes = composes?.filter((compose) => {
      return compose.blueprint_version === selectedBlueprintVersion;
    });
  }

  // TODO: Add server-side search parameter to the composes API endpoint
  // This filters composes on the client-side because the API doesn't
  // support searching through composes by their name
  // We're limited to filtering only within the fetched 100 composes
  if (blueprintSearchInput && composes) {
    const searchLower = blueprintSearchInput.toLowerCase();
    composes = composes.filter((compose) => {
      const imageName = compose.image_name || compose.id;
      return imageName.toLowerCase().includes(searchLower);
    });
  }

  const { paginatedItems, itemCount } = useMemo(() => {
    const blueprintIdsWithComposes = new Set(
      composes?.map((compose) => compose.blueprint_id).filter(Boolean) ?? [],
    );
    const blueprintsWithoutComposes = blueprints.filter(
      (blueprint) => !blueprintIdsWithComposes.has(blueprint.id),
    );

    const combinedItems = [
      ...blueprintsWithoutComposes.map((blueprint) => ({
        type: 'blueprint' as const,
        blueprint,
        date: blueprint.last_modified_at,
      })),
      ...(composes?.map((compose) => ({
        type: 'compose' as const,
        compose,
        date: compose.created_at,
      })) ?? []),
    ];

    combinedItems.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const totalItems = combinedItems.length;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = combinedItems.slice(startIndex, endIndex);

    return { paginatedItems, itemCount: totalItems };
  }, [blueprints, composes, page, perPage]);

  useEffect(() => {
    if (!isOnPremise) {
      const orgId = userData?.identity.internal?.org_id;

      analytics.group(orgId, {
        imagebuilder_image_count: composesData?.meta.count,
      });
    }
    // analytics is an external API and doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOnPremise,
    userData?.identity.internal?.org_id,
    composesData?.meta.count,
  ]);

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

  return (
    <PageSection>
      <NewImagesTableToolbar
        itemCount={itemCount}
        perPage={perPage}
        page={page}
        setPage={setPage}
        onPerPageSelect={onPerPageSelect}
      />
      <Table data-testid='images-table'>
        <Thead>
          <Tr>
            <Th
              style={{ minWidth: itemCount === 0 ? '30px' : 'auto' }}
              aria-label='Details expandable'
            />
            <Th
              select={{
                onSelect: () => {},
                isSelected: false,
              }}
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
              <Td colSpan={9}>
                <ImagesEmptyState
                  selectedBlueprint={effectiveBlueprintId || ''}
                />
              </Td>
            </Tr>
          </Tbody>
        )}

        {paginatedItems.map((item, rowIndex) => {
          if (item.type === 'blueprint') {
            return (
              <BlueprintTableRow
                blueprint={item.blueprint}
                rowIndex={rowIndex}
                key={`blueprint-${item.blueprint.id}`}
                onSelect={handleBlueprintSelect}
                isSelected={selectedBlueprintId === item.blueprint.id}
              />
            );
          } else {
            return (
              <ImagesTableRow
                compose={item.compose}
                rowIndex={rowIndex}
                key={`compose-${item.compose.id}`}
                onSelect={handleBlueprintSelect}
                isSelected={selectedBlueprintId === item.compose.id}
              />
            );
          }
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
