import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { Distributions, ImageRequest } from '../../../store/imageBuilderApi';
import {
  changeBlueprintName,
  selectArchitecture,
  selectBlueprintName,
  selectDistribution,
} from '../../../store/wizardSlice';

const generateDefaultName = (
  distribution: Distributions,
  arch: ImageRequest['architecture']
) => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const dateTimeString = `${month}${day}${year}-${hours}${minutes}`;

  return `${distribution}-${arch}-${dateTimeString}`;
};

export const useGenerateDefaultName = () => {
  const dispatch = useAppDispatch();
  const blueprintName = useAppSelector(selectBlueprintName);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);

  useEffect(() => {
    if (!blueprintName) {
      dispatch(changeBlueprintName(generateDefaultName(distribution, arch)));
    }
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
