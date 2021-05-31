import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import nextStepMapper from './stepMapper';

export const releaseValues = {
    'rhel-8': 'Red Hat Enterprise Linux (RHEL) 8.3',
    'centos-8': 'CentOS Stream 8'
};

export default {
    title: 'Image output',
    name: 'image-output',
    nextStep: ({ values }) => nextStepMapper(values),
    fields: [
        {
            component: componentTypes.SELECT,
            label: 'Release',
            name: 'release',
            simpleValue: true,
            initialValue: 'rhel-8',
            options: Object.entries(releaseValues).map(([ key, title ]) => ({
                label: title,
                value: key
            })),
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED
                }
            ],
        },
        {
            component: 'output',
            name: 'target-environment',
            label: 'Select target environment',
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED
                }
            ],
        }
    ]
};
