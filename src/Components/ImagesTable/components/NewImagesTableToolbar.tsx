import React, { useEffect, useState } from 'react';

import {
  Button,
  Pagination,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  RhUiCopyIcon,
  RhUiEditIcon,
  RhUiRedoIcon,
} from '@patternfly/react-icons';

import { setBlueprintSearchInput } from '@/store/slices/blueprint';

import ImagesFilter from './ImagesFilter';

import { useAppDispatch } from '../../../store/hooks';
import useDebounce from '../../../Utilities/useDebounce';
import { DeleteBlueprintModal } from '../../Blueprints/DeleteBlueprintModal';
import { filterOptions } from '../constants';

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
  const dispatch = useAppDispatch();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('name');
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearchValue = useDebounce(searchValue);

  const selectedFilter = filterOptions.find(
    (option) => option.value === filterCategory,
  );
  const placeholder = selectedFilter
    ? `Find by ${selectedFilter.label.toLowerCase()}`
    : 'Find';

  useEffect(() => {
    // TODO - only name is implemented for now
    if (filterCategory === 'name') {
      dispatch(
        setBlueprintSearchInput(
          debouncedSearchValue.length > 0 ? debouncedSearchValue : undefined,
        ),
      );
      setPage(1);
    }
  }, [debouncedSearchValue, filterCategory, dispatch, setPage]);

  return (
    <>
      <DeleteBlueprintModal
        setShowDeleteModal={setShowDeleteModal}
        isOpen={showDeleteModal}
      />
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <ImagesFilter
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
            />
          </ToolbarItem>
          <ToolbarItem>
            <SearchInput
              placeholder={placeholder}
              value={searchValue}
              onChange={(_event, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
              isDisabled={filterCategory !== 'name'}
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
