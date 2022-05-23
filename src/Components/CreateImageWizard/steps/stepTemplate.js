import React from 'react';
import PropTypes from 'prop-types';
import { Title } from '@patternfly/react-core';

const StepTemplate = ({
  id,
  formFields,
  formRef,
  title,
  customTitle,
  showTitle,
  showTitles,
}) => (
  <div id={id} ref={formRef} className="pf-c-form">
    {((showTitles && showTitle !== false) || showTitle) &&
      (customTitle ? (
        customTitle
      ) : (
        <Title headingLevel="h1" size="xl">
          {title}
        </Title>
      ))}
    {formFields}
  </div>
);

StepTemplate.propTypes = {
  id: PropTypes.string,
  title: PropTypes.node,
  customTitle: PropTypes.node,
  formFields: PropTypes.array.isRequired,
  formOptions: PropTypes.shape({
    renderForm: PropTypes.func.isRequired,
  }).isRequired,
  showTitles: PropTypes.bool,
  showTitle: PropTypes.bool,
  formRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

export default StepTemplate;
