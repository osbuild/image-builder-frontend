import React, { useEffect, useState } from 'react';

import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Alert,
  Bullseye,
  Checkbox,
  FormGroup,
  Popover,
  Radio,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Tile,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import { useField } from 'react-final-form';

import { useGetArchitecturesQuery } from '../../../store/imageBuilderApi';
import { provisioningApi } from '../../../store/provisioningApi';
import { useGetEnvironment } from '../../../Utilities/useGetEnvironment';

const useGetAllowedTargets = ({ architecture, release }) => {
  const { data, isFetching, isSuccess, isError } = useGetArchitecturesQuery({
    distribution: release,
  });

  let image_types = [];
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

const TargetEnvironment = ({ label, isRequired, ...props }) => {
  const { getState, change } = useFormApi();
  const { input } = useFieldApi({ label, isRequired, ...props });
  const [environment, setEnvironment] = useState({
    aws: false,
    azure: false,
    gcp: false,
    oci: false,
    'vsphere-ova': false,
    vsphere: false,
    'guest-image': false,
    'image-installer': false,
    wsl: false,
  });
  const prefetchSources = provisioningApi.usePrefetch('getSourceList');
  const { isBeta } = useGetEnvironment();
  const release = getState()?.values?.release;

  useEffect(() => {
    if (getState()?.values?.[input.name]) {
      setEnvironment(getState().values[input.name]);
    }
  }, []);

  const handleSetEnvironment = (env, checked) =>
    setEnvironment((prevEnv) => {
      const newEnv = {
        ...prevEnv,
        [env]: checked,
      };
      change(input.name, newEnv);
      return newEnv;
    });

  const handleKeyDown = (e, env, checked) => {
    if (e.key === ' ') {
      handleSetEnvironment(env, checked);
    }
  };

  // Load all the allowed targets from the backend
  const architecture = useField('arch').input.value;

  const {
    data: allowedTargets,
    isFetching,
    isSuccess,
    isError,
  } = useGetAllowedTargets({
    architecture: architecture,
    release: release,
  });

  if (isFetching) {
    return (
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    );
  }

  if (isError || !isSuccess) {
    return (
      <Alert
        variant={'danger'}
        isPlain
        isInline
        title={'Allowed targets unavailable'}
      >
        Allowed targets cannot be reached, try again later.
      </Alert>
    );
  }

  // If the user already made a choice for some targets but then changes their
  // architecture or distribution, only keep the target choices that are still
  // compatible.
  const allTargets = [
    'aws',
    'gcp',
    'azure',
    'vsphere',
    'vsphere-ova',
    'guest-image',
    'image-installer',
    'wsl',
  ];
  allTargets.forEach((target) => {
    if (environment[target] && !allowedTargets.includes(target)) {
      handleSetEnvironment(target, false);
    }
  });

  // each item the user can select is depending on what's compatible with the
  // architecture and the distribution they previously selected
  return (
    <FormGroup
      isRequired={isRequired}
      label={label}
      data-testid="target-select"
    >
      <FormGroup
        label={<Text component={TextVariants.small}>Public cloud</Text>}
        data-testid="target-public"
      >
        <div className="tiles">
          {allowedTargets.includes('aws') && (
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
              onClick={() => handleSetEnvironment('aws', !environment.aws)}
              onKeyDown={(e) => handleKeyDown(e, 'aws', !environment.aws)}
              onMouseEnter={() => prefetchSources({ provider: 'aws' })}
              isSelected={environment.aws}
              isStacked
              isDisplayLarge
            />
          )}
          {allowedTargets.includes('gcp') && (
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
              onClick={() => handleSetEnvironment('gcp', !environment.gcp)}
              isSelected={environment.gcp}
              onKeyDown={(e) => handleKeyDown(e, 'gcp', !environment.gcp)}
              onMouseEnter={() => prefetchSources({ provider: 'gcp' })}
              isStacked
              isDisplayLarge
            />
          )}
          {allowedTargets.includes('azure') && (
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
              onClick={() => handleSetEnvironment('azure', !environment.azure)}
              onKeyDown={(e) => handleKeyDown(e, 'azure', !environment.azure)}
              onMouseEnter={() => prefetchSources({ provider: 'azure' })}
              isSelected={environment.azure}
              isStacked
              isDisplayLarge
            />
          )}
          {allowedTargets.includes('oci') && isBeta() && (
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
              onClick={() => handleSetEnvironment('oci', !environment.oci)}
              onKeyDown={(e) => handleKeyDown(e, 'oci', !environment.oci)}
              isSelected={environment.oci}
              isStacked
              isDisplayLarge
            />
          )}
        </div>
      </FormGroup>
      {allowedTargets.includes('vsphere') && (
        <FormGroup
          label={<Text component={TextVariants.small}>Private cloud</Text>}
          className="pf-u-mt-sm"
          data-testid="target-private"
        >
          <Checkbox
            label="VMWare vSphere"
            isChecked={environment.vsphere || environment['vsphere-ova']}
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
      {allowedTargets.includes('vsphere') && (
        <FormGroup
          className="pf-u-mt-sm pf-u-mb-sm pf-u-ml-xl"
          data-testid="target-private-vsphere-radio"
        >
          {allowedTargets.includes('vsphere-ova') && (
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
              isChecked={environment['vsphere-ova']}
              isDisabled={!(environment.vsphere || environment['vsphere-ova'])}
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
            isChecked={environment.vsphere}
            isDisabled={!(environment.vsphere || environment['vsphere-ova'])}
          />
        </FormGroup>
      )}
      <FormGroup
        label={<Text component={TextVariants.small}>Other</Text>}
        data-testid="target-other"
      >
        {allowedTargets.includes('guest-image') && (
          <Checkbox
            label="Virtualization - Guest image (.qcow2)"
            isChecked={environment['guest-image']}
            onChange={(_event, checked) =>
              handleSetEnvironment('guest-image', checked)
            }
            aria-label="Virtualization guest image checkbox"
            id="checkbox-guest-image"
            name="Virtualization guest image"
            data-testid="checkbox-guest-image"
          />
        )}
        {allowedTargets.includes('image-installer') && (
          <Checkbox
            label="Bare metal - Installer (.iso)"
            isChecked={environment['image-installer']}
            onChange={(_event, checked) =>
              handleSetEnvironment('image-installer', checked)
            }
            aria-label="Bare metal installer checkbox"
            id="checkbox-image-installer"
            name="Bare metal installer"
            data-testid="checkbox-image-installer"
          />
        )}
        {allowedTargets.includes('wsl') && isBeta && (
          <Checkbox
            label="WSL - Windows Subsystem for Linux (.tar.gz)"
            isChecked={environment['wsl']}
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

TargetEnvironment.propTypes = {
  label: PropTypes.node,
  isRequired: PropTypes.bool,
};

TargetEnvironment.defaultProps = {
  label: '',
  isRequired: false,
};

export default TargetEnvironment;
