import CustomButtons from '../formComponents/CustomSubmitButtons';

export default {
    name: 'review',
    title: 'Review',
    buttons: CustomButtons,
    fields: [
        {
            name: 'review',
            component: 'review'
        }
    ]
};
