import { useEffect, useRef } from 'react';

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
  const defaultNameRef = useRef(generateDefaultName(distribution, arch));
  useEffect(() => {
    const defaultName = generateDefaultName(distribution, arch);

    if (!blueprintName || blueprintName === defaultNameRef.current) {
      dispatch(changeBlueprintName(defaultName));
      defaultNameRef.current = defaultName;
    }
  }, [dispatch, distribution, arch]);
};
