import React, { useContext, useEffect, useState } from 'react';
import { useFormApi } from '@data-driven-forms/react-form-renderer';
import { Button } from '@patternfly/react-core';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import PropTypes from 'prop-types';

const FileSystemConfigButtons = ({ nextStep }) => {
  const { handleNext, handlePrev, formOptions } = useContext(WizardContext);
  const { change, getState } = useFormApi();
  const [hasErrors, setHasErrors] = useState(
    getState()?.errors?.['file-system-configuration'] ? true : false
  );
  const [nextHasBeenClicked, setNextHasBeenClicked] = useState(false);

  useEffect(() => {
    const errors = getState()?.errors?.['file-system-configuration'];
    errors ? setHasErrors(true) : setHasErrors(false);

    if (!errors) {
      setNextHasBeenClicked(false);
      change('file-system-config-show-errors', false);
    }
  });

  const handleClick = () => {
    if (!hasErrors) {
      return handleNext(nextStep);
    }

    setNextHasBeenClicked(true);
    change('file-system-config-show-errors', true);
  };

  return (
    <>
      <Button
        variant="primary"
        isDisabled={hasErrors && nextHasBeenClicked}
        onClick={handleClick}
      >
        Next
      </Button>
      <Button variant="secondary" onClick={handlePrev}>
        Back
      </Button>
      <div className="pf-c-wizard__footer-cancel">
        <Button type="button" variant="link" onClick={formOptions.onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
};

FileSystemConfigButtons.propTypes = {
  nextStep: PropTypes.string,
};

export default FileSystemConfigButtons;
