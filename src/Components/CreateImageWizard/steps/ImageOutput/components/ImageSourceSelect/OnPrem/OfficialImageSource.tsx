import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectImageSourceType } from '@/store/slices';
import {
  Button,
  Flex,
  FlexItem,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Spinner,
} from '@patternfly/react-core';

import {
  type BootcDistributionItem,
  useGetImageExistsQuery,
  useGetRegistryAuthStatusQuery,
  usePullImageMutation,
} from '@/store/api/backend';

import ImageSelect from './ImageSelect';
import RegistryAuth from './RegistryAuth';

type OfficialImageSourceProps = {
  images: BootcDistributionItem[];
  selectedRef: string | undefined;
  isLoading: boolean;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
  onRefresh: () => void;
};

const OfficialImageSource = ({
  images,
  selectedRef,
  isLoading,
  onSelect,
  onRefresh,
}: OfficialImageSourceProps) => {
  const imageSourceType = useAppSelector(selectImageSourceType);

  const { data: imageExists, refetch: recheckImage } = useGetImageExistsQuery(
    { reference: selectedRef! },
    { skip: !selectedRef },
  );

  const { data: authStatus, isLoading: isAuthLoading } =
    useGetRegistryAuthStatusQuery();
  const isAuthenticated = authStatus?.status === 'authenticated';

  const [pullImage, { isLoading: isPulling, isError: isPullError }] =
    usePullImageMutation();

  const handlePull = async () => {
    if (!selectedRef) return;
    try {
      await pullImage({ reference: selectedRef }).unwrap();
      recheckImage();
    } catch {
      // Error state is handled by isPullError
    }
  };

  const showPullValidation = selectedRef && imageExists === false;

  if (imageSourceType !== 'official') {
    return null;
  }

  return (
    <>
      <Flex
        spaceItems={{ default: 'spaceItemsMd' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
      >
        <FlexItem>
          <ImageSelect
            items={images}
            selectedRef={selectedRef}
            onSelect={onSelect}
            getLabel={(item) => item.name}
            placeholder={
              images.length === 0
                ? 'Log in to view official images'
                : 'Select an official image'
            }
            isLoading={isLoading}
            isDisabled={images.length === 0}
          />
        </FlexItem>
        {selectedRef && (
          <FlexItem>
            <Button
              variant='secondary'
              onClick={handlePull}
              isDisabled={
                !selectedRef ||
                !isAuthenticated ||
                isAuthLoading ||
                isLoading ||
                isPulling
              }
              icon={isPulling ? <Spinner size='sm' /> : undefined}
            >
              {isPulling ? 'Pulling image...' : 'Pull latest image'}
            </Button>
          </FlexItem>
        )}
      </Flex>
      {showPullValidation && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant='error'>
              {isPullError
                ? 'Failed to pull image. Please try again.'
                : 'Image must be pulled before proceeding.'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      <RegistryAuth onLoginSuccess={onRefresh} />
    </>
  );
};

export default OfficialImageSource;
