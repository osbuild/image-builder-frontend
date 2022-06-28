import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import Pf4FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import { componentMapper } from '@data-driven-forms/pf4-component-mapper';
import { Spinner } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import Review from './formComponents/ReviewStep';
import TargetEnvironment from './formComponents/TargetEnvironment';
import Packages from './formComponents/Packages';
import RadioWithPopover from './formComponents/RadioWithPopover';
import AzureAuthButton from './formComponents/AzureAuthButton';
import AzureAuthExpandable from './formComponents/AzureAuthExpandable';
import ActivationKeys from './formComponents/ActivationKeys';
import Select from '@data-driven-forms/pf4-component-mapper/select';
import FileSystemConfiguration from './formComponents/FileSystemConfiguration';
import FileSystemConfigToggle from './formComponents/FileSystemConfigToggle';
import ImageOutputReleaseSelect from './formComponents/ImageOutputReleaseSelect';
import CentOSAcknowledgement from './formComponents/CentOSAcknowledgement';

const ImageCreator = ({
  schema,
  onSubmit,
  onClose,
  customComponentMapper,
  customValidatorMapper,
  defaultArch,
  className,
  ...props
}) => {
  return schema ? (
    <FormRenderer
      initialValues={props.initialValues}
      schema={schema}
      className={`image-builder${className ? ` ${className}` : ''}`}
      subscription={{ values: true }}
      FormTemplate={(props) => (
        <Pf4FormTemplate {...props} showFormControls={false} />
      )}
      onSubmit={(formValues) => onSubmit(formValues)}
      validatorMapper={{ ...customValidatorMapper }}
      componentMapper={{
        ...componentMapper,
        review: Review,
        output: TargetEnvironment,
        select: Select,
        'package-selector': {
          component: Packages,
          defaultArch,
        },
        'radio-popover': RadioWithPopover,
        'azure-auth-expandable': AzureAuthExpandable,
        'azure-auth-button': AzureAuthButton,
        'activation-keys': ActivationKeys,
        'file-system-config-toggle': FileSystemConfigToggle,
        'file-system-configuration': FileSystemConfiguration,
        'image-output-release-select': ImageOutputReleaseSelect,
        'centos-acknowledgement': CentOSAcknowledgement,
        ...customComponentMapper,
      }}
      onCancel={onClose}
      {...props}
    />
  ) : (
    <Spinner />
  );
};

ImageCreator.propTypes = {
  schema: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  customComponentMapper: PropTypes.shape({
    [PropTypes.string]: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.shape({
        component: PropTypes.node,
      }),
    ]),
  }),
  customValidatorMapper: PropTypes.shape({
    [PropTypes.string]: PropTypes.func,
  }),
  defaultArch: PropTypes.string,
  className: PropTypes.string,
  initialValues: PropTypes.object,
};

export default ImageCreator;
