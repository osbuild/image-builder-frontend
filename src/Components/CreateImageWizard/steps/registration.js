import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

export const registerValues = {
    'subscribe-now-radio': 'Embed an activation key and register systems on first boot',
    'register-later-radio-button': 'Register the system later'
};

export default (user) => ({
    title: 'Registration',
    name: 'registration',
    nextStep: 'packages',
    fields: [
        {
            component: componentTypes.RADIO,
            label: 'Register the system',
            name: 'register-system',
            initialValue: 'register-later-radio-button',
            options: Object.entries(registerValues).map(([ key, title ]) => ({
                label: title,
                value: key
            }))
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'subscription-organization',
            type: 'text',
            label: 'Organization ID',
            initialValue: Number(user?.identity?.internal?.org_id),
            isDisabled: true,
            condition: {
                or: [
                    { when: 'register-system', is: 'subscribe-now-radio' },
                ]
            }
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'subscription-activation',
            type: 'password',
            label: 'Activation key',
            condition: {
                or: [
                    { when: 'register-system', is: 'subscribe-now-radio' },
                ]
            },
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
            ],
        }
    ]
});
