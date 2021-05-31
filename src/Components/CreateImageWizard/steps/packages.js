import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

export default {
    title: 'Packages',
    name: 'packages',
    nextStep: 'review',
    fields: [
        {
            component: componentTypes.TEXT_FIELD,
            name: 'packages-field',
            type: 'text',
            label: 'Role name',
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
                {
                    type: validatorTypes.MAX_LENGTH,
                    threshold: 150,
                },
            ],
        }
    ]
};
