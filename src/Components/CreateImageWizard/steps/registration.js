import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

export const registerValues = {
    'subscribe-now-radio': {
        title: 'Embed an activation key and register systems on first boot',
        testId: 'register-now-radio-button'
    },
    'register-later-radio-button': {
        title: 'Register the system later',
        testId: 'register-later-radio-button'
    }
};

export default (user) => ({
    title: 'Registration',
    name: 'registration',
    nextStep: 'packages',
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'register-explanation',
            label: 'Register your system with subscription manager (RHSM) and insights when the image first boots.'
        },
        {
            component: componentTypes.RADIO,
            label: 'Register the system',
            name: 'register-system',
            initialValue: 'register-later-radio-button',
            options: Object.entries(registerValues).map(([ key, { title, testId }]) => ({
                label: title,
                value: key,
                'data-testid': testId,
            }))
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'subscription-organization',
            type: 'text',
            'data-testid': 'organization-id',
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
            'data-testid': 'subscription-activation',
            required: true,
            type: 'text',
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
