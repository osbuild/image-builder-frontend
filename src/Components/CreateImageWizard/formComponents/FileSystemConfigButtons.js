import React, { useContext, useEffect, useState } from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import { Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { imageBuilderApi } from '../../../store/imageBuilderApi';

// FileSystemconfigButtons are defined separately to display errors inside of the button footer
const FileSystemConfigButtons = ({ handleNext, handlePrev, nextStep }) => {
  const { currentStep, formOptions } = useContext(WizardContext);
  const { change, getState } = useFormApi();
  const [hasErrors, setHasErrors] = useState(
    getState()?.errors?.['file-system-configuration'] ? true : false
  );
  const [nextHasBeenClicked, setNextHasBeenClicked] = useState(false);
  const prefetchArchitectures = imageBuilderApi.usePrefetch('getArchitectures');

  const errors = getState()?.errors?.['file-system-configuration'];

  useEffect(() => {
    errors ? setHasErrors(true) : setHasErrors(false);

    if (!errors) {
      setNextHasBeenClicked(false);
      change('file-system-config-show-errors', false);
    }
  }, [errors, change]);

  const handleClick = () => {
    if (!hasErrors) {
      handleNext(nextStep);
    }

    setNextHasBeenClicked(true);
    change('file-system-config-show-errors', true);
  };

  const handleMouseEnter = () => {
    const distribution = getState()?.values?.release;
    prefetchArchitectures({ distribution });
  };

  return (
    <>
      <Button
        id={`${currentStep.id}-next-button`}
        variant="primary"
        type="button"
        isDisabled={hasErrors && nextHasBeenClicked}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        Next
      </Button>
      <Button
        id={`${currentStep.id}-previous-button`}
        variant="secondary"
        type="button"
        onClick={handlePrev}
      >
        Back
      </Button>
      <div className="pf-c-wizard__footer-cancel">
        <Button
          id={`${currentStep.id}-cancel-button`}
          type="button"
          variant="link"
          onClick={formOptions.onCancel}
        >
          Cancel
        </Button>
      </div>
    </>
  );
};

FileSystemConfigButtons.propTypes = {
  handleNext: PropTypes.func,
  handlePrev: PropTypes.func,
  nextStep: PropTypes.string,
};

export default FileSystemConfigButtons;
