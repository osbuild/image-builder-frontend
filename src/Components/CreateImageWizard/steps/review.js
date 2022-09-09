import StepTemplate from './stepTemplate';
import CustomButtons from '../formComponents/CustomSubmitButtons';

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
