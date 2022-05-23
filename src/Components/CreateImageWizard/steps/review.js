import CustomButtons from '../formComponents/CustomSubmitButtons';
import StepTemplate from './stepTemplate';

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
