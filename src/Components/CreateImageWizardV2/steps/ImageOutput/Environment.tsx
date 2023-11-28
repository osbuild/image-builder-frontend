import React, { useContext } from 'react';

import {
  Checkbox,
  FormGroup,
  Popover,
  Radio,
  Text,
  TextContent,
  TextVariants,
  Tile,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import {
  useGetArchitecturesQuery,
  Distributions,
  ArchitectureItem,
} from '../../../../store/imageBuilderApi';
import { provisioningApi } from '../../../../store/provisioningApi';
import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';
import { ImageWizardContext } from '../../ImageWizardContext';

type useGetAllowedTargetsPropType = {
  architecture: ArchitectureItem['arch'];
  release: Distributions;
};

/**
 * Contacts the backend to get a list of valid targets based on the user
 * requirements (release & architecture)
 *
 * @return an array of strings which contains the names of the authorized
 * targets. Alongside the array, a couple of flags indicate the status of the
 * request. isFetching stays true while the data are in transit. isError is set
 * to true if anything wrong happened. isSuccess is set to true otherwise.
 *
 * @param architecture the selected arch (x86_64 or aarch64)
 * @param release the selected release (see RELEASES in constants)
 */
export const useGetAllowedTargets = ({
  architecture,
  release,
}: useGetAllowedTargetsPropType) => {
  const { data, isFetching, isSuccess, isError } = useGetArchitecturesQuery({
    distribution: release,
  });

  let image_types: string[] = [];
  if (isSuccess && data) {
    data.forEach((elem) => {
      if (elem.arch === architecture) {
        image_types = elem.image_types;
      }
    });
  }

  return {
    data: image_types,
    isFetching: isFetching,
    isSuccess: isSuccess,
    isError: isError,
  };
};

/**
 * Type to represent the state of a target.
 * A target can be selected and/or authorized. An authorized target means the
 * target can be displayed to the user, selected means the user has selected
 * the target.
 */
type TargetType = {
  selected: boolean;
  authorized: boolean;
};

/**
 * Defines all the possible targets a user can build.
 */
export type EnvironmentStateType = {
  aws: TargetType;
  azure: TargetType;
  gcp: TargetType;
  oci: TargetType;
  'vsphere-ova': TargetType;
  vsphere: TargetType;
  'guest-image': TargetType;
  'image-installer': TargetType;
  wsl: TargetType;
};

/**
 * Takes an environment, a list of allowedTargets and updates the authorized
 * status of each targets in the environment accordingly.
 *
 * @param environment the environment to update
 * @param allowedTargets the list of targets authorized to get built
 * @return an updated environment
 */
export const filterEnvironment = (
  environment: EnvironmentStateType,
  allowedTargets: string[]
) => {
  const newEnv = { ...environment };
  Object.keys(environment).forEach((target) => {
    newEnv[target as keyof EnvironmentStateType].authorized =
      allowedTargets.includes(target);
  });
  return newEnv;
};

/**
 * @return true if at least one target has both its flags selected and
 * authorized set to true
 * @param env the environment to scan
 */
export const ValidateImageOutputStep = (): boolean => {
  let atLeastOne = false;
  const { environmentState } = useContext(ImageWizardContext);
  const [environment] = environmentState;
  Object.values(environment).forEach(({ selected, authorized }) => {
    atLeastOne = atLeastOne || (selected && authorized);
  });
  return atLeastOne;
};

/**
 * Displays a component that allows the user to pick the target they want
 * to build on.
 */
const Environment = () => {
  const { environmentState } = useContext(ImageWizardContext);
  const [environment, setEnvironment] = environmentState;
  const prefetchSources = provisioningApi.usePrefetch('getSourceList');
  const { isBeta } = useGetEnvironment();

  const handleSetEnvironment = (env: string, checked: boolean) =>
    setEnvironment((prevEnv) => {
      const newEnv: EnvironmentStateType = {
        ...prevEnv,
      };
      newEnv[env as keyof EnvironmentStateType].selected = checked;
      return newEnv;
    });

  // each item the user can select is depending on what's compatible with the
  // architecture and the distribution they previously selected. That's why
  // every sub parts are conditional to the `authorized` status of its
  // corresponding key in the state.
  return (
    <FormGroup
      isRequired={true}
      label="Select target environments"
      data-testid="target-select"
    >
      <FormGroup
        label={<Text component={TextVariants.small}>Public cloud</Text>}
        data-testid="target-public"
      >
        <div className="tiles">
          {environment['aws'].authorized && (
            <Tile
              className="tile pf-u-mr-sm"
              data-testid="upload-aws"
              title="Amazon Web Services"
              icon={
                <img
                  className="provider-icon"
                  src={'/apps/frontend-assets/partners-icons/aws.svg'}
                  alt="Amazon Web Services logo"
                />
              }
              onClick={() =>
                handleSetEnvironment('aws', !environment.aws.selected)
              }
              onMouseEnter={() => prefetchSources({ provider: 'aws' })}
              isSelected={environment.aws.selected}
              isStacked
              isDisplayLarge
            />
          )}
          {environment['gcp'].authorized && (
            <Tile
              className="tile pf-u-mr-sm"
              data-testid="upload-google"
              title="Google Cloud Platform"
              icon={
                <img
                  className="provider-icon"
                  src={
                    '/apps/frontend-assets/partners-icons/google-cloud-short.svg'
                  }
                  alt="Google Cloud Platform logo"
                />
              }
              onClick={() =>
                handleSetEnvironment('gcp', !environment.gcp.selected)
              }
              isSelected={environment.gcp.selected}
              onMouseEnter={() => prefetchSources({ provider: 'gcp' })}
              isStacked
              isDisplayLarge
            />
          )}
          {environment['azure'].authorized && (
            <Tile
              className="tile pf-u-mr-sm"
              data-testid="upload-azure"
              title="Microsoft Azure"
              icon={
                <img
                  className="provider-icon"
                  src={
                    '/apps/frontend-assets/partners-icons/microsoft-azure-short.svg'
                  }
                  alt="Microsoft Azure logo"
                />
              }
              onClick={() =>
                handleSetEnvironment('azure', !environment.azure.selected)
              }
              onMouseEnter={() => prefetchSources({ provider: 'azure' })}
              isSelected={environment.azure.selected}
              isStacked
              isDisplayLarge
            />
          )}
          {environment.oci.authorized && isBeta() && (
            <Tile
              className="tile pf-u-mr-sm"
              data-testid="upload-oci"
              title="Oracle Cloud Infrastructure"
              icon={
                <img
                  className="provider-icon"
                  src={'/apps/frontend-assets/partners-icons/oracle-short.svg'}
                  alt="Oracle Cloud Infrastructure logo"
                />
              }
              onClick={() =>
                handleSetEnvironment('oci', !environment.oci.selected)
              }
              isSelected={environment.oci.selected}
              isStacked
              isDisplayLarge
            />
          )}
        </div>
      </FormGroup>
      {environment['vsphere'].authorized && (
        <FormGroup
          label={<Text component={TextVariants.small}>Private cloud</Text>}
          className="pf-u-mt-sm"
          data-testid="target-private"
        >
          <Checkbox
            label="VMWare vSphere"
            isChecked={
              environment.vsphere.selected ||
              environment['vsphere-ova'].selected
            }
            onChange={(_event, checked) => {
              handleSetEnvironment('vsphere-ova', checked);
              handleSetEnvironment('vsphere', false);
            }}
            aria-label="VMWare checkbox"
            id="checkbox-vmware"
            name="VMWare"
            data-testid="checkbox-vmware"
          />
        </FormGroup>
      )}
      {environment['vsphere'].authorized && (
        <FormGroup
          className="pf-u-mt-sm pf-u-mb-sm pf-u-ml-xl"
          data-testid="target-private-vsphere-radio"
        >
          {environment['vsphere-ova'].authorized && (
            <Radio
              name="vsphere-radio"
              aria-label="VMWare vSphere radio button OVA"
              id="vsphere-radio-ova"
              label={
                <>
                  Open virtualization format (.ova)
                  <Popover
                    maxWidth="30rem"
                    position="right"
                    bodyContent={
                      <TextContent>
                        <Text>
                          An OVA file is a virtual appliance used by
                          virtualization platforms such as VMWare vSphere. It is
                          a package that contains files used to describe a
                          virtual machine, which includes a VMDK image, OVF
                          descriptor file and a manifest file.
                        </Text>
                      </TextContent>
                    }
                  >
                    <HelpIcon className="pf-u-ml-sm" />
                  </Popover>
                </>
              }
              onChange={(_event, checked) => {
                handleSetEnvironment('vsphere-ova', checked);
                handleSetEnvironment('vsphere', !checked);
              }}
              isChecked={environment['vsphere-ova'].selected}
              isDisabled={
                !(
                  environment.vsphere.selected ||
                  environment['vsphere-ova'].selected
                )
              }
            />
          )}
          <Radio
            className="pf-u-mt-sm"
            name="vsphere-radio"
            aria-label="VMWare vSphere radio button VMDK"
            id="vsphere-radio-vmdk"
            label={
              <>
                Virtual disk (.vmdk)
                <Popover
                  maxWidth="30rem"
                  position="right"
                  bodyContent={
                    <TextContent>
                      <Text>
                        A VMDK file is a virtual disk that stores the contents
                        of a virtual machine. This disk has to be imported into
                        vSphere using govc import.vmdk, use the OVA version when
                        using the vSphere UI.
                      </Text>
                    </TextContent>
                  }
                >
                  <HelpIcon className="pf-u-ml-sm" />
                </Popover>
              </>
            }
            onChange={(_event, checked) => {
              handleSetEnvironment('vsphere-ova', !checked);
              handleSetEnvironment('vsphere', checked);
            }}
            isChecked={environment.vsphere.selected}
            isDisabled={
              !(
                environment.vsphere.selected ||
                environment['vsphere-ova'].selected
              )
            }
          />
        </FormGroup>
      )}
      <FormGroup
        label={<Text component={TextVariants.small}>Other</Text>}
        data-testid="target-other"
      >
        {environment['guest-image'].authorized && (
          <Checkbox
            label="Virtualization - Guest image (.qcow2)"
            isChecked={environment['guest-image'].selected}
            onChange={(_event, checked) =>
              handleSetEnvironment('guest-image', checked)
            }
            aria-label="Virtualization guest image checkbox"
            id="checkbox-guest-image"
            name="Virtualization guest image"
            data-testid="checkbox-guest-image"
          />
        )}
        {environment['image-installer'].authorized && (
          <Checkbox
            label="Bare metal - Installer (.iso)"
            isChecked={environment['image-installer'].selected}
            onChange={(_event, checked) =>
              handleSetEnvironment('image-installer', checked)
            }
            aria-label="Bare metal installer checkbox"
            id="checkbox-image-installer"
            name="Bare metal installer"
            data-testid="checkbox-image-installer"
          />
        )}
        {environment['wsl'].authorized && isBeta() && (
          <Checkbox
            label="WSL - Windows Subsystem for Linux (.tar.gz)"
            isChecked={environment['wsl'].selected}
            onChange={(_event, checked) => handleSetEnvironment('wsl', checked)}
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

export default Environment;
