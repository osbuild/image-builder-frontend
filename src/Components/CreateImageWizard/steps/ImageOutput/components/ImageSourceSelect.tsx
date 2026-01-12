import React, { useState } from 'react';

import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';

import { IMAGE_MODE_RELEASES } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeImageSource,
  ImageSource,
  selectImageSource,
} from '../../../../../store/wizardSlice';

const ImageSourceSelect = () => {
  const dispatch = useAppDispatch();
  const imageSource = useAppSelector(selectImageSource);
  const [isOpen, setIsOpen] = useState(false);

  const setImageSource = (
    _event?: React.MouseEvent,
    selection?: ImageSource,
  ) => {
    if (selection === undefined) return;
    dispatch(changeImageSource(selection));
    setIsOpen(false);
  };

  const refreshImageSources = () => {
    // TODO
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
      {imageSource.name}
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
              {[...IMAGE_MODE_RELEASES].map(([_, option]) => (
                <SelectOption key={option.image} value={option}>
                  {option.name}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
          <HelperText className='pf-v6-u-mt-sm'>
            <HelperTextItem>
              <span className='pf-v6-u-text-color-subtle'>
                FROM: {imageSource.image}
              </span>
            </HelperTextItem>
          </HelperText>
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
