import React, { useEffect } from 'react';

import { FormSpy, useFormApi } from '@data-driven-forms/react-form-renderer';

import { useGetAWSSourcesQuery } from '../../../store/apiSlice';

const FieldListener = () => {
  // This listener synchronizes the value of the AWS account ID text field with the
  // value of the AWS source select field on the AWS target step.
  // Using a listener to set the value of one field according to the value of another
  // is a recommended pattern for Data Driven Forms:
  // https://www.data-driven-forms.org/examples/value-listener
  const { getState, change } = useFormApi();
  const awsSourcesSelect = getState().values['aws-sources-select'];
  const { data: awsSources } = useGetAWSSourcesQuery();

  useEffect(() => {
    if (awsSourcesSelect) {
      const awsAccountId = awsSources.find(
        (source) => source.id === getState()?.values?.['aws-sources-select']
      )?.account_id;

      change('aws-associated-account-id', awsAccountId);
    } else {
      change('aws-associated-account-id', undefined);
    }
  }, [awsSourcesSelect]);

  return null;
};

const FieldListenerWrapper = () => (
  <FormSpy subcription={{ values: true }}>{() => <FieldListener />}</FormSpy>
);

export default FieldListenerWrapper;
