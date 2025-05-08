import React, { MouseEventHandler, useEffect } from 'react';

import {
  Button,
  Card,
  Checkbox,
  FormGroup,
  Popover,
  Content,
  CardHeader,
  Gallery,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { HelpIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useGetArchitecturesQuery } from '../../../../../store/backendApi';
import { useAppSelector, useAppDispatch } from '../../../../../store/hooks';
import { ImageTypes } from '../../../../../store/imageBuilderApi';
import { provisioningApi } from '../../../../../store/provisioningApi';
import { rhsmApi } from '../../../../../store/rhsmApi';
import {
  addImageType,
  reinitializeAws,
  reinitializeAzure,
  reinitializeGcp,
  removeImageType,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from '../../../../../store/wizardSlice';

type TargetEnvironmentCardProps = {
  title: string;
  imageSrc: string;
  imageAlt: string;
  isClicked: boolean;
  isDisabled?: boolean;
  handleOnClick: () => void;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
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
      onClick={handleOnClick}
    >
      <CardHeader
        selectableActions={{
          name: title,
          selectableActionId: title.toLowerCase(),
          selectableActionAriaLabel: title.toLowerCase(),
          onClickAction: handleOnClick,
        }}
      >
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <img className="provider-icon" src={imageSrc} alt={imageAlt} />
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h5" size="md">
              {title}
            </Title>
          </FlexItem>
        </Flex>
      </CardHeader>
    </Card>
  );
};

const TargetEnvironment = () => {
  const arch = useAppSelector(selectArchitecture);
  const environments = useAppSelector(selectImageTypes);
  const distribution = useAppSelector(selectDistribution);

  const { data } = useGetArchitecturesQuery({
    distribution: distribution,
  });
  // TODO: Handle isFetching state (add skeletons)
  // TODO: Handle isError state (very unlikely...)

  const dispatch = useAppDispatch();
  const prefetchSources = provisioningApi.usePrefetch('getSourceList');
  const prefetchActivationKeys = rhsmApi.usePrefetch('listActivationKeys');

  useEffect(() => {
    prefetchActivationKeys();
  }, []);

  const supportedEnvironments = data?.find(
    (elem) => elem.arch === arch
  )?.image_types;

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

  return (
    <FormGroup
      isRequired={true}
      label="Select target environments"
      data-testid="target-select"
    >
      {publicCloudsSupported() && (
        <FormGroup label={<small>Public cloud</small>}>
          <Gallery hasGutter>
            {supportedEnvironments?.includes('aws') && (
              <TargetEnvironmentCard
                title="Amazon Web Services"
                imageSrc={'/apps/frontend-assets/partners-icons/aws.svg'}
                imageAlt="Amazon Web Services logo"
                handleOnClick={() => handleToggleEnvironment('aws')}
                onMouseEnter={() => prefetchSources({ provider: 'aws' })}
                isClicked={environments.includes('aws')}
              />
            )}
            {supportedEnvironments?.includes('gcp') && (
              <TargetEnvironmentCard
                title="Google Cloud Platform"
                imageSrc={
                  '/apps/frontend-assets/partners-icons/google-cloud-short.svg'
                }
                imageAlt="Google Cloud Platform logo"
                handleOnClick={() => handleToggleEnvironment('gcp')}
                onMouseEnter={() => prefetchSources({ provider: 'gcp' })}
                isClicked={environments.includes('gcp')}
              />
            )}
            {supportedEnvironments?.includes('azure') && (
              <TargetEnvironmentCard
                title="Microsoft Azure"
                imageSrc={
                  '/apps/frontend-assets/partners-icons/microsoft-azure-short.svg'
                }
                imageAlt="Microsoft Azure logo"
                handleOnClick={() => handleToggleEnvironment('azure')}
                onMouseEnter={() => prefetchSources({ provider: 'azure' })}
                isClicked={environments.includes('azure')}
              />
            )}
            {supportedEnvironments?.includes('oci') && (
              <TargetEnvironmentCard
                title="Oracle Cloud Infrastructure"
                imageSrc={
                  '/apps/frontend-assets/partners-icons/oracle-short.svg'
                }
                imageAlt="Oracle Cloud Infrastructure logo"
                handleOnClick={() => handleToggleEnvironment('oci')}
                isClicked={environments.includes('oci')}
              />
            )}
          </Gallery>
        </FormGroup>
      )}
      {(supportedEnvironments?.includes('vsphere') ||
        supportedEnvironments?.includes('vsphere-ova')) && (
        <FormGroup
          label={<small>Private cloud</small>}
          className="pf-v6-u-mt-sm"
        >
          {supportedEnvironments?.includes('vsphere-ova') && (
            <Checkbox
              name="vsphere-checkbox-ova"
              aria-label="VMware vSphere checkbox OVA"
              id="vsphere-checkbox-ova"
              label={
                <>
                  VMware vSphere - Open virtualization format (.ova)
                  <Popover
                    maxWidth="30rem"
                    position="right"
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
                      className="pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0"
                      variant="plain"
                      aria-label="About OVA file"
                      isInline
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
          {supportedEnvironments?.includes('vsphere') && (
            <Checkbox
              className="pf-v6-u-mt-sm"
              name="vsphere-checkbox-vmdk"
              aria-label="VMware vSphere checkbox VMDK"
              id="vsphere-checkbox-vmdk"
              label={
                <>
                  VMware vSphere - Virtual disk (.vmdk)
                  <Popover
                    maxWidth="30rem"
                    position="right"
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
                      className="pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0"
                      variant="plain"
                      aria-label="About VMDK file"
                      isInline
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
      <FormGroup label={<small>Other</small>}>
        {supportedEnvironments?.includes('guest-image') && (
          <Checkbox
            label="Virtualization - Guest image (.qcow2)"
            isChecked={environments.includes('guest-image')}
            onChange={() => {
              handleToggleEnvironment('guest-image');
            }}
            aria-label="Virtualization guest image checkbox"
            id="checkbox-guest-image"
            name="Virtualization guest image"
          />
        )}
        {supportedEnvironments?.includes('image-installer') && (
          <Checkbox
            label="Bare metal - Installer (.iso)"
            isChecked={environments.includes('image-installer')}
            onChange={() => {
              handleToggleEnvironment('image-installer');
            }}
            aria-label="Bare metal installer checkbox"
            id="checkbox-image-installer"
            name="Bare metal installer"
          />
        )}
        {supportedEnvironments?.includes('wsl') && (
          <Checkbox
            label={
              <>
                WSL - Windows Subsystem for Linux (.wsl)
                <Popover
                  maxWidth="30rem"
                  position="right"
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
                      component="a"
                      target="_blank"
                      variant="link"
                      icon={<ExternalLinkAltIcon />}
                      iconPosition="right"
                      isInline
                      href="https://access.redhat.com/articles/7115538"
                    >
                      Learn more about Red Hat&apos;s WSL support
                    </Button>
                  }
                >
                  <Button
                    icon={<HelpIcon />}
                    className="pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0"
                    variant="plain"
                    aria-label="About WSL file"
                    isInline
                  />
                </Popover>
              </>
            }
            isChecked={environments.includes('wsl')}
            onChange={() => {
              handleToggleEnvironment('wsl');
            }}
            aria-label="windows subsystem for linux checkbox"
            id="checkbox-wsl"
            name="WSL"
          />
        )}
      </FormGroup>
    </FormGroup>
  );
};

export default TargetEnvironment;
