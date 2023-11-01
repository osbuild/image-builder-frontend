import React, { useState } from 'react';

import {
  FormGroup,
  FormSelect,
  FormSelectOption,
  Wizard,
  WizardStep,
  Tile,
  TextInput,
} from '@patternfly/react-core';
import { Controller, useForm } from 'react-hook-form';

import { RELEASES } from '../../constants';

import './CreateImageWizard.scss';

const CreateImageWizard = () => {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      testInput: '',
      release: '',
      aws: false,
      azure: false,
      gcp: false,
    },
  });

  const onSubmit = (data: any) => console.log(data);

  return (
    <Wizard title="Basic wizard" onSave={handleSubmit(onSubmit)}>
      <WizardStep name="Step 1" id="basic-first-step">
        <>
          <h2>Image output</h2>
          <p>
            Image builder allows you to create a custom image and push it to
            target environments.
          </p>
          <FormGroup isRequired label="Release">
            <Controller
              name="release"
              control={control}
              render={({ field }) => (
                <FormSelect {...field}>
                  {RELEASES.map((release) => (
                    <FormSelectOption
                      key={release.value}
                      value={release.value}
                      label={release.label}
                    />
                  ))}
                </FormSelect>
              )}
            />
          </FormGroup>
          <FormGroup isRequired label="Select target environments">
            <Controller
              name="aws"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Tile
                  title="Amazon Web Services"
                  icon={
                    <img
                      className="provider-icon"
                      src={'/apps/frontend-assets/partners-icons/aws.svg'}
                      alt="Amazon Web Services logo"
                    />
                  }
                  isSelected={value}
                  onClick={() => onChange(!value)}
                  isStacked
                />
              )}
            />
            <Controller
              name="gcp"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Tile
                  title="Google Cloud Platform"
                  icon={
                    <img
                      className="provider-icon"
                      src={
                        '/apps/frontend-assets/partners-icons/google-cloud-short.svg'
                      }
                      alt="Google Cloud Platform logo"
                    />
                  }
                  isStacked
                  isSelected={value}
                  onClick={() => onChange(!value)}
                />
              )}
            />
            <Controller
              name="azure"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Tile
                  title="Microsoft Azure"
                  icon={
                    <img
                      className="provider-icon"
                      src={
                        '/apps/frontend-assets/partners-icons/microsoft-azure-short.svg'
                      }
                      alt="Microsoft Azure logo"
                    />
                  }
                  isStacked
                  isSelected={value}
                  onClick={() => onChange(!value)}
                />
              )}
            />
          </FormGroup>
          <TextInput
            {...register('testInput')}
            type="text"
            name="testInput"
            placeholder="test input"
          />
        </>
      </WizardStep>
    </Wizard>
  );
};

export default CreateImageWizard;
