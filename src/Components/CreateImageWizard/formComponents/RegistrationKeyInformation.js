import React from 'react';

import { FormSpy } from '@data-driven-forms/react-form-renderer';
import { FormGroup } from '@patternfly/react-core';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import ActivationKeyInformation from './ActivationKeyInformation';

const RegistrationKeyInformation = ({ label, valueReference }) => {
  return (
    <FormSpy>
      {({ values }) =>
        isEmpty(values[valueReference]) ? null : (
          <FormGroup label={label}>
            <ActivationKeyInformation />
          </FormGroup>
        )
      }
    </FormSpy>
  );
};

RegistrationKeyInformation.propTypes = {
  label: PropTypes.node,
  valueReference: PropTypes.node,
};

export default RegistrationKeyInformation;
