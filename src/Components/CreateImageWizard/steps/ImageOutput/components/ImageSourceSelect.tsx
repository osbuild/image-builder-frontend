import React, { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Button,
  ClipboardCopy,
  Content,
  ExpandableSection,
  Flex,
  FlexItem,
  FormGroup,
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
} from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeBootcDistributions,
  changeDistribution,
  changeImageSource,
  selectArchitecture,
  selectImageSource,
} from '@/store/slices/wizard';

import RegistryAuthSection from './RegistryAuthSection';

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
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const arch = useAppSelector(selectArchitecture);
  const imageSource = useAppSelector(selectImageSource);
  const [isOpen, setIsOpen] = useState(false);

  const [isPullInfoExpanded, setIsPullInfoExpanded] = useState(false);
  const hasAutoExpanded = useRef(false);

  const {
    data: distributions,
    isLoading,
    isError,
    refetch,
  } = useGetDistributionsQuery({ kind: 'bootc', arch });

  const bootcDistributions = distributions as
    | BootcDistributionItem[]
    | undefined;

  const hasDistributions = (bootcDistributions?.length ?? 0) > 0;

  useEffect(() => {
    if (hasAutoExpanded.current) return;
    if (isOnPremise && !isLoading && !isError) {
      hasAutoExpanded.current = true;
      setIsPullInfoExpanded(!hasDistributions);
    }
  }, [isOnPremise, isLoading, isError, hasDistributions]);

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

  // On-prem: show all distributions as-is (including minor versions).
  // Hosted: filter out minor versions (e.g. rhel-10.1) and deduplicate
  // by name since the API returns one entry per target type but the
  // dropdown should show one entry per base image.
  const uniqueDistributions = isOnPremise
    ? bootcDistributions
    : bootcDistributions
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
          <Spinner size='sm' aria-hidden='true' /> Loading bootc images...
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
      {isOnPremise && <RegistryAuthSection />}
      {isError && (
        <Alert
          title='Error loading bootc images'
          variant='danger'
          className='pf-v6-u-mb-md'
        >
          {isOnPremise
            ? 'Unable to load available bootc images. Ensure podman is installed and accessible.'
            : 'Unable to load available bootc images. Please try again later.'}
        </Alert>
      )}
      {isOnPremise && !isLoading && !isError && (
        <ExpandableSection
          toggleText={
            isPullInfoExpanded
              ? 'Hide information about pulling images'
              : 'Show information about pulling images'
          }
          onToggle={(_event, expanded) => setIsPullInfoExpanded(expanded)}
          isExpanded={isPullInfoExpanded}
          className='pf-v6-u-pb-sm'
        >
          <Alert
            title={
              hasDistributions ? 'Note on pulling images' : 'No images found'
            }
            variant={hasDistributions ? 'info' : 'warning'}
            className='pf-v6-u-mb-md'
          >
            <InfoMessageContent source={RHEL_10_IMAGE_MODE_IMAGE} />
          </Alert>
        </ExpandableSection>
      )}
      <Flex>
        <FlexItem>
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
        </FlexItem>
        {isOnPremise && (
          <FlexItem>
            <Button
              variant='plain'
              icon={<SyncAltIcon />}
              onClick={() => refetch()}
              isDisabled={isLoading}
              isInline
              aria-label='Refresh image sources'
            />
          </FlexItem>
        )}
      </Flex>
    </FormGroup>
  );
};

export default ImageSourceSelect;
