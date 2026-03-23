import React, { useEffect, useMemo } from 'react';

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

const TEXT_WRAP_WIDTH = '54rem';
const PRIVATE_CLOUD_TYPES = new Set<string>(['vsphere', 'vsphere-ova']);
const PUBLIC_CLOUD_TYPES = new Set<string>(['aws', 'azure', 'gcp', 'oci']);
const EMPTY_ENVIRONMENTS: string[] = [];

const TargetEnvironment = () => {
  const arch = useAppSelector(selectArchitecture);
  const environments = useAppSelector(selectImageTypes);
  const distribution = useAppSelector(selectDistribution);

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  const {
    isError,
    isFetching,
    environments: supportedEnvironments,
  } = useGetArchitecturesQuery(
    {
      distribution,
    },
    {
      selectFromResult: ({ data, isFetching, isError }) => ({
        isError,
        isFetching,
        environments:
          data?.find((elem) => elem.arch === arch)?.image_types ??
          // this is defined as a const for referential stability
          EMPTY_ENVIRONMENTS,
      }),
    },
  );

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

  const isOnlyNetworkInstallerSelected =
    environments.length === 1 && environments.includes('network-installer');

  const isOtherEnvironmentSelected =
    environments.length >= 1 && !environments.includes('network-installer');

  const privateClouds = useMemo(
    () =>
      supportedEnvironments.filter((env): env is ImageTypes =>
        PRIVATE_CLOUD_TYPES.has(env),
      ),
    [supportedEnvironments],
  );

  const publicClouds = useMemo(
    () =>
      supportedEnvironments.filter((env): env is ImageTypes =>
        PUBLIC_CLOUD_TYPES.has(env),
      ),
    [supportedEnvironments],
  );

  const miscFormats = useMemo(
    () =>
      supportedEnvironments.filter(
        // Technically unknown values that aren't private or public clouds would get
        // incorrectly narrowed here, but this is fine since we only render known
        // values with the checkboxes and anything else gets discarded
        (env): env is ImageTypes =>
          !PRIVATE_CLOUD_TYPES.has(env) && !PUBLIC_CLOUD_TYPES.has(env),
      ),
    [supportedEnvironments],
  );

  useEffect(() => {
    if (isOnPremise) return;
    publicClouds
      .filter((env): env is 'aws' | 'azure' | 'gcp' => env !== 'oci')
      .forEach((provider) => prefetchSources({ provider }));
  }, [isOnPremise, publicClouds, prefetchSources]);

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
      role='group'
      label='Target environments'
      fieldId='target-environments'
    >
      <Content component='p'>Select target items for this image.</Content>

      {privateClouds.length > 0 && (
        <FormGroup
          label={<small>Private cloud</small>}
          className='pf-v6-u-mt-md'
          role='group'
          aria-label='Private cloud'
          fieldId='private-cloud-group'
        >
          {privateClouds.includes('vsphere-ova') && (
            <Checkbox
              className='pf-v6-u-mb-sm'
              id='vsphere-checkbox-ova'
              name='vsphere-checkbox-ova'
              label='VMware vSphere - Open virtualization format (.ova)'
              aria-label='VMware vSphere checkbox OVA'
              description={
                <Content
                  component='small'
                  style={{ maxWidth: TEXT_WRAP_WIDTH }}
                >
                  An OVA file is a virtual appliance used by virtualization
                  platforms such as VMware vSphere. It is a package that
                  contains files used to describe a virtual machine, which
                  includes a VMDK image, OVF descriptor file and a manifest
                  file.
                </Content>
              }
              isChecked={environments.includes('vsphere-ova')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => {
                handleToggleEnvironment('vsphere-ova');
              }}
            />
          )}
          {privateClouds.includes('vsphere') && (
            <Checkbox
              className='pf-v6-u-mb-sm'
              id='vsphere-checkbox-vmdk'
              name='vsphere-checkbox-vmdk'
              label='VMware vSphere - Virtual disk (.vmdk)'
              aria-label='VMware vSphere checkbox VMDK'
              description={
                <Content
                  component='small'
                  style={{ maxWidth: TEXT_WRAP_WIDTH }}
                >
                  A VMDK file is a virtual disk that stores the contents of a
                  virtual machine. This disk has to be imported into vSphere
                  using govc import.vmdk, use the OVA version when using the
                  vSphere UI.
                </Content>
              }
              isChecked={environments.includes('vsphere')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => {
                handleToggleEnvironment('vsphere');
              }}
            />
          )}
        </FormGroup>
      )}

      {publicClouds.length > 0 && (
        <FormGroup
          label={<small>Public cloud</small>}
          className='pf-v6-u-mt-md'
          role='group'
          aria-label='Public cloud'
          fieldId='public-cloud-group'
        >
          {publicClouds.includes('aws') && (
            <Checkbox
              className='pf-v6-u-mb-sm'
              id='checkbox-aws'
              name='Amazon Web Services'
              label='Amazon Web Services'
              aria-label='Amazon Web Services checkbox'
              isChecked={environments.includes('aws')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => handleToggleEnvironment('aws')}
              // NOTE: we can add the aws cloud config options
              // in the Checkbox `body` prop
            />
          )}
          {publicClouds.includes('gcp') && (
            <Checkbox
              className='pf-v6-u-mb-sm'
              id='checkbox-gcp'
              name='Google Cloud'
              label='Google Cloud'
              aria-label='Google Cloud checkbox'
              isChecked={environments.includes('gcp')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => handleToggleEnvironment('gcp')}
              // NOTE: we can add the gcp cloud config options
              // in the Checkbox `body` prop
            />
          )}
          {publicClouds.includes('azure') && (
            <Checkbox
              className='pf-v6-u-mb-sm'
              id='checkbox-azure'
              name='Microsoft Azure'
              label='Microsoft Azure'
              aria-label='Microsoft Azure checkbox'
              isChecked={environments.includes('azure')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => handleToggleEnvironment('azure')}
              // NOTE: we can add the azure cloud config options
              // in the Checkbox `body` prop
            />
          )}
          {publicClouds.includes('oci') && (
            <Checkbox
              className='pf-v6-u-mb-sm'
              id='checkbox-oci'
              name='Oracle Cloud Infrastructure'
              label='Oracle Cloud Infrastructure'
              aria-label='Oracle Cloud Infrastructure checkbox'
              isChecked={environments.includes('oci')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => handleToggleEnvironment('oci')}
            />
          )}
        </FormGroup>
      )}

      <FormGroup
        label={
          privateClouds.length === 0 &&
          publicClouds.length === 0 ? undefined : (
            <small>Miscellaneous formats</small>
          )
        }
        className='pf-v6-u-mt-md'
        role='group'
        aria-label='Miscellaneous formats'
        fieldId='misc-formats-group'
      >
        {miscFormats.includes('guest-image') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            id='checkbox-guest-image'
            name='Virtualization guest image'
            label='Virtualization - Guest image (.qcow2)'
            aria-label='Virtualization guest image checkbox'
            description={
              <Content component='small' style={{ maxWidth: TEXT_WRAP_WIDTH }}>
                A deployment-ready virtual disk format used by virtualization
                software like QEMU and KVM. It allows for efficient storage
                usage by only writing the changes made to the disk image rather
                than the entire image, ensuring the file only consumes physical
                storage as data is written.
              </Content>
            }
            isChecked={environments.includes('guest-image')}
            isDisabled={isOnlyNetworkInstallerSelected}
            onChange={() => {
              handleToggleEnvironment('guest-image');
            }}
          />
        )}
        {miscFormats.includes('image-installer') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            id='checkbox-image-installer'
            name='Bare metal installer'
            label='Bare metal - Installer (.iso)'
            aria-label='Bare metal installer checkbox'
            description={
              <Content component='small' style={{ maxWidth: TEXT_WRAP_WIDTH }}>
                This is a standard bootable image used to install RHEL directly
                onto physical hardware or &ldquo;bare metal&rdquo; servers. It
                contains the necessary installer and kernel to initialize a
                system from scratch, ensuring the OS is configured correctly for
                your specific hardware environment.
              </Content>
            }
            isChecked={environments.includes('image-installer')}
            isDisabled={isOnlyNetworkInstallerSelected}
            onChange={() => {
              handleToggleEnvironment('image-installer');
            }}
          />
        )}
        {miscFormats.includes('network-installer') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            id='checkbox-network-installer'
            name='Network - Installer'
            label='Network - Installer (.iso)'
            aria-label='Network installer checkbox'
            description={
              <Content component='small' style={{ maxWidth: TEXT_WRAP_WIDTH }}>
                This is a lightweight image that differs from a standard
                &quot;full&quot; ISO by requiring an active network connection
                to pull the latest software directly from package repositories,
                as no OS packages are stored locally on the image.
              </Content>
            }
            isChecked={environments.includes('network-installer')}
            isDisabled={isOtherEnvironmentSelected}
            onChange={() => {
              handleToggleEnvironment('network-installer');
            }}
          />
        )}
        {miscFormats.includes('pxe-tar-xz') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            id='checkbox-pxe-boot'
            name='PXE boot image'
            label='Network - PXE boot (.tar.xz)'
            aria-label='PXE boot image checkbox'
            description={
              <Content component='small' style={{ maxWidth: TEXT_WRAP_WIDTH }}>
                A PXE boot image is a compressed archive containing the kernel,
                initramfs, and root filesystem needed to boot a system over the
                network using the Preboot Execution Environment (PXE) protocol.
              </Content>
            }
            isChecked={environments.includes('pxe-tar-xz')}
            isDisabled={isOnlyNetworkInstallerSelected}
            onChange={() => {
              handleToggleEnvironment('pxe-tar-xz');
            }}
          />
        )}
        {miscFormats.includes('wsl') && (
          <Checkbox
            className='pf-v6-u-mb-sm'
            id='checkbox-wsl'
            name='WSL'
            label='WSL - Windows Subsystem for Linux (.wsl)'
            aria-label='Windows Subsystem for Linux checkbox'
            description={
              <Content component='small' style={{ maxWidth: TEXT_WRAP_WIDTH }}>
                You can use RHEL on Microsoft&apos;s Windows Subsystem for Linux
                (WSL) for development and learning use cases. Red Hat supports
                WSL under the Validated Software Pattern and Third Party
                Component Support Policy, which does not include production use
                cases.
              </Content>
            }
            isChecked={environments.includes('wsl')}
            isDisabled={isOnlyNetworkInstallerSelected}
            onChange={() => {
              handleToggleEnvironment('wsl');
            }}
          />
        )}
      </FormGroup>

      {isOnlyNetworkInstallerSelected && (
        <Alert
          variant='info'
          className='pf-v6-u-mt-lg'
          style={{ maxWidth: TEXT_WRAP_WIDTH }}
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
