import React from 'react';

import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';

import type { BootcDistributionItem } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectImageSourceType } from '@/store/slices';

import ImageSelect from './ImageSelect';

type CustomBodyProps = {
  images: BootcDistributionItem[];
  selectedRef: string | undefined;
  isLoading: boolean;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
  onRefresh: () => void;
};

const CustomImageSource = ({
  images,
  selectedRef,
  isLoading,
  onSelect,
  onRefresh,
}: CustomBodyProps) => {
  const imageSourceType = useAppSelector(selectImageSourceType);

  if (imageSourceType !== 'custom') {
    return null;
  }

  return (
    <Flex>
      <FlexItem>
        <ImageSelect
          items={images}
          selectedRef={selectedRef}
          onSelect={onSelect}
          getLabel={(item) => item.reference}
          placeholder='Select a custom image'
          isLoading={isLoading}
          isSearchable
        />
      </FlexItem>
      <FlexItem>
        <Button
          variant='plain'
          icon={<SyncAltIcon />}
          onClick={onRefresh}
          isDisabled={isLoading}
          isInline
          aria-label='Refresh image sources'
        />
      </FlexItem>
    </Flex>
  );
};

export default CustomImageSource;
