import React, { useEffect } from 'react';

import { Title } from '@patternfly/react-core';

import ArchSelect from '../../ImageOutput/components/ArchSelect';
import ReleaseSelect from '../../ImageOutput/components/ReleaseSelect';
import TargetEnvironment from '../../ImageOutput/components/TargetEnvironment';
import { AwsConfig } from '../../TargetEnvironment/Aws';
import { AzureConfig } from '../../TargetEnvironment/Azure';
import { GcpConfig } from '../../TargetEnvironment/Gcp';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeBlueprintName,
  selectArchitecture,
  selectBlueprintName,
  selectDistribution,
  selectImageTypes,
  selectIsCustomName,
} from '../../../../../store/wizardSlice';
import { generateDefaultName } from '../../../utilities/useGenerateDefaultName';

const ImageOutput = () => {
  const dispatch = useAppDispatch();
  const blueprintName = useAppSelector(selectBlueprintName);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const isCustomName = useAppSelector(selectIsCustomName);
  const imageTypes = useAppSelector(selectImageTypes);

  useEffect(() => {
    const defaultName = generateDefaultName(distribution, arch);
    if (!isCustomName && blueprintName !== defaultName) {
      dispatch(changeBlueprintName(defaultName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, distribution, arch, isCustomName]);

  return (
    <>
      <Title headingLevel='h2' size='lg'>
        Image output
      </Title>
      <ReleaseSelect />
      <ArchSelect />
      <TargetEnvironment />
      {imageTypes.includes('aws') && <AwsConfig />}
      {imageTypes.includes('gcp') && <GcpConfig />}
      {imageTypes.includes('azure') && <AzureConfig />}
    </>
  );
};

export default ImageOutput;
