import React from 'react';

import {useGetSourceUploadInfoQuery} from "../../../store/provisioningApi";

type AwsAccountIdProps = {
  sourceId: number
}

export const AwsAccountId = ({ sourceId }: AwsAccountIdProps) => {
  const { data } = useGetSourceUploadInfoQuery({ id: sourceId });
  return <>{data?.aws?.account_id}</>;
};
