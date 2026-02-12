import React, { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  ClipboardCopy,
  Content,
  ExpandableSection,
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
  Spinner,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';

import {
  IMAGE_MODE_RELEASE_LOOKUP,
  IMAGE_MODE_RELEASES,
} from '../../../../../constants';
import { useLazyPodmanImageExistsQuery } from '../../../../../store/cockpit/cockpitApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeImageSource,
  ImageSource,
  selectImageSource,
} from '../../../../../store/wizardSlice';

const CopyInlineCompact = ({ text }: { text: string }) => (
  <ClipboardCopy
    copyAriaLabel='Copy podman pull command'
    hoverTip='Copy'
    clickTip='Copied'
    variant='inline-compact'
    isCode
  >
    {text}
  </ClipboardCopy>
);

const InfoMessageContent = ({ source }: { source: string }) => {
  return (
    <>
      <Content component='p'>
        Container images must be pulled using Podman with root privileges, as
        rootless images are not accessible to image builder at build time.
      </Content>
      <Content component='p'>
        To pull the image, ensure you are logged in to the registry and use the
        following command:
      </Content>
      <CopyInlineCompact text={`sudo podman pull ${source}`} />
    </>
  );
};

const ImageSourceSelect = () => {
  const dispatch = useAppDispatch();
  const imageSource = useAppSelector(selectImageSource);
  const [isOpen, setIsOpen] = useState(false);
  const [isPullInfoExpanded, setIsPullInfoExpanded] = useState(false);

  const [
    trigger,
    { data: imageExists, error: queryError, isError, isLoading },
  ] = useLazyPodmanImageExistsQuery();

  useEffect(() => {
    if (imageSource) {
      trigger({ image: imageSource });
    }
  }, [trigger, imageSource]);

  const refreshImageSources = () => {
    if (imageSource) {
      trigger({ image: imageSource });
    }
  };

  const setImageSource = (
    _event?: React.MouseEvent,
    selection?: ImageSource,
  ) => {
    if (selection === undefined) return;
    dispatch(changeImageSource(selection));
    setIsOpen(false);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => {
    // NOTE: Although this shouldn't be undefined and the default should be RHEL-10,
    // let's set the name to 'Unknown' if it is actually defined. If the lookup
    // fails, let's just fallback to the full image reference
    const name = !imageSource
      ? 'Unknown Image'
      : IMAGE_MODE_RELEASE_LOOKUP[imageSource] || imageSource;
    return (
      <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
        {name}
      </MenuToggle>
    );
  };

  return (
    <FormGroup label='Image source' isRequired>
      {isError && (
        <Alert
          title='Error checking image availability'
          variant='danger'
          className='pf-v6-u-mb-md'
        >
          Unable to verify if the image exists: {String(queryError)}
        </Alert>
      )}

      {!isLoading && !isError && imageExists === false ? (
        <Alert
          title='Image not found'
          className='pf-v6-u-mb-md'
          variant='warning'
        >
          <InfoMessageContent source={imageSource || ''} />
        </Alert>
      ) : (
        <ExpandableSection
          toggleText={
            isPullInfoExpanded
              ? 'Hide information about pulling images'
              : 'Show information about pulling images'
          }
          onToggle={(_event, isPullInfoExpanded) =>
            setIsPullInfoExpanded(isPullInfoExpanded)
          }
          isExpanded={isPullInfoExpanded}
          className='pf-v6-u-pb-sm'
        >
          <InfoMessageContent source={imageSource || ''} />
        </ExpandableSection>
      )}
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
              {[...IMAGE_MODE_RELEASES].map(([_, options]) => (
                <SelectOption key={options.reference} value={options.reference}>
                  {options.name}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
          {isLoading && (
            <Spinner
              size='md'
              className='pf-v6-u-ml-sm'
              aria-label='Checking image availability'
            />
          )}
          <HelperText className='pf-v6-u-mt-sm'>
            <HelperTextItem>
              <span className='pf-v6-u-text-color-subtle'>
                FROM: {imageSource}
              </span>
            </HelperTextItem>
          </HelperText>
        </FlexItem>
        <FlexItem>
          <Button
            variant='plain'
            icon={<SyncAltIcon />}
            onClick={refreshImageSources}
            isDisabled={isLoading}
            isInline
            aria-label='Refresh image sources'
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default ImageSourceSelect;
