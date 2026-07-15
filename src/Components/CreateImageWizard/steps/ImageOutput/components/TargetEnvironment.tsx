import React, { useEffect } from 'react';

import {
  Alert,
  Content,
  EmptyState,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';

import { rhsmApi } from '@/store/api';
import {
  type Distributions,
  useGetArchitectureEnvironmentsQuery,
  useGetDistributionEnvironmentsQuery,
} from '@/store/api/backend';
import { useCustomizationRestrictions } from '@/store/api/distributions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeImageTypes,
  changeIsoPayloadReference,
  changeRegistrationType,
  selectArchitecture,
  selectDistribution,
  selectForceShowErrors,
  selectImageTypes,
  selectIsImageMode,
  selectIsOnlyNetworkInstallerSelected,
  selectIsoPayloadReference,
  selectIsOtherEnvironmentSelected,
} from '@/store/slices/wizard';

import Aws from './Aws';
import Azure from './Azure';
import Gcp from './Gcp';
import TargetEnvironmentOption from './TargetEnvironmentOption';

const TEXT_WRAP_WIDTH = '54rem';

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
  const isOnlyNetworkInstallerSelected = useAppSelector(
    selectIsOnlyNetworkInstallerSelected,
  );
  const isOtherEnvironmentSelected = useAppSelector(
    selectIsOtherEnvironmentSelected,
  );
  const forceShowErrors = useAppSelector(selectForceShowErrors);

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  const archResult = useGetArchitectureEnvironmentsQuery(
    { distribution: distribution as Distributions, arch },
    { skip: isImageMode },
  );

  const distroResult = useGetDistributionEnvironmentsQuery(
    { arch, distro: distribution },
    { skip: !isImageMode },
  );

  const { data, isFetching, isError } = isImageMode ? distroResult : archResult;

  const {
    publicClouds = [],
    privateClouds = [],
    miscFormats = [],
    hasEnvironments = false,
  } = data ?? {};

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
    const entry = distroResult.data?.distributions.find(
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
    distroResult.data,
    distribution,
    isoPayloadReference,
    dispatch,
  ]);

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

  if (!hasEnvironments) {
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
      <Content component='small'>
        {isImageMode
          ? 'Select a target environment for this image.'
          : 'Select one or more target environments for this image.'}
      </Content>
      {forceShowErrors && environments.length === 0 && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant='error'>
              Select at least one target environment.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}

      {publicClouds.length > 0 && (
        <FormGroup
          label='Public cloud'
          className='pf-v6-u-mt-md'
          role='group'
          aria-label='Public cloud'
          fieldId='public-cloud-group'
        >
          {publicClouds.includes('aws') && (
            <TargetEnvironmentOption
              environment='aws'
              label='Amazon Web Services'
              ariaLabel='Amazon Web Services'
              isDisabled={isOnlyNetworkInstallerSelected}
              body={<Aws />}
            />
          )}
          {publicClouds.includes('gcp') && (
            <TargetEnvironmentOption
              environment='gcp'
              label='Google Cloud'
              ariaLabel='Google Cloud'
              isDisabled={isOnlyNetworkInstallerSelected}
              body={<Gcp />}
            />
          )}
          {publicClouds.includes('azure') && (
            <TargetEnvironmentOption
              environment='azure'
              label='Microsoft Azure'
              ariaLabel='Microsoft Azure'
              isDisabled={isOnlyNetworkInstallerSelected}
              body={<Azure />}
            />
          )}
          {publicClouds.includes('oci') && (
            <TargetEnvironmentOption
              environment='oci'
              label='Oracle Cloud Infrastructure'
              ariaLabel='Oracle Cloud Infrastructure'
              isDisabled={isOnlyNetworkInstallerSelected}
            />
          )}
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
          {privateClouds.includes('vsphere-ova') && (
            <TargetEnvironmentOption
              environment='vsphere-ova'
              label={createLabelWithTooltip(
                'VMware vSphere',
                'Open virtualization format (.ova)',
                'An OVA file is a virtual appliance used by virtualization platforms such as VMware vSphere. It is a package that contains files used to describe a virtual machine, which includes a VMDK image, OVF descriptor file and a manifest file.',
              )}
              ariaLabel='VMware vSphere OVA'
              isDisabled={isOnlyNetworkInstallerSelected}
            />
          )}
          {privateClouds.includes('vsphere') && (
            <TargetEnvironmentOption
              environment='vsphere'
              label={createLabelWithTooltip(
                'VMware vSphere',
                'Virtual disk (.vmdk)',
                'A VMDK file is a virtual disk that stores the contents of a virtual machine. This disk has to be imported into vSphere using govc import.vmdk, use the OVA version when using the vSphere UI.',
              )}
              ariaLabel='VMware vSphere VMDK'
              isDisabled={isOnlyNetworkInstallerSelected}
            />
          )}
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
        {miscFormats.includes('guest-image') && (
          <TargetEnvironmentOption
            environment='guest-image'
            label={createLabelWithTooltip(
              'Virtualization',
              'Guest image (.qcow2)',
              'A deployment-ready virtual disk format used by Openshift Virtualization and libvirt. It allows for efficient storage usage by only writing the changes made to the disk image rather than the entire image, ensuring the file only consumes physical storage as data is written.',
            )}
            ariaLabel='Virtualization guest image'
            isDisabled={isOnlyNetworkInstallerSelected}
          />
        )}
        {miscFormats.includes('image-installer') && (
          <TargetEnvironmentOption
            environment='image-installer'
            label={createLabelWithTooltip(
              'Bare metal',
              'Installer (.iso)',
              'This is a standard bootable image used to install RHEL directly onto physical hardware or "bare metal" servers. It contains the necessary installer and kernel to initialize a system from scratch, ensuring the OS is configured correctly for your specific hardware environment.',
            )}
            ariaLabel='Bare metal installer'
            isDisabled={isOnlyNetworkInstallerSelected}
          />
        )}
        {miscFormats.includes('bootable-container-iso') && isImageMode && (
          <TargetEnvironmentOption
            environment='bootable-container-iso'
            label='Container installer (.iso)'
            ariaLabel='Container installer'
          />
        )}
        {miscFormats.includes('network-installer') && (
          <TargetEnvironmentOption
            environment='network-installer'
            label={createLabelWithTooltip(
              'Network',
              'Installer (.iso)',
              isOtherEnvironmentSelected
                ? 'Network installer cannot be combined with other image types'
                : 'This is a lightweight image that differs from a standard "full" ISO by requiring an active network connection to pull the latest software directly from package repositories, as no OS packages are stored locally on the image.',
            )}
            ariaLabel='Network installer'
            isDisabled={isOtherEnvironmentSelected}
          />
        )}
        {miscFormats.includes('pxe-tar-xz') && (
          <TargetEnvironmentOption
            environment='pxe-tar-xz'
            label={createLabelWithTooltip(
              'Network',
              'PXE boot (.tar.xz)',
              'A PXE boot image is a compressed archive containing the kernel, initramfs, and root filesystem needed to boot a system over the network using the Preboot Execution Environment (PXE) protocol.',
            )}
            ariaLabel='PXE boot image'
            isDisabled={isOnlyNetworkInstallerSelected}
          />
        )}
        {miscFormats.includes('wsl') && (
          <TargetEnvironmentOption
            environment='wsl'
            label={createLabelWithTooltip(
              'WSL',
              'Windows Subsystem for Linux (.wsl)',
              "RHEL on Microsoft's Windows Subsystem for Linux (WSL) can be used for development and learning use cases. WSL is supported by Red Hat under the Validated Software Pattern and Third Party Component Support Policy, which does not include production use cases.",
            )}
            ariaLabel='Windows Subsystem for Linux'
            isDisabled={isOnlyNetworkInstallerSelected}
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
