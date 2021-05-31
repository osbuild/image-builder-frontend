import componentTypes from '@data-driven-forms/react-form-renderer/component-types';

export const registerValues = {
    'subscribe-now-radio': 'Embed an activation key and register systems on first boot',
    'register-later-radio-button': 'Register the system later'
};

export default {
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
        }
    ]
};
