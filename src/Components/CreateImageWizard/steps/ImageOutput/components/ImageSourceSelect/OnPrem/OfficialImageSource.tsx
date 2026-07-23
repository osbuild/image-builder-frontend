import React, { useMemo } from 'react';

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
  useGetImageExistsQuery,
  useGetRegistryAuthStatusQuery,
  usePullImageMutation,
} from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import { KNOWN_IMAGES } from '@/store/api/backend/onprem/constants';
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

const OfficialImageSource = () => {
  const dispatch = useAppDispatch();
  const arch = useAppSelector(selectArchitecture);
  const selectedRef = useAppSelector(selectImageSource);
  const imageSourceType = useAppSelector(selectImageSourceType);
  const forceShowErrors = useAppSelector(selectForceShowErrors);
  const hasOfficialSelection = useAppSelector(selectIsOfficialImage);

  const { data: authStatus, isLoading: isAuthLoading } =
    useGetRegistryAuthStatusQuery();
  const isAuthenticated = authStatus?.status === 'authenticated';

  const images = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    return KNOWN_IMAGES.map((known) => ({ ...known, arch }));
  }, [isAuthenticated, arch]);

  const { data: imageExists } = useGetImageExistsQuery(
    { reference: selectedRef! },
    { skip: !selectedRef },
  );

  const [pullImage, { isLoading: isPulling, isError: isPullError }] =
    usePullImageMutation();

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
      {isAuthenticated && (
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
                  dispatch(
                    changeDistribution(selected.distro as Distributions),
                  );
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
              <Button
                variant='secondary'
                onClick={() => pullImage({ reference: selectedRef! })}
                isDisabled={isAuthLoading || isPulling}
                icon={isPulling ? <Spinner size='sm' /> : undefined}
              >
                {isPulling ? 'Pulling image...' : 'Pull latest image'}
              </Button>
            </FlexItem>
          )}
        </Flex>
      )}
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
                : 'Image must be pulled before proceeding.'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </>
  );
};

export default OfficialImageSource;
