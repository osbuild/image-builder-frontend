import React, { useMemo } from 'react';

import {
  Button,
  Flex,
  FlexItem,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';

import {
  useGetImageExistsQuery,
  useGetRegistryAuthStatusQuery,
  usePullImageMutation,
} from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import {
  IMAGE_REGISTRY_HOST,
  KNOWN_IMAGES,
} from '@/store/api/backend/onprem/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeDistribution,
  changeImageSource,
  changeImageTypes,
  selectArchitecture,
  selectForceShowErrors,
  selectImageSource,
  selectImageSourceType,
  selectIsOfficialImage,
  type SupportedImageTypes,
} from '@/store/slices/wizard';

import ImageSelect from './ImageSelect';
import RegistryAuth from './RegistryAuth';

type PullButtonProps = {
  onPull: () => void;
  isPulling: boolean;
  isAuthenticated: boolean;
  isDisabled?: boolean;
};

const PullButton = ({
  onPull,
  isPulling,
  isAuthenticated,
  isDisabled,
}: PullButtonProps) => {
  const button = (
    <Button
      variant='secondary'
      onClick={onPull}
      isDisabled={isDisabled || isPulling}
      isAriaDisabled={!isAuthenticated}
      icon={isPulling ? <Spinner size='sm' /> : undefined}
    >
      {isPulling ? 'Pulling image...' : 'Pull latest image'}
    </Button>
  );

  if (isAuthenticated) {
    return button;
  }

  return (
    <Tooltip content={`Log in to ${IMAGE_REGISTRY_HOST} to pull images.`}>
      {button}
    </Tooltip>
  );
};

const OfficialImageSource = () => {
  const dispatch = useAppDispatch();
  const arch = useAppSelector(selectArchitecture);
  const selectedRef = useAppSelector(selectImageSource);
  const imageSourceType = useAppSelector(selectImageSourceType);
  const forceShowErrors = useAppSelector(selectForceShowErrors);
  const hasOfficialSelection = useAppSelector(selectIsOfficialImage);

  const { data: authStatus, isLoading: isAuthLoading } =
    useGetRegistryAuthStatusQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });
  const isAuthenticated = authStatus?.status === 'authenticated';

  const images = useMemo(
    () => KNOWN_IMAGES.map((known) => ({ ...known, arch })),
    [arch],
  );

  // Local images can be removed outside the wizard (e.g. podman rmi),
  // so bypass the cache and re-check whenever this section mounts.
  const { data: imageExists } = useGetImageExistsQuery(
    { reference: selectedRef! },
    { skip: !selectedRef, refetchOnMountOrArgChange: true },
  );

  // The mutation state is scoped to the reference it was started with,
  // so switching to another image doesn't show its busy/error state.
  const [pullImage, pullState] = usePullImageMutation();
  const isPulling =
    pullState.isLoading && pullState.originalArgs?.reference === selectedRef;
  const isPullError =
    pullState.isError && pullState.originalArgs?.reference === selectedRef;

  const showSelectionError = forceShowErrors && !hasOfficialSelection;
  const showPullValidation = hasOfficialSelection && imageExists === false;

  const errorId = showSelectionError
    ? 'official-image-selection-error'
    : showPullValidation
      ? 'official-image-pull-error'
      : undefined;

  if (imageSourceType !== 'official') {
    return null;
  }

  return (
    <>
      <RegistryAuth />
      <Flex
        spaceItems={{ default: 'spaceItemsMd' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
      >
        <FlexItem>
          <ImageSelect
            items={images}
            selectedRef={selectedRef}
            ariaDescribedBy={errorId}
            onSelect={(_event, selection) => {
              const selected = images.find(
                (img) => img.reference === selection,
              );
              if (selected) {
                dispatch(changeImageSource(selected.reference));
                dispatch(changeDistribution(selected.distro as Distributions));
                dispatch(
                  changeImageTypes([selected.type as SupportedImageTypes]),
                );
              }
            }}
            getLabel={(item) => item.name}
            placeholder={'Select an official image'}
          />
        </FlexItem>
        {hasOfficialSelection && (
          <FlexItem className='pf-v6-u-mt-md'>
            <PullButton
              onPull={() => pullImage({ reference: selectedRef! })}
              isPulling={isPulling}
              isAuthenticated={isAuthenticated}
              isDisabled={isAuthLoading}
            />
          </FlexItem>
        )}
      </Flex>
      {showSelectionError && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant='error' id='official-image-selection-error'>
              Select an official image to proceed.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      {showPullValidation && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant='error' id='official-image-pull-error'>
              {isPullError
                ? 'Failed to pull image. Please try again.'
                : isAuthenticated
                  ? 'Bootc container must be pulled before proceeding.'
                  : `Bootc container is not in local storage. Log in to ${IMAGE_REGISTRY_HOST} to pull it.`}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </>
  );
};

export default OfficialImageSource;
