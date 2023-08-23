import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

const reviewStep = {
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

export default reviewStep;
