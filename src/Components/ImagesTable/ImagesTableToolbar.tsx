import React, { useState } from 'react';

import {
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Title,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import {
  selectSelectedBlueprintId,
  selectBlueprintSearchInput,
} from '../../store/BlueprintSlice';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintItem,
  useGetBlueprintsQuery,
} from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';
import { useExperimentalFlag } from '../../Utilities/useExperimentalFlag';
import { BlueprintActionsMenu } from '../Blueprints/BlueprintActionsMenu';
import BlueprintVersionFilter from '../Blueprints/BlueprintVersionFilter';
import { BuildImagesButton } from '../Blueprints/BuildImagesButton';
import { DeleteBlueprintModal } from '../Blueprints/DeleteBlueprintModal';

interface imagesTableToolbarProps {
  itemCount: number;
  perPage: number;
  page: number;
  setPage: (page: number) => void;
  onPerPageSelect: (event: React.MouseEvent, perPage: number) => void;
}

const ImagesTableToolbar: React.FC<imagesTableToolbarProps> = ({
  itemCount,
  perPage,
  page,
  setPage,
  onPerPageSelect,
}: imagesTableToolbarProps) => {
  const experimentalFlag = useExperimentalFlag();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput = useAppSelector(selectBlueprintSearchInput);

  const { selectedBlueprintName } = useGetBlueprintsQuery(
    { search: blueprintSearchInput },
    {
      selectFromResult: ({ data }) => ({
        selectedBlueprintName: data?.data?.find(
          (blueprint: BlueprintItem) => blueprint.id === selectedBlueprintId
        )?.name,
      }),
    }
  );

  const pagination = (
    <Pagination
      itemCount={itemCount}
      perPage={perPage}
      page={page}
      onSetPage={(_, page) => setPage(page)}
      onPerPageSelect={onPerPageSelect}
      widgetId="compose-pagination-top"
      data-testid="images-pagination-top"
      isCompact
    />
  );

  if (!experimentalFlag) {
    return (
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
          <ToolbarItem variant="pagination" align={{ default: 'alignRight' }}>
            {pagination}
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    );
  }

  return (
    <>
      <DeleteBlueprintModal
        setShowDeleteModal={setShowDeleteModal}
        isOpen={showDeleteModal}
      />
      <Toolbar>
        <ToolbarContent>
          <Title headingLevel="h1">
            {selectedBlueprintId
              ? `${selectedBlueprintName} images`
              : 'All images'}
          </Title>
        </ToolbarContent>
        <ToolbarContent>
          <ToolbarItem>
            <BuildImagesButton />
          </ToolbarItem>
          <ToolbarItem>
            <BlueprintActionsMenu setShowDeleteModal={setShowDeleteModal} />
          </ToolbarItem>
          {selectedBlueprintId && (
            <ToolbarItem>
              <BlueprintVersionFilter onFilterChange={() => setPage(1)} />
            </ToolbarItem>
          )}
          <ToolbarItem variant="pagination" align={{ default: 'alignRight' }}>
            {pagination}
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </>
  );
};

export default ImagesTableToolbar;
