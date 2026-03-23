import React, { useEffect } from 'react';

import {
  Alert,
  Checkbox,
  Content,
  EmptyState,
  FormGroup,
  Spinner,
} from '@patternfly/react-core';

import { provisioningApi, rhsmApi } from '@/store/api';
import { ImageTypes, useGetArchitecturesQuery } from '@/store/api/backend';
import { useCustomizationRestrictions } from '@/store/api/distributions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
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
} from '@/store/slices/wizard';

const TargetEnvironment = () => {
  const arch = useAppSelector(selectArchitecture);
  const environments = useAppSelector(selectImageTypes);
  const distribution = useAppSelector(selectDistribution);

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
  const isOnPremise = useAppSelector(selectIsOnPremise);
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

  useEffect(() => {
    if (isOnPremise) return;
    supportedEnvironments
      ?.filter((env): env is 'aws' | 'gcp' | 'azure' =>
        ['aws', 'gcp', 'azure'].includes(env),
      )
      .forEach((provider) => {
        prefetchSources({ provider });
      });
  }, [isOnPremise, prefetchSources, supportedEnvironments]);

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

  const privateCloudsSupported = () => {
    return (
      supportedEnvironments?.includes('vsphere') ||
      supportedEnvironments?.includes('vsphere-ova')
    );
  };

  const showMiscLabel = publicCloudsSupported() || privateCloudsSupported();

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
      {(supportedEnvironments?.includes('vsphere') ||
        supportedEnvironments?.includes('vsphere-ova')) && (
        <FormGroup
          label={<small>Private cloud</small>}
          className='pf-v6-u-mt-sm'
          role='group'
          aria-label='Private cloud'
          fieldId='private-cloud-group'
        >
          {supportedEnvironments.includes('vsphere-ova') && (
            <Checkbox
              className='pf-v6-u-mb-sm'
              name='vsphere-checkbox-ova'
              aria-label='VMware vSphere checkbox OVA'
              id='vsphere-checkbox-ova'
              isDisabled={isOnlyNetworkInstallerSelected}
              description={
                <Content component='small' style={{ maxWidth: '54rem' }}>
                  An OVA file is a virtual appliance used by virtualization
                  platforms such as VMware vSphere. It is a package that
                  contains files used to describe a virtual machine, which
                  includes a VMDK image, OVF descriptor file and a manifest
                  file.
                </Content>
              }
              label='VMware vSphere - Open virtualization format (.ova)'
              onChange={() => {
                handleToggleEnvironment('vsphere-ova');
              }}
              isChecked={environments.includes('vsphere-ova')}
            />
          )}
          {supportedEnvironments.includes('vsphere') && (
            <Checkbox
              className='pf-v6-u-mb-sm'
              name='vsphere-checkbox-vmdk'
              aria-label='VMware vSphere checkbox VMDK'
              id='vsphere-checkbox-vmdk'
              isDisabled={isOnlyNetworkInstallerSelected}
              description={
                <Content component='small' style={{ maxWidth: '54rem' }}>
                  A VMDK file is a virtual disk that stores the contents of a
                  virtual machine. This disk has to be imported into vSphere
                  using govc import.vmdk, use the OVA version when using the
                  vSphere UI.
                </Content>
              }
              label={'VMware vSphere - Virtual disk (.vmdk)'}
              onChange={() => {
                handleToggleEnvironment('vsphere');
              }}
              isChecked={environments.includes('vsphere')}
            />
          )}
        </FormGroup>
      )}

      {publicCloudsSupported() && (
        <FormGroup
          label={<small>Public cloud</small>}
          role='group'
          aria-label='Public cloud'
          fieldId='public-cloud-group'
        >
          {supportedEnvironments?.includes('aws') && (
            <Checkbox
              label='Amazon Web Services'
              isChecked={environments.includes('aws')}
              onChange={() => handleToggleEnvironment('aws')}
              aria-label='Amazon Web Services checkbox'
              id='checkbox-aws'
              name='Amazon Web Services'
              isDisabled={isOnlyNetworkInstallerSelected}
              // NOTE: we can add the aws cloud config options
              // in the Checkbox `body` prop
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
              isDisabled={isOnlyNetworkInstallerSelected}
              // NOTE: we can add the gcp cloud config options
              // in the Checkbox `body` prop
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
              isDisabled={isOnlyNetworkInstallerSelected}
              // NOTE: we can add the azure cloud config options
              // in the Checkbox `body` prop
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
              isDisabled={isOnlyNetworkInstallerSelected}
            />
          )}
        </FormGroup>
      )}

      <FormGroup
        label={showMiscLabel ? <small>Miscellaneous formats</small> : undefined}
        className='pf-v6-u-mt-sm'
        role='group'
        aria-label='Miscellaneous formats'
        fieldId='misc-formats-group'
      >
        {supportedEnvironments?.includes('guest-image') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            label='Virtualization - Guest image (.qcow2)'
            isChecked={environments.includes('guest-image')}
            onChange={() => {
              handleToggleEnvironment('guest-image');
            }}
            aria-label='Virtualization guest image checkbox'
            id='checkbox-guest-image'
            name='Virtualization guest image'
            isDisabled={isOnlyNetworkInstallerSelected}
            description={
              <Content component='small' style={{ maxWidth: '54rem' }}>
                A deployment-ready virtual disk format used by virtualization
                software like QEMU and KVM. It allows for efficient storage
                usage by only writing the changes made to the disk image rather
                than the entire image, ensuring the file only consumes physical
                storage as data is written.
              </Content>
            }
          />
        )}
        {supportedEnvironments?.includes('image-installer') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            label='Bare metal - Installer (.iso)'
            isChecked={environments.includes('image-installer')}
            onChange={() => {
              handleToggleEnvironment('image-installer');
            }}
            aria-label='Bare metal installer checkbox'
            id='checkbox-image-installer'
            name='Bare metal installer'
            isDisabled={isOnlyNetworkInstallerSelected}
            description={
              <Content component='small' style={{ maxWidth: '54rem' }}>
                This is a standard bootable image used to install RHEL directly
                onto physical hardware or &ldquo;bare metal&rdquo; servers. It
                contains the necessary installer and kernel to initialize a
                system from scratch, ensuring the OS is configured correctly for
                your specific hardware environment.
              </Content>
            }
          />
        )}
        {supportedEnvironments?.includes('network-installer') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            label={'Network - Installer (.iso)'}
            isChecked={environments.includes('network-installer')}
            onChange={() => {
              handleToggleEnvironment('network-installer');
            }}
            id='checkbox-network-installer'
            name='Network - Installer'
            isDisabled={isOtherEnvironmentSelected}
            description={
              <Content component='small' style={{ maxWidth: '54rem' }}>
                This is a lightweight image that differs from a standard
                &quot;full&quot; ISO by requiring an active network connection
                to pull the latest software directly from package repositories,
                as no OS packages are stored locally on the image.
              </Content>
            }
          />
        )}
        {supportedEnvironments?.includes('pxe-tar-xz') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            label={'Network - PXE boot (.tar.xz)'}
            isChecked={environments.includes('pxe-tar-xz')}
            onChange={() => {
              handleToggleEnvironment('pxe-tar-xz');
            }}
            aria-label='PXE boot image checkbox'
            id='checkbox-pxe-boot'
            name='PXE boot image'
            isDisabled={isOnlyNetworkInstallerSelected}
            description={
              <Content component='small' style={{ maxWidth: '54rem' }}>
                A PXE boot image is a compressed archive containing the kernel,
                initramfs, and root filesystem needed to boot a system over the
                network using the Preboot Execution Environment (PXE) protocol.
              </Content>
            }
          />
        )}
        {supportedEnvironments?.includes('wsl') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            label={'WSL - Windows Subsystem for Linux (.wsl)'}
            isChecked={environments.includes('wsl')}
            onChange={() => {
              handleToggleEnvironment('wsl');
            }}
            aria-label='windows subsystem for linux checkbox'
            id='checkbox-wsl'
            name='WSL'
            isDisabled={isOnlyNetworkInstallerSelected}
            description={
              <Content component='small' style={{ maxWidth: '54rem' }}>
                You can use RHEL on Microsoft&apos;s Windows Subsystem for Linux
                (WSL) for development and learning use cases. Red Hat supports
                WSL under the Validated Software Pattern and Third Party
                Component Support Policy, which does not include production use
                cases.
              </Content>
            }
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
