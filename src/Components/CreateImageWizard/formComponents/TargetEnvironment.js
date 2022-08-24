import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import {
  Checkbox,
  FormGroup,
  Text,
  TextVariants,
  Tile,
} from '@patternfly/react-core';

const TargetEnvironment = ({ label, isRequired, ...props }) => {
  const { getState, change } = useFormApi();
  const { input } = useFieldApi({ label, isRequired, ...props });
  const [environment, setEnvironment] = useState({
    aws: false,
    azure: false,
    gcp: false,
    vsphere: false,
    'guest-image': false,
    'image-installer': false,
  });

  useEffect(() => {
    if (getState()?.values?.[input.name]) {
      setEnvironment(getState().values[input.name]);
    }
  }, []);

  const handleSetEnvironment = (env) =>
    setEnvironment((prevEnv) => {
      const newEnv = {
        ...prevEnv,
        [env]: !prevEnv[env],
      };
      change(input.name, newEnv);
      return newEnv;
    });

  const handleKeyDown = (e, env) => {
    if (e.key === ' ') {
      handleSetEnvironment(env);
    }
  };

  return (
    <>
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
            <Tile
              className="tile pf-u-mr-sm"
              data-testid="upload-aws"
              title="Amazon Web Services"
              icon={
                <img
                  className="provider-icon"
                  src={'/apps/frontend-assets/partners-icons/aws.svg'}
                />
              }
              onClick={() => handleSetEnvironment('aws')}
              onKeyDown={(e) => handleKeyDown(e, 'aws')}
              isSelected={environment.aws}
              isStacked
              isDisplayLarge
            />
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
                />
              }
              onClick={() => handleSetEnvironment('gcp')}
              isSelected={environment.gcp}
              onKeyDown={(e) => handleKeyDown(e, 'gcp')}
              isStacked
              isDisplayLarge
            />
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
                />
              }
              onClick={() => handleSetEnvironment('azure')}
              onKeyDown={(e) => handleKeyDown(e, 'azure')}
              isSelected={environment.azure}
              isStacked
              isDisplayLarge
            />
          </div>
        </FormGroup>
        <FormGroup
          label={<Text component={TextVariants.small}>Private cloud</Text>}
          data-testid="target-private"
        >
          <Checkbox
            label="VMWare (.vmdk)"
            isChecked={environment.vsphere}
            onChange={() => handleSetEnvironment('vsphere')}
            aria-label="VMWare checkbox"
            id="checkbox-vmware"
            name="VMWare"
            data-testid="checkbox-vmware"
          />
        </FormGroup>
        <FormGroup
          label={<Text component={TextVariants.small}>Other</Text>}
          data-testid="target-other"
        >
          <Checkbox
            label="Virtualization - Guest image (.qcow2)"
            isChecked={environment['guest-image']}
            onChange={() => handleSetEnvironment('guest-image')}
            aria-label="Virtualization guest image checkbox"
            id="checkbox-guest-image"
            name="Virtualization guest image"
            data-testid="checkbox-guest-image"
          />
          <Checkbox
            label="Bare metal - Installer (.iso)"
            isChecked={environment['image-installer']}
            onChange={() => handleSetEnvironment('image-installer')}
            aria-label="Bare metal installer checkbox"
            id="checkbox-image-installer"
            name="Bare metal installer"
            data-testid="checkbox-image-installer"
          />
        </FormGroup>
      </FormGroup>
    </>
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
