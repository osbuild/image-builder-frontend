import React from 'react';

import { componentMapper } from '@data-driven-forms/pf4-component-mapper';
import Pf4FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import Select from '@data-driven-forms/pf4-component-mapper/select';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import { Spinner } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import ActivationKeys from './formComponents/ActivationKeys';
import { AWSSourcesSelect } from './formComponents/AWSSourcesSelect';
import AzureAuthButton from './formComponents/AzureAuthButton';
import AzureResourceGroups from './formComponents/AzureResourceGroups';
import AzureSourcesSelect from './formComponents/AzureSourcesSelect';
import CentOSAcknowledgement from './formComponents/CentOSAcknowledgement';
import FieldListenerWrapper from './formComponents/FieldListener';
import FileSystemConfiguration from './formComponents/FileSystemConfiguration';
import GalleryLayout from './formComponents/GalleryLayout';
import ImageOutputReleaseSelect from './formComponents/ImageOutputReleaseSelect';
import {
  ContentSourcesPackages,
  RedHatPackages,
} from './formComponents/Packages';
import RadioWithPopover from './formComponents/RadioWithPopover';
import Registration from './formComponents/Registration';
import RegistrationKeyInformation from './formComponents/RegistrationKeyInformation';
import Repositories from './formComponents/Repositories';
import Review from './formComponents/ReviewStep';
import TargetEnvironment from './formComponents/TargetEnvironment';

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
          component: RedHatPackages,
          defaultArch,
        },
        'package-selector-content-sources': {
          component: ContentSourcesPackages,
        },
        'radio-popover': RadioWithPopover,
        'azure-auth-button': AzureAuthButton,
        'activation-keys': ActivationKeys,
        'activation-key-information': RegistrationKeyInformation,
        'file-system-configuration': FileSystemConfiguration,
        'image-output-release-select': ImageOutputReleaseSelect,
        'centos-acknowledgement': CentOSAcknowledgement,
        'repositories-table': Repositories,
        'aws-sources-select': AWSSourcesSelect,
        'azure-sources-select': AzureSourcesSelect,
        'azure-resource-groups': AzureResourceGroups,
        'gallery-layout': GalleryLayout,
        'field-listener': FieldListenerWrapper,
        registration: Registration,
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
