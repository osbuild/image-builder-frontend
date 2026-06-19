import React, { useState } from 'react';

import {
  Button,
  Pagination,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  RhUiCopyIcon,
  RhUiEditIcon,
  RhUiRedoIcon,
} from '@patternfly/react-icons';

import ImagesFilter from './ImagesFilter';

import { DeleteBlueprintModal } from '../../Blueprints/DeleteBlueprintModal';

type NewImagesTableToolbarProps = {
  itemCount: number;
  perPage: number;
  page: number;
  setPage: (page: number) => void;
  onPerPageSelect: (
    event:
      | MouseEvent
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    perPage: number,
  ) => void;
};

const NewImagesTableToolbar: React.FC<NewImagesTableToolbarProps> = ({
  itemCount,
  perPage,
  page,
  setPage,
  onPerPageSelect,
}: NewImagesTableToolbarProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <DeleteBlueprintModal
        setShowDeleteModal={setShowDeleteModal}
        isOpen={showDeleteModal}
      />
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <ImagesFilter />
          </ToolbarItem>
          <ToolbarItem>
            <TextInput
              aria-label='Image filter input'
              placeholder='Find by ...'
              isDisabled
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button variant='primary' icon={<RhUiEditIcon />} isDisabled>
              Edit
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant='secondary' icon={<RhUiCopyIcon />} isDisabled>
              Duplicate
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant='secondary' icon={<RhUiRedoIcon />} isDisabled>
              Rebuild
            </Button>
          </ToolbarItem>
          <ToolbarItem variant='pagination' align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={itemCount}
              perPage={perPage}
              page={page}
              onSetPage={(_, page) => setPage(page)}
              onPerPageSelect={onPerPageSelect}
              widgetId='compose-pagination-top'
              data-testid='images-pagination-top'
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </>
  );
};

export default NewImagesTableToolbar;
