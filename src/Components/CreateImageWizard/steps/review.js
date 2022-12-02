import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

export default {
  StepTemplate,
  id: 'wizard-review',
  name: 'review',
  title: 'Review',
  buttons: CustomButtons,
  fields: [
    {
      name: 'review',
      component: 'review',
    },
  ],
};
