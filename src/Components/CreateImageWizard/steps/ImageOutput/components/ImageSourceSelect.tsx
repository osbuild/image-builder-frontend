import React, { useState } from 'react';

import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeImageSource,
  selectImageSource,
} from '../../../../../store/wizardSlice';

const ImageSourceSelect = () => {
  const dispatch = useAppDispatch();
  const imageSource = useAppSelector(selectImageSource);
  const [isOpen, setIsOpen] = useState(false);

  const setImageSource = (_event?: React.MouseEvent, selection?: string) => {
    if (selection === undefined) return;
    dispatch(changeImageSource(selection));
    setIsOpen(false);
  };

  const dummyOptions = ['dummy-rhel-10-image', 'dummy-rhel-9-image'];

  const refreshImageSources = () => {
    // TODO
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
      {imageSource}
    </MenuToggle>
  );

  return (
    <FormGroup label='Image source' isRequired>
      <Flex>
        <FlexItem>
          <Select
            isOpen={isOpen}
            selected={imageSource}
            onSelect={setImageSource}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            toggle={toggle}
            shouldFocusToggleOnSelect
          >
            <SelectList>
              {dummyOptions.map((option) => (
                <SelectOption key={option} value={option}>
                  {option}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </FlexItem>
        <FlexItem>
          <Button
            variant='plain'
            icon={<SyncAltIcon />}
            onClick={refreshImageSources}
            isInline
            aria-label='Refresh image sources'
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default ImageSourceSelect;
