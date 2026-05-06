import React, { useEffect, useMemo } from 'react';

import {
  Alert,
  Checkbox,
  Content,
  EmptyState,
  FormGroup,
  Radio,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';

import { useTargetEnvironmentCategories } from '@/Hooks';
import { rhsmApi } from '@/store/api';
import {
  BootcDistributionItem,
  ImageTypes,
  useGetArchitecturesQuery,
  useGetDistributionsQuery,
} from '@/store/api/backend';
import { useCustomizationRestrictions } from '@/store/api/distributions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices';
import {
  addImageType,
  changeImageTypes,
  changeIsoPayloadReference,
  changeRegistrationType,
  reinitializeAws,
  reinitializeAzure,
  reinitializeGcp,
  removeImageType,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
  selectIsImageMode,
  selectIsoPayloadReference,
} from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import Aws from './Aws';
import Azure from './Azure';
import Gcp from './Gcp';

const TEXT_WRAP_WIDTH = '54rem';
const EMPTY_ENVIRONMENTS: string[] = [];

const createLabelWithTooltip = (
  prefix: string,
  tooltipText: string,
  description: string,
) => {
  return (
    <>
      {prefix} -{' '}
      <Tooltip content={description}>
        <span
          style={{
            textDecoration: 'underline dashed',
            textDecorationColor: 'gray',
          }}
        >
          {tooltipText}
        </span>
      </Tooltip>
    </>
  );
};

const TargetEnvironment = () => {
  const arch = useAppSelector(selectArchitecture);
  const environments = useAppSelector(selectImageTypes);
  const distribution = useAppSelector(selectDistribution);
  const isImageMode = useAppSelector(selectIsImageMode);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  const skipArchitectures = isImageMode && !isOnPremise;

  const {
    isError: isArchError,
    isFetching: isArchFetching,
    environments: archEnvironments,
  } = useGetArchitecturesQuery(
    {
      distribution,
    },
    {
      skip: skipArchitectures,
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

  const {
    data: bootcDistributionsRaw,
    isError: isBootcError,
    isFetching: isBootcFetching,
  } = useGetDistributionsQuery(
    { kind: 'bootc', arch, distro: distribution },
    { skip: !isImageMode || isOnPremise },
  );
  const bootcDistributions = bootcDistributionsRaw as
    | BootcDistributionItem[]
    | undefined;

  const isFetching = isArchFetching || isBootcFetching;
  const isError = isArchError || isBootcError;

  const supportedEnvironments = useMemo(() => {
    if (!skipArchitectures) return archEnvironments;

    return [
      ...new Set(bootcDistributions?.map((d) => d.type) ?? EMPTY_ENVIRONMENTS),
    ];
  }, [skipArchitectures, bootcDistributions, archEnvironments]);

  const dispatch = useAppDispatch();
  const prefetchActivationKeys = rhsmApi.usePrefetch('listActivationKeys');

  useEffect(() => {
    prefetchActivationKeys();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restrictions.registration.shouldHide) {
      dispatch(changeRegistrationType('register-later'));
    }
  }, [restrictions.registration.shouldHide, dispatch]);

  useEffect(() => {
    if (isImageMode && environments.length > 1) {
      dispatch(changeImageTypes([environments[0]]));
    }
  }, [isImageMode, environments, dispatch]);

  const isoPayloadReference = useAppSelector(selectIsoPayloadReference);
  useEffect(() => {
    if (!isImageMode || !environments.includes('bootable-container-iso')) {
      return;
    }
    const entry = bootcDistributions?.find(
      (d) => d.type === 'bootable-container-iso' && d.distro === distribution,
    );
    const refs = entry?.iso_payload_references;
    if (!refs || refs.length === 0) {
      return;
    }
    if (isoPayloadReference && refs.includes(isoPayloadReference)) {
      return;
    }
    dispatch(changeIsoPayloadReference(refs[0]));
  }, [
    isImageMode,
    environments,
    bootcDistributions,
    distribution,
    isoPayloadReference,
    dispatch,
  ]);

  const isOnlyNetworkInstallerSelected =
    environments.length === 1 && environments.includes('network-installer');

  const isOtherEnvironmentSelected =
    environments.length >= 1 && !environments.includes('network-installer');

  const { privateClouds, publicClouds, miscFormats } =
    useTargetEnvironmentCategories(supportedEnvironments);

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

  const handleSelectSingleEnvironment = (environment: ImageTypes) => {
    dispatch(changeImageTypes([environment]));
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

  if (supportedEnvironments.length === 0) {
    return (
      <FormGroup
        isRequired={true}
        role='group'
        label='Target environments'
        fieldId='target-environments'
      >
        <Content component='p'>
          No target environments are currently available for the selected
          architecture.
        </Content>
      </FormGroup>
    );
  }

  return (
    <FormGroup
      isRequired={true}
      role='group'
      label={<span className='pf-v6-u-font-size-md'>Target environments</span>}
      fieldId='target-environments'
    >
      <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
        {isImageMode
          ? 'Select a target environment for this image.'
          : 'Select one or more target environments for this image.'}
      </Content>

      {publicClouds.length > 0 && (
        <FormGroup
          label='Public cloud'
          className='pf-v6-u-mt-md'
          role='group'
          aria-label='Public cloud'
          fieldId='public-cloud-group'
        >
          {publicClouds.includes('aws') &&
            (isImageMode ? (
              <Radio
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='radio-aws'
                name='target-environment'
                label='Amazon Web Services'
                aria-label='Amazon Web Services'
                isChecked={environments.includes('aws')}
                onChange={() => handleSelectSingleEnvironment('aws')}
                body={environments.includes('aws') ? <Aws /> : undefined}
              />
            ) : (
              <Checkbox
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='checkbox-aws'
                name='Amazon Web Services'
                label='Amazon Web Services'
                aria-label='Amazon Web Services checkbox'
                isChecked={environments.includes('aws')}
                isDisabled={isOnlyNetworkInstallerSelected}
                onChange={() => handleToggleEnvironment('aws')}
                body={environments.includes('aws') ? <Aws /> : undefined}
              />
            ))}
          {publicClouds.includes('gcp') &&
            (isImageMode ? (
              <Radio
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='radio-gcp'
                name='target-environment'
                label='Google Cloud'
                aria-label='Google Cloud'
                isChecked={environments.includes('gcp')}
                onChange={() => handleSelectSingleEnvironment('gcp')}
                body={environments.includes('gcp') ? <Gcp /> : undefined}
              />
            ) : (
              <Checkbox
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='checkbox-gcp'
                name='Google Cloud'
                label='Google Cloud'
                aria-label='Google Cloud checkbox'
                isChecked={environments.includes('gcp')}
                isDisabled={isOnlyNetworkInstallerSelected}
                onChange={() => handleToggleEnvironment('gcp')}
                body={environments.includes('gcp') ? <Gcp /> : undefined}
              />
            ))}
          {publicClouds.includes('azure') &&
            (isImageMode ? (
              <Radio
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='radio-azure'
                name='target-environment'
                label='Microsoft Azure'
                aria-label='Microsoft Azure'
                isChecked={environments.includes('azure')}
                onChange={() => handleSelectSingleEnvironment('azure')}
                body={environments.includes('azure') ? <Azure /> : undefined}
              />
            ) : (
              <Checkbox
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='checkbox-azure'
                name='Microsoft Azure'
                label='Microsoft Azure'
                aria-label='Microsoft Azure checkbox'
                isChecked={environments.includes('azure')}
                isDisabled={isOnlyNetworkInstallerSelected}
                onChange={() => handleToggleEnvironment('azure')}
                body={environments.includes('azure') ? <Azure /> : undefined}
              />
            ))}
          {publicClouds.includes('oci') &&
            (isImageMode ? (
              <Radio
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='radio-oci'
                name='target-environment'
                label='Oracle Cloud Infrastructure'
                aria-label='Oracle Cloud Infrastructure'
                isChecked={environments.includes('oci')}
                onChange={() => handleSelectSingleEnvironment('oci')}
              />
            ) : (
              <Checkbox
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='checkbox-oci'
                name='Oracle Cloud Infrastructure'
                label='Oracle Cloud Infrastructure'
                aria-label='Oracle Cloud Infrastructure checkbox'
                isChecked={environments.includes('oci')}
                isDisabled={isOnlyNetworkInstallerSelected}
                onChange={() => handleToggleEnvironment('oci')}
              />
            ))}
        </FormGroup>
      )}

      {privateClouds.length > 0 && (
        <FormGroup
          label='Private cloud'
          className='pf-v6-u-mt-md'
          role='group'
          aria-label='Private cloud'
          fieldId='private-cloud-group'
        >
          {privateClouds.includes('vsphere-ova') &&
            (isImageMode ? (
              <Radio
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='radio-vsphere-ova'
                name='target-environment'
                label={createLabelWithTooltip(
                  'VMware vSphere',
                  'Open virtualization format (.ova)',
                  'An OVA file is a virtual appliance used by virtualization platforms such as VMware vSphere. It is a package that contains files used to describe a virtual machine, which includes a VMDK image, OVF descriptor file and a manifest file.',
                )}
                aria-label='VMware vSphere OVA'
                isChecked={environments.includes('vsphere-ova')}
                onChange={() => handleSelectSingleEnvironment('vsphere-ova')}
              />
            ) : (
              <Checkbox
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='vsphere-checkbox-ova'
                isLabelWrapped
                name='vsphere-checkbox-ova'
                label={createLabelWithTooltip(
                  'VMware vSphere',
                  'Open virtualization format (.ova)',
                  'An OVA file is a virtual appliance used by virtualization platforms such as VMware vSphere. It is a package that contains files used to describe a virtual machine, which includes a VMDK image, OVF descriptor file and a manifest file.',
                )}
                aria-label='VMware vSphere checkbox OVA'
                isChecked={environments.includes('vsphere-ova')}
                isDisabled={isOnlyNetworkInstallerSelected}
                onChange={() => {
                  handleToggleEnvironment('vsphere-ova');
                }}
              />
            ))}
          {privateClouds.includes('vsphere') &&
            (isImageMode ? (
              <Radio
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='radio-vsphere-vmdk'
                name='target-environment'
                label={createLabelWithTooltip(
                  'VMware vSphere',
                  'Virtual disk (.vmdk)',
                  'A VMDK file is a virtual disk that stores the contents of a virtual machine. This disk has to be imported into vSphere using govc import.vmdk, use the OVA version when using the vSphere UI.',
                )}
                aria-label='VMware vSphere VMDK'
                isChecked={environments.includes('vsphere')}
                onChange={() => handleSelectSingleEnvironment('vsphere')}
              />
            ) : (
              <Checkbox
                className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
                id='vsphere-checkbox-vmdk'
                isLabelWrapped
                name='vsphere-checkbox-vmdk'
                label={createLabelWithTooltip(
                  'VMware vSphere',
                  'Virtual disk (.vmdk)',
                  'A VMDK file is a virtual disk that stores the contents of a virtual machine. This disk has to be imported into vSphere using govc import.vmdk, use the OVA version when using the vSphere UI.',
                )}
                aria-label='VMware vSphere checkbox VMDK'
                isChecked={environments.includes('vsphere')}
                isDisabled={isOnlyNetworkInstallerSelected}
                onChange={() => {
                  handleToggleEnvironment('vsphere');
                }}
              />
            ))}
        </FormGroup>
      )}

      <FormGroup
        label={
          privateClouds.length > 0 || publicClouds.length > 0
            ? 'Miscellaneous formats'
            : undefined
        }
        className='pf-v6-u-mt-md'
        role='group'
        aria-label='Miscellaneous formats'
        fieldId='misc-formats-group'
      >
        {miscFormats.includes('guest-image') &&
          (isImageMode ? (
            <Radio
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='radio-guest-image'
              name='target-environment'
              label={createLabelWithTooltip(
                'Virtualization',
                'Guest image (.qcow2)',
                'A deployment-ready virtual disk format used by Openshift Virtualization and libvirt. It allows for efficient storage usage by only writing the changes made to the disk image rather than the entire image, ensuring the file only consumes physical storage as data is written.',
              )}
              aria-label='Virtualization guest image'
              isChecked={environments.includes('guest-image')}
              onChange={() => handleSelectSingleEnvironment('guest-image')}
            />
          ) : (
            <Checkbox
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='checkbox-guest-image'
              isLabelWrapped
              name='Virtualization guest image'
              label={createLabelWithTooltip(
                'Virtualization',
                'Guest image (.qcow2)',
                'A deployment-ready virtual disk format used by Openshift Virtualization and libvirt. It allows for efficient storage usage by only writing the changes made to the disk image rather than the entire image, ensuring the file only consumes physical storage as data is written.',
              )}
              aria-label='Virtualization guest image checkbox'
              isChecked={environments.includes('guest-image')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => {
                handleToggleEnvironment('guest-image');
              }}
            />
          ))}
        {miscFormats.includes('image-installer') &&
          (isImageMode ? (
            <Radio
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='radio-image-installer'
              name='target-environment'
              label={createLabelWithTooltip(
                'Bare metal',
                'Installer (.iso)',
                'This is a standard bootable image used to install RHEL directly onto physical hardware or "bare metal" servers. It contains the necessary installer and kernel to initialize a system from scratch, ensuring the OS is configured correctly for your specific hardware environment.',
              )}
              aria-label='Bare metal installer'
              isChecked={environments.includes('image-installer')}
              onChange={() => handleSelectSingleEnvironment('image-installer')}
            />
          ) : (
            <Checkbox
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='checkbox-image-installer'
              isLabelWrapped
              name='Bare metal installer'
              label={createLabelWithTooltip(
                'Bare metal',
                'Installer (.iso)',
                'This is a standard bootable image used to install RHEL directly onto physical hardware or "bare metal" servers. It contains the necessary installer and kernel to initialize a system from scratch, ensuring the OS is configured correctly for your specific hardware environment.',
              )}
              aria-label='Bare metal installer checkbox'
              isChecked={environments.includes('image-installer')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => {
                handleToggleEnvironment('image-installer');
              }}
            />
          ))}
        {miscFormats.includes('bootable-container-iso') && isImageMode && (
          <Radio
            className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
            id='radio-bootable-container-iso'
            name='target-environment'
            label='Container installer (.iso)'
            aria-label='Container installer'
            isChecked={environments.includes('bootable-container-iso')}
            onChange={() =>
              handleSelectSingleEnvironment('bootable-container-iso')
            }
          />
        )}
        {miscFormats.includes('network-installer') &&
          (isImageMode ? (
            <Radio
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='radio-network-installer'
              name='target-environment'
              label={createLabelWithTooltip(
                'Network',
                'Installer (.iso)',
                'This is a lightweight image that differs from a standard "full" ISO by requiring an active network connection to pull the latest software directly from package repositories, as no OS packages are stored locally on the image.',
              )}
              aria-label='Network installer'
              isChecked={environments.includes('network-installer')}
              onChange={() =>
                handleSelectSingleEnvironment('network-installer')
              }
            />
          ) : (
            <Checkbox
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='checkbox-network-installer'
              isLabelWrapped
              name='Network - Installer'
              label={createLabelWithTooltip(
                'Network',
                'Installer (.iso)',
                'This is a lightweight image that differs from a standard "full" ISO by requiring an active network connection to pull the latest software directly from package repositories, as no OS packages are stored locally on the image.',
              )}
              aria-label='Network installer checkbox'
              isChecked={environments.includes('network-installer')}
              isDisabled={isOtherEnvironmentSelected}
              onChange={() => {
                handleToggleEnvironment('network-installer');
              }}
            />
          ))}
        {miscFormats.includes('pxe-tar-xz') &&
          (isImageMode ? (
            <Radio
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='radio-pxe-boot'
              name='target-environment'
              label={createLabelWithTooltip(
                'Network',
                'PXE boot (.tar.xz)',
                'A PXE boot image is a compressed archive containing the kernel, initramfs, and root filesystem needed to boot a system over the network using the Preboot Execution Environment (PXE) protocol.',
              )}
              aria-label='PXE boot image'
              isChecked={environments.includes('pxe-tar-xz')}
              onChange={() => handleSelectSingleEnvironment('pxe-tar-xz')}
            />
          ) : (
            <Checkbox
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='checkbox-pxe-boot'
              isLabelWrapped
              name='PXE boot image'
              label={createLabelWithTooltip(
                'Network',
                'PXE boot (.tar.xz)',
                'A PXE boot image is a compressed archive containing the kernel, initramfs, and root filesystem needed to boot a system over the network using the Preboot Execution Environment (PXE) protocol.',
              )}
              aria-label='PXE boot image checkbox'
              isChecked={environments.includes('pxe-tar-xz')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => {
                handleToggleEnvironment('pxe-tar-xz');
              }}
            />
          ))}
        {miscFormats.includes('wsl') &&
          (isImageMode ? (
            <Radio
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='radio-wsl'
              name='target-environment'
              label={createLabelWithTooltip(
                'WSL',
                'Windows Subsystem for Linux (.wsl)',
                "RHEL on Microsoft's Windows Subsystem for Linux (WSL) can be used for development and learning use cases. WSL is supported by Red Hat under the Validated Software Pattern and Third Party Component Support Policy, which does not include production use cases.",
              )}
              aria-label='Windows Subsystem for Linux'
              isChecked={environments.includes('wsl')}
              onChange={() => handleSelectSingleEnvironment('wsl')}
            />
          ) : (
            <Checkbox
              className='pf-v6-u-mb-sm pf-v6-u-ml-lg'
              id='checkbox-wsl'
              isLabelWrapped
              name='WSL'
              label={createLabelWithTooltip(
                'WSL',
                'Windows Subsystem for Linux (.wsl)',
                "RHEL on Microsoft's Windows Subsystem for Linux (WSL) can be used for development and learning use cases. WSL is supported by Red Hat under the Validated Software Pattern and Third Party Component Support Policy, which does not include production use cases.",
              )}
              aria-label='Windows Subsystem for Linux checkbox'
              isChecked={environments.includes('wsl')}
              isDisabled={isOnlyNetworkInstallerSelected}
              onChange={() => {
                handleToggleEnvironment('wsl');
              }}
            />
          ))}
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
