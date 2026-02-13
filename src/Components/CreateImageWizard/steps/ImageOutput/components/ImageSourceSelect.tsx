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

import { RHEL_10_IMAGE_MODE_IMAGE } from '../../../../../constants';
import { usePodmanImagesQuery } from '../../../../../store/cockpit/cockpitApi';
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
        To pull an image locally, ensure you are logged in to the registry and
        use the following command to use the recommended image mode image:
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
  const [isImagesAvailable, setImagesAvailable] = useState(false);

  const { data: images, isError, isLoading, refetch } = usePodmanImagesQuery();

  useEffect(() => {
    if (!isLoading && !isError) {
      const count = images ? images.length : 0;
      setImagesAvailable(count > 0);
      setIsPullInfoExpanded(count === 0);
    }
  }, [isLoading, isError, images]);

  const refreshImageSources = () => {
    refetch();
  };

  const setImageSource = (
    _event?: React.MouseEvent,
    selection?: ImageSource,
  ) => {
    dispatch(changeImageSource(selection));
    setIsOpen(false);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => {
    if (isLoading) {
      return (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          isDisabled
          style={
            {
              minWidth: '50%',
              maxWidth: '100%',
            } as React.CSSProperties
          }
        >
          <Spinner size='sm' /> Loading images...
        </MenuToggle>
      );
    }

    const optionText = imageSource
      ? `Red Hat Enterprise Linux (RHEL - bootc) ${imageSource.split(':')[1]}`
      : 'Select an image';

    return (
      <MenuToggle
        ref={toggleRef}
        onClick={onToggleClick}
        isExpanded={isOpen}
        style={
          {
            width: '100%',
          } as React.CSSProperties
        }
      >
        {optionText}
      </MenuToggle>
    );
  };

  return (
    <FormGroup label='Image source' isRequired>
      {isError && (
        <Alert
          title='Error listing images'
          variant='danger'
          className='pf-v6-u-mb-md'
        >
          Unable to list podman images. Ensure podman is installed and
          accessible.
        </Alert>
      )}

      {!isLoading && !isError && (
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
          <Alert
            title={
              isImagesAvailable ? 'Note on pulling images' : 'No images found'
            }
            variant={isImagesAvailable ? 'info' : 'warning'}
            className='pf-v6-u-mb-md'
          >
            <InfoMessageContent source={RHEL_10_IMAGE_MODE_IMAGE} />
          </Alert>
        </ExpandableSection>
      )}

      <Flex>
        <FlexItem
          style={
            {
              minWidth: '50%',
              maxWidth: '100%',
            } as React.CSSProperties
          }
        >
          <Select
            isOpen={isOpen}
            selected={imageSource}
            onSelect={setImageSource}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            toggle={toggle}
            shouldFocusToggleOnSelect
          >
            <SelectList>
              {images && images.length > 0 ? (
                images.map((option) => (
                  <SelectOption key={option.image} value={option.image}>
                    Red Hat Enterprise Linux (RHEL - bootc) {option.tag}
                  </SelectOption>
                ))
              ) : (
                <SelectOption isDisabled>{'No images found'}</SelectOption>
              )}
            </SelectList>
          </Select>
          {isLoading && (
            <Spinner
              size='md'
              className='pf-v6-u-ml-sm'
              aria-label='Reload local images'
            />
          )}
          <HelperText className='pf-v6-u-mt-sm'>
            <HelperTextItem>
              <span className='pf-v6-u-text-color-subtle'>
                {imageSource && `FROM: ${imageSource}`}
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
