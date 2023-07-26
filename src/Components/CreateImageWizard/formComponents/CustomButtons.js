import React, { useContext, useState } from 'react';

import { FormSpy, useFormApi } from '@data-driven-forms/react-form-renderer';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import { Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { usePrefetch } from '../../../store/apiSlice';
import { rhsmApi } from '../../../store/rhsmApi';
import { releaseToVersion } from '../../../Utilities/releaseToVersion';

const CustomButtons = ({
  buttonLabels: { cancel, next, submit, back },
  handleNext,
  handlePrev,
  nextStep,
}) => {
  const { getState } = useFormApi();
  const [isSaving, setIsSaving] = useState(false);
  const { currentStep, formOptions } = useContext(WizardContext);
  const prefetchActivationKeys = rhsmApi.usePrefetch('listActivationKeys');
  const prefetchRepositories = usePrefetch('getRepositories');

  const onNextOrSubmit = () => {
    if (currentStep.id === 'wizard-review') {
      formOptions.onSubmit({
        values: formOptions.getState().values,
        setIsSaving,
      });
    } else {
      if (typeof nextStep === 'function') {
        handleNext(nextStep({ values: formOptions.getState().values }));
      } else {
        handleNext(nextStep);
      }
    }
  };

  const onMouseEnter = () => {
    if (currentStep.id === 'wizard-imageoutput') {
      prefetchActivationKeys();
    }
    if (currentStep.id === 'wizard-systemconfiguration-packages') {
      const release = getState().values?.release;
      const version = releaseToVersion(release);
      prefetchRepositories({
        available_for_arch: 'x86_64',
        available_for_version: version,
      });
    }
  };

  return (
    <FormSpy>
      {() => (
        <React.Fragment>
          <Button
            id={`${currentStep.id}-next-button`}
            variant="primary"
            type="button"
            isDisabled={
              !formOptions.valid ||
              formOptions.getState().validating ||
              isSaving
            }
            isLoading={currentStep.id === 'wizard-review' ? isSaving : null}
            onClick={onNextOrSubmit}
            onMouseEnter={onMouseEnter}
          >
            {currentStep.id === 'wizard-review'
              ? isSaving
                ? 'Creating image'
                : submit
              : next}
          </Button>
          <Button
            id={`${currentStep.id}-previous-button`}
            type="button"
            variant="secondary"
            onClick={handlePrev}
            isDisabled={isSaving}
          >
            {back}
          </Button>
          <div className="pf-c-wizard__footer-cancel">
            <Button
              id={`${currentStep.id}-cancel-button`}
              type="button"
              variant="link"
              onClick={formOptions.onCancel}
              isDisabled={isSaving}
            >
              {cancel}
            </Button>
          </div>
        </React.Fragment>
      )}
    </FormSpy>
  );
};

CustomButtons.propTypes = {
  buttonLabels: PropTypes.shape({
    cancel: PropTypes.node,
    submit: PropTypes.node,
    back: PropTypes.node,
    next: PropTypes.node,
  }),
  handleNext: PropTypes.func,
  handlePrev: PropTypes.func,
  nextStep: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  isSaving: PropTypes.bool,
};

export default CustomButtons;
