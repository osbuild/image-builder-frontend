import CustomButtons from '../formComponents/CustomSubmitButtons';

export default {
    name: 'review',
    title: 'Review',
    // eslint-disable-next-line react/display-name
    buttons: CustomButtons,
    fields: [
        {
            name: 'review',
            component: 'review'
        }
    ]
};
