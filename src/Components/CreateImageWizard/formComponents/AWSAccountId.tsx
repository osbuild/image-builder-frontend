import {useGetSourceDetailQuery} from "../../../store/apiSlice";

type AWSAccountIdProps = {
  sourceId: string
}

export const AWSAccountId = ({ sourceId }: AWSAccountIdProps) => {
  const { data } = useGetSourceDetailQuery(sourceId);
  return <>{data?.aws?.account_id}</>;
};
