import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import Pf4FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import Wizard from '@data-driven-forms/pf4-component-mapper/wizard';
import TextField from '@data-driven-forms/pf4-component-mapper/text-field';
import { Spinner } from '@patternfly/react-core';
import PropTypes from 'prop-types';

const CreateImageWizard = ({ schema, onSubmit, onClose }) => {
    return schema ? <FormRenderer
        schema={ schema }
        subscription={ { values: true } }
        FormTemplate={ (props) => <Pf4FormTemplate { ...props } showFormControls={ false } /> }
        onSubmit={ (formValues) => onSubmit(formValues) }
        componentMapper={ {
            [componentTypes.WIZARD]: {
                component: Wizard,
                'data-ouia-component-id': 'image-creation-wizard'
            },
            [componentTypes.TEXT_FIELD]: TextField
        } }
        onCancel={ onClose } /> : <Spinner />;
};

CreateImageWizard.propTypes = {
    schema: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CreateImageWizard;
