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

import { RHEL_10_IMAGE_MODE_IMAGE } from '@/constants';
import {
  BootcDistributionItem,
  useGetDistributionsQuery,
  usePodmanImagesQuery,
} from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeBootcDistributions,
  changeDistribution,
  changeImageSource,
  ImageSource,
  selectArchitecture,
  selectImageSource,
} from '@/store/slices/wizard';

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

const PodmanImageSourceSelect = () => {
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

const BootcImageSourceSelect = () => {
  const dispatch = useAppDispatch();
  const arch = useAppSelector(selectArchitecture);
  const imageSource = useAppSelector(selectImageSource);
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: distributions,
    isLoading,
    isError,
  } = useGetDistributionsQuery({ kind: 'bootc', arch });

  const bootcDistributions = distributions as
    | BootcDistributionItem[]
    | undefined;

  useEffect(() => {
    if (bootcDistributions) {
      dispatch(changeBootcDistributions(bootcDistributions));
    }
  }, [bootcDistributions, dispatch]);

  useEffect(() => {
    if (!bootcDistributions || bootcDistributions.length === 0) return;

    const hasSelected = imageSource
      ? bootcDistributions.some((d) => d.reference === imageSource)
      : false;
    if (hasSelected) return;

    const defaultItem =
      bootcDistributions.find((d) => d.distro.startsWith('rhel-10')) ??
      bootcDistributions[0];

    dispatch(changeImageSource(defaultItem.reference));
    dispatch(changeDistribution(defaultItem.distro as Distributions));
  }, [bootcDistributions, dispatch, imageSource]);

  // Filter out minor versions (e.g. rhel-10.1, etc.), the backend returns
  // both major and minor versions, we want to show only major versions
  // for now.
  // Then, deduplicate by name — the API returns one entry per target type,
  // but the dropdown should show one entry per base image.
  const uniqueDistributions = bootcDistributions
    ?.filter((d) => !d.name.includes('.'))
    .reduce<BootcDistributionItem[]>((acc, item) => {
      if (!acc.some((d) => d.name === item.name)) {
        acc.push(item);
      }
      return acc;
    }, []);

  const selectedItem = bootcDistributions?.find(
    (d) => d.reference === imageSource,
  );

  const onSelect = (_event?: React.MouseEvent, selection?: string | number) => {
    dispatch(changeImageSource(selection as string));
    const selected = bootcDistributions?.find((d) => d.reference === selection);
    if (selected) {
      dispatch(changeDistribution(selected.distro as Distributions));
    }
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => {
    if (isLoading) {
      return (
        <MenuToggle
          ref={toggleRef}
          isDisabled
          style={
            {
              maxWidth: '100%',
            } as React.CSSProperties
          }
        >
          <Spinner size='sm' /> Loading bootc images...
        </MenuToggle>
      );
    }

    return (
      <MenuToggle
        ref={toggleRef}
        onClick={() => setIsOpen(!isOpen)}
        isExpanded={isOpen}
        style={
          {
            maxWidth: '100%',
          } as React.CSSProperties
        }
      >
        {selectedItem ? selectedItem.name : 'Select a bootc image'}
      </MenuToggle>
    );
  };

  return (
    <FormGroup label='Image source' isRequired>
      {isError && (
        <Alert
          title='Error loading bootc images'
          variant='danger'
          className='pf-v6-u-mb-md'
        >
          Unable to load available bootc images. Please try again later.
        </Alert>
      )}
      <Select
        isOpen={isOpen}
        selected={imageSource}
        onSelect={onSelect}
        onOpenChange={(open) => setIsOpen(open)}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {uniqueDistributions && uniqueDistributions.length > 0 ? (
            uniqueDistributions.map((item) => (
              <SelectOption key={item.reference} value={item.reference}>
                {item.name}
              </SelectOption>
            ))
          ) : (
            <SelectOption isDisabled>
              No bootc images available for {arch}
            </SelectOption>
          )}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

const ImageSourceSelect = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);

  if (isOnPremise) {
    return <PodmanImageSourceSelect />;
  }

  return <BootcImageSourceSelect />;
};

export default ImageSourceSelect;
