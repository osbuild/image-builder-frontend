import React, { MouseEventHandler, useEffect } from 'react';

import {
  Alert,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Content,
  EmptyState,
  Flex,
  FlexItem,
  FormGroup,
  Gallery,
  Popover,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';

import { useGetArchitecturesQuery } from '../../../../../store/backendApi';
import { useCustomizationRestrictions } from '../../../../../store/distributions';
import { selectIsOnPremise } from '../../../../../store/envSlice';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { ImageTypes } from '../../../../../store/imageBuilderApi';
import { provisioningApi } from '../../../../../store/provisioningApi';
import { rhsmApi } from '../../../../../store/rhsmApi';
import {
  addImageType,
  changeRegistrationType,
  reinitializeAws,
  reinitializeAzure,
  reinitializeGcp,
  removeImageType,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from '../../../../../store/wizardSlice';
import { useFlag } from '../../../../../Utilities/useGetEnvironment';

type TargetEnvironmentCardProps = {
  title: string;
  imageSrc: string;
  imageAlt: string;
  isClicked: boolean;
  isDisabled?: boolean;
  handleOnClick: () => void;
  onMouseEnter?: MouseEventHandler<HTMLElement> | undefined;
};

const TargetEnvironmentCard = ({
  title,
  imageSrc,
  imageAlt,
  handleOnClick,
  onMouseEnter,
  isClicked,
  isDisabled = false,
}: TargetEnvironmentCardProps) => {
  return (
    <Card
      style={{ textAlign: 'center' } as React.CSSProperties}
      onMouseUp={onMouseEnter}
      isClicked={isClicked}
      isDisabled={isDisabled}
      isClickable
      isLarge
      onClick={isDisabled ? undefined : handleOnClick}
    >
      <CardHeader
        selectableActions={{
          name: title,
          selectableActionId: title.toLowerCase(),
          selectableActionAriaLabel: title.toLowerCase(),
          ...(!isDisabled && { onClickAction: handleOnClick }),
        }}
      >
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <img className='provider-icon' src={imageSrc} alt={imageAlt} />
          </FlexItem>
          <FlexItem>
            <Title headingLevel='h5' size='md'>
              {title}
            </Title>
          </FlexItem>
        </Flex>
      </CardHeader>
    </Card>
  );
};

type PublicCloudTargetsProps = {
  supportedEnvironments: string[] | undefined;
  environments: ImageTypes[];
  handleToggleEnvironment: (environment: ImageTypes) => void;
  prefetchSources: (arg: { provider: 'aws' | 'azure' | 'gcp' }) => void;
  isDisabled?: boolean;
};

const PublicCloudTargets = ({
  supportedEnvironments,
  environments,
  handleToggleEnvironment,
  prefetchSources,
  isDisabled = false,
}: PublicCloudTargetsProps) => {
  const isOnPremise = useAppSelector(selectIsOnPremise);

  if (isOnPremise) {
    return (
      <>
        {supportedEnvironments?.includes('aws') && (
          <Checkbox
            label='Amazon Web Services'
            isChecked={environments.includes('aws')}
            onChange={() => handleToggleEnvironment('aws')}
            aria-label='Amazon Web Services checkbox'
            id='checkbox-aws'
            name='Amazon Web Services'
            isDisabled={isDisabled}
          />
        )}
        {supportedEnvironments?.includes('gcp') && (
          <Checkbox
            label='Google Cloud'
            isChecked={environments.includes('gcp')}
            onChange={() => handleToggleEnvironment('gcp')}
            aria-label='Google Cloud checkbox'
            id='checkbox-gcp'
            name='Google Cloud'
            isDisabled={isDisabled}
          />
        )}
        {supportedEnvironments?.includes('azure') && (
          <Checkbox
            label='Microsoft Azure'
            isChecked={environments.includes('azure')}
            onChange={() => handleToggleEnvironment('azure')}
            aria-label='Microsoft Azure checkbox'
            id='checkbox-azure'
            name='Microsoft Azure'
            isDisabled={isDisabled}
          />
        )}
        {supportedEnvironments?.includes('oci') && (
          <Checkbox
            label='Oracle Cloud Infrastructure'
            isChecked={environments.includes('oci')}
            onChange={() => handleToggleEnvironment('oci')}
            aria-label='Oracle Cloud Infrastructure checkbox'
            id='checkbox-oci'
            name='Oracle Cloud Infrastructure'
            isDisabled={isDisabled}
          />
        )}
      </>
    );
  }

  return (
    <Gallery hasGutter>
      {supportedEnvironments?.includes('aws') && (
        <TargetEnvironmentCard
          title='Amazon Web Services'
          imageSrc='/apps/frontend-assets/partners-icons/aws-logomark.svg'
          imageAlt='Amazon Web Services logo'
          handleOnClick={() => handleToggleEnvironment('aws')}
          onMouseEnter={() => prefetchSources({ provider: 'aws' })}
          isClicked={environments.includes('aws')}
          isDisabled={isDisabled}
        />
      )}
      {supportedEnvironments?.includes('gcp') && (
        <TargetEnvironmentCard
          title='Google Cloud'
          imageSrc='/apps/frontend-assets/partners-icons/google-cloud-logomark.svg'
          imageAlt='Google Cloud logo'
          handleOnClick={() => handleToggleEnvironment('gcp')}
          onMouseEnter={() => prefetchSources({ provider: 'gcp' })}
          isClicked={environments.includes('gcp')}
          isDisabled={isDisabled}
        />
      )}
      {supportedEnvironments?.includes('azure') && (
        <TargetEnvironmentCard
          title='Microsoft Azure'
          imageSrc='/apps/frontend-assets/partners-icons/microsoft-azure-logomark.svg'
          imageAlt='Microsoft Azure logo'
          handleOnClick={() => handleToggleEnvironment('azure')}
          onMouseEnter={() => prefetchSources({ provider: 'azure' })}
          isClicked={environments.includes('azure')}
          isDisabled={isDisabled}
        />
      )}
      {supportedEnvironments?.includes('oci') && (
        <TargetEnvironmentCard
          title='Oracle Cloud Infrastructure'
          imageSrc='/apps/frontend-assets/partners-icons/oracle-short.svg'
          imageAlt='Oracle Cloud Infrastructure logo'
          handleOnClick={() => handleToggleEnvironment('oci')}
          isClicked={environments.includes('oci')}
          isDisabled={isDisabled}
        />
      )}
    </Gallery>
  );
};

const TargetEnvironment = () => {
  const arch = useAppSelector(selectArchitecture);
  const environments = useAppSelector(selectImageTypes);
  const distribution = useAppSelector(selectDistribution);
  const isNetworkInstallerEnabled = useFlag('image-builder.net-installer');
  const isPXEEnabled = useFlag('image-builder.pxe-tar-xz.enabled');

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  // NOTE: We're using 'image-mode' as a dummy distribution for the
  // on-prem frontend, this is one of the few cases where we
  // can't work around the type error. This is fine because
  // on-prem can handle this, while the hosted service should
  // never receive 'image-mode' as a distribution
  // @ts-expect-error see above note
  const { data, isFetching, isError } = useGetArchitecturesQuery({
    distribution: distribution,
  });

  const dispatch = useAppDispatch();
  const prefetchSources = provisioningApi.usePrefetch('getSourceList');
  const prefetchActivationKeys = rhsmApi.usePrefetch('listActivationKeys');

  useEffect(() => {
    prefetchActivationKeys();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const registrationType = restrictions.registration.shouldHide
      ? 'register-later'
      : 'register-now-rhc';
    dispatch(changeRegistrationType(registrationType));
  }, [restrictions.registration.shouldHide, dispatch]);

  const supportedEnvironments = data?.find(
    (elem) => elem.arch === arch,
  )?.image_types;

  const isOnlyNetworkInstallerSelected =
    environments.length === 1 && environments.includes('network-installer');

  const isOtherEnvironmentSelected =
    environments.length >= 1 && !environments.includes('network-installer');

  const handleToggleEnvironment = (environment: ImageTypes) => {
    if (environments.includes(environment)) {
      switch (environment) {
        case 'aws':
          dispatch(reinitializeAws());
          break;
        case 'azure':
          dispatch(reinitializeAzure());
          break;
        case 'gcp':
          dispatch(reinitializeGcp());
      }
      dispatch(removeImageType(environment));
    } else {
      dispatch(addImageType(environment));
    }
  };

  const publicCloudsSupported = () => {
    return (
      supportedEnvironments?.includes('aws') ||
      supportedEnvironments?.includes('gcp') ||
      supportedEnvironments?.includes('azure') ||
      supportedEnvironments?.includes('oci')
    );
  };

  if (isFetching) {
    return (
      <EmptyState
        titleText='Loading target environments'
        headingLevel='h6'
        icon={Spinner}
      />
    );
  }

  if (isError) {
    return (
      <Alert
        title="Couldn't fetch target environments"
        variant='danger'
        isInline
      >
        Target environments couldn&apos;t be loaded, please refresh the page or
        try again later.
      </Alert>
    );
  }

  return (
    <FormGroup
      isRequired={true}
      label='Select target environments'
      data-testid='target-select'
    >
      {publicCloudsSupported() && (
        <FormGroup label={<small>Public cloud</small>}>
          <PublicCloudTargets
            supportedEnvironments={supportedEnvironments}
            environments={environments}
            handleToggleEnvironment={handleToggleEnvironment}
            prefetchSources={prefetchSources}
            isDisabled={isOnlyNetworkInstallerSelected}
          />
        </FormGroup>
      )}
      {(supportedEnvironments?.includes('vsphere') ||
        supportedEnvironments?.includes('vsphere-ova')) && (
        <FormGroup
          label={<small>Private cloud</small>}
          className='pf-v6-u-mt-sm'
        >
          {supportedEnvironments.includes('vsphere-ova') && (
            <Checkbox
              name='vsphere-checkbox-ova'
              aria-label='VMware vSphere checkbox OVA'
              id='vsphere-checkbox-ova'
              isDisabled={isOnlyNetworkInstallerSelected}
              label={
                <>
                  VMware vSphere - Open virtualization format (.ova){' '}
                  <Popover
                    maxWidth='30rem'
                    position='right'
                    bodyContent={
                      <Content>
                        <Content>
                          An OVA file is a virtual appliance used by
                          virtualization platforms such as VMware vSphere. It is
                          a package that contains files used to describe a
                          virtual machine, which includes a VMDK image, OVF
                          descriptor file and a manifest file.
                        </Content>
                      </Content>
                    }
                  >
                    <Button
                      icon={<HelpIcon />}
                      variant='plain'
                      aria-label='About OVA file'
                      isInline
                      hasNoPadding
                    />
                  </Popover>
                </>
              }
              onChange={() => {
                handleToggleEnvironment('vsphere-ova');
              }}
              isChecked={environments.includes('vsphere-ova')}
            />
          )}
          {supportedEnvironments.includes('vsphere') && (
            <Checkbox
              className='pf-v6-u-mt-sm'
              name='vsphere-checkbox-vmdk'
              aria-label='VMware vSphere checkbox VMDK'
              id='vsphere-checkbox-vmdk'
              isDisabled={isOnlyNetworkInstallerSelected}
              label={
                <>
                  VMware vSphere - Virtual disk (.vmdk){' '}
                  <Popover
                    maxWidth='30rem'
                    position='right'
                    bodyContent={
                      <Content>
                        <Content>
                          A VMDK file is a virtual disk that stores the contents
                          of a virtual machine. This disk has to be imported
                          into vSphere using govc import.vmdk, use the OVA
                          version when using the vSphere UI.
                        </Content>
                      </Content>
                    }
                  >
                    <Button
                      icon={<HelpIcon />}
                      variant='plain'
                      aria-label='About VMDK file'
                      isInline
                      hasNoPadding
                    />
                  </Popover>
                </>
              }
              onChange={() => {
                handleToggleEnvironment('vsphere');
              }}
              isChecked={environments.includes('vsphere')}
            />
          )}
        </FormGroup>
      )}
      <FormGroup label={<small>Other</small>} className='pf-v6-u-mt-sm'>
        {supportedEnvironments?.includes('guest-image') && (
          <Checkbox
            label='Virtualization - Guest image (.qcow2)'
            isChecked={environments.includes('guest-image')}
            onChange={() => {
              handleToggleEnvironment('guest-image');
            }}
            aria-label='Virtualization guest image checkbox'
            id='checkbox-guest-image'
            name='Virtualization guest image'
            isDisabled={isOnlyNetworkInstallerSelected}
          />
        )}
        {supportedEnvironments?.includes('image-installer') && (
          <Checkbox
            label='Bare metal - Installer (.iso)'
            isChecked={environments.includes('image-installer')}
            onChange={() => {
              handleToggleEnvironment('image-installer');
            }}
            aria-label='Bare metal installer checkbox'
            id='checkbox-image-installer'
            name='Bare metal installer'
            isDisabled={isOnlyNetworkInstallerSelected}
          />
        )}
        {supportedEnvironments?.includes('network-installer') &&
          isNetworkInstallerEnabled && (
            <Checkbox
              label={
                <>
                  Network - Installer (.iso){' '}
                  <Popover
                    maxWidth='30rem'
                    position='right'
                    bodyContent={
                      <Content>
                        <Content>
                          This is a lightweight image that differs from a
                          standard &quot;full&quot; ISO by requiring an active
                          network connection to pull the latest software
                          directly from package repositories, as no OS packages
                          are stored locally on the image.
                        </Content>
                      </Content>
                    }
                  >
                    <Button
                      icon={<HelpIcon />}
                      variant='plain'
                      aria-label='About Network installer'
                      isInline
                      hasNoPadding
                    />
                  </Popover>
                </>
              }
              isChecked={environments.includes('network-installer')}
              onChange={() => {
                handleToggleEnvironment('network-installer');
              }}
              id='checkbox-network-installer'
              name='Network - Installer'
              isDisabled={isOtherEnvironmentSelected}
            />
          )}
        {isPXEEnabled && supportedEnvironments?.includes('pxe-tar-xz') && (
          <Checkbox
            label={
              <>
                Network - PXE boot (.tar.xz){' '}
                <Popover
                  maxWidth='30rem'
                  position='right'
                  bodyContent={
                    <Content>
                      <Content>
                        A PXE boot image is a compressed archive containing the
                        kernel, initramfs, and root filesystem needed to boot a
                        system over the network using the Preboot Execution
                        Environment (PXE) protocol.
                      </Content>
                    </Content>
                  }
                >
                  <Button
                    icon={<HelpIcon />}
                    variant='plain'
                    aria-label='About PXE boot'
                    isInline
                    hasNoPadding
                  />
                </Popover>
              </>
            }
            isChecked={environments.includes('pxe-tar-xz')}
            onChange={() => {
              handleToggleEnvironment('pxe-tar-xz');
            }}
            aria-label='PXE boot image checkbox'
            id='checkbox-pxe-boot'
            name='PXE boot image'
            isDisabled={isOnlyNetworkInstallerSelected}
          />
        )}
        {supportedEnvironments?.includes('wsl') && (
          <Checkbox
            label={
              <>
                WSL - Windows Subsystem for Linux (.wsl){' '}
                <Popover
                  maxWidth='30rem'
                  position='right'
                  headerContent={
                    <Content>
                      <Content>
                        WSL is not officially supported by Red Hat
                      </Content>
                    </Content>
                  }
                  bodyContent={
                    <Content>
                      <Content>
                        You can use RHEL on Microsoft&apos;s Windows Subsystem
                        for Linux (WSL) for development and learning use cases.
                        Red Hat supports WSL under the Validated Software
                        Pattern and Third Party Component Support Policy, which
                        does not include production use cases.
                      </Content>
                    </Content>
                  }
                  footerContent={
                    <Button
                      component='a'
                      target='_blank'
                      variant='link'
                      icon={<ExternalLinkAltIcon />}
                      iconPosition='right'
                      isInline
                      href='https://access.redhat.com/articles/7115538'
                    >
                      Learn more about Red Hat&apos;s WSL support
                    </Button>
                  }
                >
                  <Button
                    icon={<HelpIcon />}
                    variant='plain'
                    aria-label='About WSL file'
                    isInline
                    hasNoPadding
                  />
                </Popover>
              </>
            }
            isChecked={environments.includes('wsl')}
            onChange={() => {
              handleToggleEnvironment('wsl');
            }}
            aria-label='windows subsystem for linux checkbox'
            id='checkbox-wsl'
            name='WSL'
            isDisabled={isOnlyNetworkInstallerSelected}
          />
        )}
      </FormGroup>
      {isOnlyNetworkInstallerSelected && (
        <Alert
          variant='info'
          className='pf-v6-u-mt-lg'
          style={{ maxWidth: '54rem' }}
          isInline
          title='Network installer image selection'
        >
          <Content>
            This image type requires specific, minimal configuration for remote
            installation, so most customization options are restricted.
          </Content>
          <Content>
            To select a different target, first deselect network installer.
          </Content>
        </Alert>
      )}
    </FormGroup>
  );
};

export default TargetEnvironment;
