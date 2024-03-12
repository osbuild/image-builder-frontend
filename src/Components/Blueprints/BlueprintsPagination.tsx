import React from 'react';

import {
  OnSetPage,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';

import {
  selectBlueprintSearchInput,
  selectLimit,
  selectOffset,
  setBlueprintLimit,
  setBlueprintsOffset,
} from '../../store/BlueprintSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useGetBlueprintsQuery } from '../../store/imageBuilderApi';

const BlueprintsPagination = () => {
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);
  const blueprintsOffset = useAppSelector(selectOffset) || 0;
  const blueprintsLimit = useAppSelector(selectLimit) || 10;
  const currPage = Math.floor(blueprintsOffset / blueprintsLimit) + 1;
  const { data: blueprintsData } = useGetBlueprintsQuery({
    search: blueprintSearchInput,
    limit: blueprintsLimit,
    offset: blueprintsOffset,
  });
  const dispatch = useAppDispatch();

  const blueprintsTotal = blueprintsData?.meta?.count || 0;
  const onSetPage: OnSetPage = (_, page) => {
    const direction = page > currPage ? 1 : -1; // Calculate offset based on direction of paging
    const nextOffset = blueprintsOffset + direction * blueprintsLimit;
    dispatch(setBlueprintsOffset(nextOffset));
  };
  const onPerPageSelect: OnSetPage = (_, perPage) => {
    dispatch(setBlueprintsOffset(0));
    dispatch(setBlueprintLimit(perPage));
  };
  return (
    <Pagination
      variant={PaginationVariant.bottom}
      itemCount={blueprintsTotal}
      perPage={blueprintsLimit}
      page={currPage}
      onSetPage={onSetPage}
      onPerPageSelect={onPerPageSelect}
      widgetId="blueprints-pagination-bottom"
      data-testid="blueprints-pagination-bottom"
      isCompact
    />
  );
};

export default BlueprintsPagination;
