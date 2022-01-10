import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import nextStepMapper from './imageOutputStepMapper';
import { RHEL_8 } from '../../../constants.js';

export const releaseValues = {
    [RHEL_8]: 'Red Hat Enterprise Linux (RHEL) 8',
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
            initialValue: RHEL_8,
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
            label: 'Select target environments',
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED
                }
            ],
        }
    ]
};
