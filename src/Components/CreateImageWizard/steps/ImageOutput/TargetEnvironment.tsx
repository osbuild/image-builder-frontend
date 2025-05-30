import React, { useEffect } from 'react';

import {
  Button,
  Card,
  Checkbox,
  FormGroup,
  Popover,
  Radio,
  Tooltip,
  Content,
  CardHeader,
  Gallery,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { HelpIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useGetArchitecturesQuery } from '../../../../store/backendApi';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { ImageTypes } from '../../../../store/imageBuilderApi';
import { provisioningApi } from '../../../../store/provisioningApi';
import { rhsmApi } from '../../../../store/rhsmApi';
import {
  addImageType,
  reinitializeAws,
  reinitializeAzure,
  reinitializeGcp,
  removeImageType,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from '../../../../store/wizardSlice';
import isRhel from '../../../../Utilities/isRhel';
import {
  useFlag,
  useGetEnvironment,
} from '../../../../Utilities/useGetEnvironment';

const TargetEnvironment = () => {
  const arch = useAppSelector(selectArchitecture);
  const environments = useAppSelector(selectImageTypes);
  const distribution = useAppSelector(selectDistribution);
  const { isFedoraEnv } = useGetEnvironment();

  const { data } = useGetArchitecturesQuery(
    {
      distribution: distribution,
    },
    { skip: isFedoraEnv && isRhel(distribution) }
  );
  // TODO: Handle isFetching state (add skeletons)
  // TODO: Handle isError state (very unlikely...)

  const hasVsphere =
    environments.includes('vsphere') || environments.includes('vsphere-ova');

  const dispatch = useAppDispatch();
  const prefetchSources = provisioningApi.usePrefetch('getSourceList');
  const prefetchActivationKeys = rhsmApi.usePrefetch('listActivationKeys');

  const showOracleUnavailableWarning = useFlag(
    'image-builder.oci.unavailable-warning.enabled'
  );

  useEffect(() => {
    if (!isFedoraEnv) prefetchActivationKeys();
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

  const ociTile = (
    <Card
      style={{ textAlign: 'center' } as React.CSSProperties}
      onClick={() => {
        handleToggleEnvironment('oci');
      }}
      isSelected={environments.includes('oci')}
      isSelectable
      isClickable
      isDisabled={showOracleUnavailableWarning}
      isLarge
    >
      <CardHeader>
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <img
              className="provider-icon"
              src={'/apps/frontend-assets/partners-icons/oracle-short.svg'}
              alt="Oracle Cloud Infrastructure logo"
            />
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h5" size="md">
              Oracle Cloud Infrastructure
            </Title>
          </FlexItem>
        </Flex>
      </CardHeader>
    </Card>
  );

  return (
    <FormGroup
      isRequired={true}
      label="Select target environments"
      data-testid="target-select"
    >
      <FormGroup label={<small>Public cloud</small>}>
        <Gallery hasGutter>
          {supportedEnvironments?.includes('aws') && (
            <Card
              style={{ textAlign: 'center' } as React.CSSProperties}
              data-testid="upload-aws"
              onClick={() => {
                handleToggleEnvironment('aws');
              }}
              onMouseEnter={() => prefetchSources({ provider: 'aws' })}
              isSelected={environments.includes('aws')}
              isSelectable
              isLarge
            >
              <CardHeader>
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <img
                      className="provider-icon"
                      src={'/apps/frontend-assets/partners-icons/aws.svg'}
                      alt="Amazon Web Services logo"
                    />
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h5" size="md">
                      Amazon Web Services
                    </Title>
                  </FlexItem>
                </Flex>
              </CardHeader>
            </Card>
          )}
          {supportedEnvironments?.includes('gcp') && (
            <Card
              style={{ textAlign: 'center' } as React.CSSProperties}
              data-testid="upload-google"
              onClick={() => {
                handleToggleEnvironment('gcp');
              }}
              isSelected={environments.includes('gcp')}
              onMouseEnter={() => prefetchSources({ provider: 'gcp' })}
              isSelectable
              isLarge
            >
              <CardHeader>
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <img
                      className="provider-icon"
                      src={
                        '/apps/frontend-assets/partners-icons/google-cloud-short.svg'
                      }
                      alt="Google Cloud Platform logo"
                    />
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h5" size="md">
                      Google Cloud Platform
                    </Title>
                  </FlexItem>
                </Flex>
              </CardHeader>
            </Card>
          )}
          {supportedEnvironments?.includes('azure') && (
            <Card
              style={{ textAlign: 'center' } as React.CSSProperties}
              data-testid="upload-azure"
              onClick={() => {
                handleToggleEnvironment('azure');
              }}
              onMouseEnter={() => prefetchSources({ provider: 'azure' })}
              isSelected={environments.includes('azure')}
              isSelectable
              isLarge
            >
              <CardHeader>
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <img
                      className="provider-icon"
                      src={
                        '/apps/frontend-assets/partners-icons/microsoft-azure-short.svg'
                      }
                      alt="Microsoft Azure logo"
                    />
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h5" size="md">
                      Microsoft Azure
                    </Title>
                  </FlexItem>
                </Flex>
              </CardHeader>
            </Card>
          )}
          {supportedEnvironments?.includes('oci') &&
            showOracleUnavailableWarning && (
              <Tooltip
                content={
                  <div>Oracle Cloud support is temporarily unavailable</div>
                }
              >
                <div>{ociTile}</div>
              </Tooltip>
            )}
          {supportedEnvironments?.includes('oci') &&
            !showOracleUnavailableWarning &&
            ociTile}
        </Gallery>
      </FormGroup>
      {supportedEnvironments?.includes('vsphere') && (
        <>
          <FormGroup
            label={<small>Private cloud</small>}
            className="pf-v6-u-mt-sm"
          >
            <Checkbox
              label="VMware vSphere"
              isChecked={hasVsphere}
              onChange={() => {
                if (!hasVsphere) {
                  dispatch(addImageType('vsphere-ova'));
                } else {
                  if (environments.includes('vsphere')) {
                    dispatch(removeImageType('vsphere'));
                  }
                  if (environments.includes('vsphere-ova')) {
                    dispatch(removeImageType('vsphere-ova'));
                  }
                }
              }}
              aria-label="VMware checkbox"
              id="checkbox-vmware"
              name="VMware"
              data-testid="checkbox-vmware"
              body={
                <>
                  {supportedEnvironments?.includes('vsphere-ova') && (
                    <Radio
                      name="vsphere-radio"
                      aria-label="VMware vSphere radio button OVA"
                      id="vsphere-radio-ova"
                      data-testid="radio-vsphere-ova"
                      label={
                        <>
                          Open virtualization format (.ova)
                          <Popover
                            maxWidth="30rem"
                            position="right"
                            bodyContent={
                              <Content>
                                <Content>
                                  An OVA file is a virtual appliance used by
                                  virtualization platforms such as VMware
                                  vSphere. It is a package that contains files
                                  used to describe a virtual machine, which
                                  includes a VMDK image, OVF descriptor file and
                                  a manifest file.
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
                        handleToggleEnvironment('vsphere');
                      }}
                      isChecked={environments.includes('vsphere-ova')}
                      isDisabled={
                        !(
                          environments.includes('vsphere') ||
                          environments.includes('vsphere-ova')
                        )
                      }
                    />
                  )}
                  <Radio
                    className="pf-v6-u-mt-sm"
                    name="vsphere-radio"
                    aria-label="VMware vSphere radio button VMDK"
                    id="vsphere-radio-vmdk"
                    data-testid="radio-vsphere-vmdk"
                    label={
                      <>
                        Virtual disk (.vmdk)
                        <Popover
                          maxWidth="30rem"
                          position="right"
                          bodyContent={
                            <Content>
                              <Content>
                                A VMDK file is a virtual disk that stores the
                                contents of a virtual machine. This disk has to
                                be imported into vSphere using govc import.vmdk,
                                use the OVA version when using the vSphere UI.
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
                      handleToggleEnvironment('vsphere-ova');
                      handleToggleEnvironment('vsphere');
                    }}
                    isChecked={environments.includes('vsphere')}
                    isDisabled={
                      !(
                        environments.includes('vsphere') ||
                        environments.includes('vsphere-ova')
                      )
                    }
                  />
                </>
              }
            />
          </FormGroup>
        </>
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
            data-testid="checkbox-guest-image"
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
            data-testid="checkbox-image-installer"
          />
        )}
        {supportedEnvironments?.includes('wsl') && (
          <Checkbox
            label={
              <>
                WSL - Windows Subsystem for Linux (.tar.gz)
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
            data-testid="checkbox-wsl"
          />
        )}
      </FormGroup>
    </FormGroup>
  );
};

export default TargetEnvironment;
