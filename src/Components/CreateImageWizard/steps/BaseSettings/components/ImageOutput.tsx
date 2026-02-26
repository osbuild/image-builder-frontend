import React, { useEffect } from 'react';

import { Title } from '@patternfly/react-core';

import ArchSelect from '../../ImageOutput/components/ArchSelect';
import ReleaseSelect from '../../ImageOutput/components/ReleaseSelect';
import TargetEnvironment from '../../ImageOutput/components/TargetEnvironment';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeBlueprintName,
  selectArchitecture,
  selectDistribution,
  selectIsCustomName,
} from '../../../../../store/wizardSlice';
import { generateDefaultName } from '../../../utilities/useGenerateDefaultName';

const ImageOutput = () => {
  const dispatch = useAppDispatch();
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const isCustomName = useAppSelector(selectIsCustomName);

  useEffect(() => {
    if (!isCustomName) {
      const defaultName = generateDefaultName(distribution, arch);
      dispatch(changeBlueprintName(defaultName));
    }
  }, [dispatch, distribution, arch, isCustomName]);

  return (
    <>
      <Title headingLevel='h2' size='lg'>
        Image output
      </Title>
      <ReleaseSelect />
      <ArchSelect />
      <TargetEnvironment />
    </>
  );
};

export default ImageOutput;
