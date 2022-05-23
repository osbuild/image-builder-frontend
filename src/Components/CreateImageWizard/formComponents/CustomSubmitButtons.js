import React, { useContext, useState } from 'react';
import { Button } from '@patternfly/react-core';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import PropTypes from 'prop-types';

const CustomButtons = ({ buttonLabels: { cancel, submit, back } }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { handlePrev, formOptions } = useContext(WizardContext);
  return (
    <FormSpy>
      {() => (
        <React.Fragment>
          <Button
            variant="primary"
            type="button"
            isDisabled={
              !formOptions.valid ||
              formOptions.getState().validating ||
              isSaving
            }
            isLoading={isSaving}
            onClick={() => {
              formOptions.onSubmit({
                values: formOptions.getState().values,
                setIsSaving,
              });
            }}
          >
            {isSaving ? 'Creating image' : submit}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrev}
            isDisabled={isSaving}
          >
            {back}
          </Button>
          <div className="pf-c-wizard__footer-cancel">
            <Button
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
  }),
  isSaving: PropTypes.bool,
};

export default CustomButtons;
