import React, { useState } from 'react';

import {
  Button,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  useWizardContext,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import {
  EnvironmentStateType,
  filterEnvironment,
  hasUserSelectedAtLeastOneEnv,
  useGetAllowedTargets,
} from './steps/ImageOutput/Environment';
import ImageOutputStep from './steps/ImageOutput/ImageOutput';

import { RHEL_9, X86_64 } from '../../constants';
import './CreateImageWizard.scss';
import { ArchitectureItem, Distributions } from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

/**
 * @return true if the array in prevAllowedTargets is equivalent to the array
 * allowedTargets, false otherwise
 */
const isIdenticalToPrev = (
  prevAllowedTargets: string[],
  allowedTargets: string[]
) => {
  let identicalToPrev = true;
  if (allowedTargets.length === prevAllowedTargets.length) {
    allowedTargets.forEach((elem) => {
      if (!prevAllowedTargets.includes(elem)) {
        identicalToPrev = false;
      }
    });
  } else {
    identicalToPrev = false;
  }
  return identicalToPrev;
};

type CustomWizardFooterPropType = {
  isNextDisabled: boolean;
};
/**
 * The custom wizard footer is only switching the order of the buttons compared
 * to the default wizard footer from the PF5 library.
 */
const CustomWizardFooter = ({ isNextDisabled }: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, close } = useWizardContext();
  return (
    <WizardFooterWrapper>
      <Button
        variant="primary"
        onClick={goToNextStep}
        isDisabled={isNextDisabled}
      >
        Next
      </Button>
      <Button variant="secondary" onClick={goToPrevStep}>
        Back
      </Button>
      <Button variant="link" onClick={close}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

const CreateImageWizard = () => {
  const navigate = useNavigate();
  // Image output step states
  const [release, setRelease] = useState<Distributions>(RHEL_9);
  const [arch, setArch] = useState<ArchitectureItem['arch']>(X86_64);
  const {
    data: allowedTargets,
    isFetching,
    isSuccess,
    isError,
  } = useGetAllowedTargets({
    architecture: arch,
    release: release,
  });
  const [environment, setEnvironment] = useState<EnvironmentStateType>(
    filterEnvironment(
      {
        aws: { selected: false, authorized: false },
        azure: { selected: false, authorized: false },
        gcp: { selected: false, authorized: false },
        oci: { selected: false, authorized: false },
        'vsphere-ova': { selected: false, authorized: false },
        vsphere: { selected: false, authorized: false },
        'guest-image': { selected: false, authorized: false },
        'image-installer': { selected: false, authorized: false },
        wsl: { selected: false, authorized: false },
      },
      allowedTargets
    )
  );
  // Update of the environment when the architecture and release are changed.
  // This pattern prevents the usage of a useEffect See https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevAllowedTargets, setPrevAllowedTargets] = useState(allowedTargets);
  if (!isIdenticalToPrev(prevAllowedTargets, allowedTargets)) {
    setPrevAllowedTargets(allowedTargets);
    setEnvironment(filterEnvironment(environment, allowedTargets));
  }
  return (
    <>
      <ImageBuilderHeader />
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <Wizard onClose={() => navigate(resolveRelPath(''))} isVisitRequired>
          <WizardStep
            name="Image output"
            id="step-image-output"
            footer={
              <CustomWizardFooter
                isNextDisabled={!hasUserSelectedAtLeastOneEnv(environment)}
              />
            }
          >
            <ImageOutputStep
              release={release}
              setRelease={setRelease}
              arch={arch}
              setArch={setArch}
              environment={environment}
              setEnvironment={setEnvironment}
              isFetching={isFetching}
              isError={isError}
              isSuccess={isSuccess}
            />
          </WizardStep>
        </Wizard>
      </section>
    </>
  );
};

export default CreateImageWizard;
