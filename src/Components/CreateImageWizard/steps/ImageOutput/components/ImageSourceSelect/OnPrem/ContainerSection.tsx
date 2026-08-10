import React from 'react';

import {
  Button,
  ClipboardCopy,
  Content,
  Flex,
  FlexItem,
  FormGroup,
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
import { IMAGE_REGISTRY_HOST } from '@/store/api/backend/onprem/constants';

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

type ContainerSectionProps = {
  label: string;
  // Unset until a target environment implies a container
  reference?: string | undefined;
  // Human-readable image name, shown as a subtitle under the reference
  name?: string | undefined;
  helperText?: string;
};

// A container determined by the selected target environment. The
// reference is shown in a read-only, copyable field - PatternFly's
// "boxed" read-only form control - because the containers behind the
// official images are never chosen directly. When local images become
// selectable this slot swaps to a real select, so the layout
// deliberately reads as a form field.
const ContainerSection = ({
  label,
  reference,
  name,
  helperText,
}: ContainerSectionProps) => {
  const { data: authStatus, isLoading: isAuthLoading } =
    useGetRegistryAuthStatusQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });
  const isAuthenticated = authStatus?.status === 'authenticated';

  // Local images can be removed outside the wizard (e.g. podman rmi),
  // so bypass the cache and re-check whenever this section mounts.
  const { data: imageExists } = useGetImageExistsQuery(
    { reference: reference! },
    { skip: !reference, refetchOnMountOrArgChange: true },
  );

  // The mutation state is scoped to the reference it was started with,
  // so switching to another image doesn't show its busy/error state.
  const [pullImage, pullState] = usePullImageMutation();
  const isPulling =
    pullState.isLoading && pullState.originalArgs?.reference === reference;
  const isPullError =
    pullState.isError && pullState.originalArgs?.reference === reference;

  const showPullValidation = !!reference && imageExists === false;

  if (!reference) {
    return (
      <FormGroup label={label} className='pf-v6-u-mt-md'>
        <Content component='p' className='pf-v6-u-text-color-subtle'>
          Select a target environment to see the container image it uses.
        </Content>
      </FormGroup>
    );
  }

  return (
    <FormGroup label={label} className='pf-v6-u-mt-md'>
      <Flex
        spaceItems={{ default: 'spaceItemsMd' }}
        alignItems={{ default: 'alignItemsCenter' }}
      >
        <FlexItem style={{ minWidth: '24rem', maxWidth: '100%' }}>
          <ClipboardCopy isReadOnly hoverTip='Copy' clickTip='Copied'>
            {reference}
          </ClipboardCopy>
        </FlexItem>
        <FlexItem>
          <PullButton
            onPull={() => pullImage({ reference })}
            isPulling={isPulling}
            isAuthenticated={isAuthenticated}
            isDisabled={isAuthLoading}
          />
        </FlexItem>
      </Flex>
      {(name || helperText) && (
        <FormHelperText>
          <HelperText>
            {name && <HelperTextItem>{name}</HelperTextItem>}
            {helperText && <HelperTextItem>{helperText}</HelperTextItem>}
          </HelperText>
        </FormHelperText>
      )}
      {showPullValidation && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant='error'>
              {isPullError
                ? 'Failed to pull image. Please try again.'
                : isAuthenticated
                  ? `${label} must be pulled before proceeding.`
                  : `${label} is not in local storage. Log in to ${IMAGE_REGISTRY_HOST} to pull it.`}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default ContainerSection;
