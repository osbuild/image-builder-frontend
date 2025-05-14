import React from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  DropEvent,
  FileUpload,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeAapControllerUrl,
  changeAapJobTemplateId,
  changeAapHostConfigKey,
  changeAapTlsCertificateAuthority,
  selectAapControllerUrl,
  selectAapJobTemplateId,
  selectAapHostConfigKey,
  selectAapTlsCertificateAuthority,
} from '../../../../store/wizardSlice';
import { useRegistrationValidation } from '../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../ValidatedInput';

const AAPRegistration = () => {
  const dispatch = useAppDispatch();
  const controllerUrl = useAppSelector(selectAapControllerUrl);
  const jobTemplateId = useAppSelector(selectAapJobTemplateId);
  const hostConfigKey = useAppSelector(selectAapHostConfigKey);
  const tlsCertificateAuthority = useAppSelector(
    selectAapTlsCertificateAuthority
  );
  const [isRejected, setIsRejected] = React.useState(false);
  const stepValidation = useRegistrationValidation();

  const validated = stepValidation.errors['certificate']
    ? 'error'
    : stepValidation.errors['certificate'] === undefined &&
      tlsCertificateAuthority
    ? 'success'
    : 'default';

  const handleControllerUrlChange = (value: string) => {
    dispatch(changeAapControllerUrl(value));
  };

  const handleJobTemplateIdChange = (value: string) => {
    dispatch(changeAapJobTemplateId(value));
  };

  const handleHostConfigKeyChange = (value: string) => {
    dispatch(changeAapHostConfigKey(value));
  };

  const handleClear = () => {
    dispatch(changeAapTlsCertificateAuthority(''));
  };

  const handleTextChange = (
    _event: React.ChangeEvent<HTMLTextAreaElement>,
    value: string
  ) => {
    dispatch(changeAapTlsCertificateAuthority(value));
  };

  const handleDataChange = (_: DropEvent, value: string) => {
    dispatch(changeAapTlsCertificateAuthority(value));
  };

  const handleFileRejected = () => {
    dispatch(changeAapTlsCertificateAuthority(''));
    setIsRejected(true);
  };

  return (
    <>
      <FormGroup label="Ansible Controller URL" isRequired>
        <ValidatedInputAndTextArea
          value={controllerUrl || ''}
          onChange={(_event, value) => handleControllerUrlChange(value)}
          ariaLabel="ansible controller url"
          isRequired
          stepValidation={stepValidation}
          fieldName="controllerUrl"
          placeholder=""
        />
      </FormGroup>
      <FormGroup label="Job Template ID" isRequired>
        <ValidatedInputAndTextArea
          value={jobTemplateId || ''}
          onChange={(_event, value) => handleJobTemplateIdChange(value)}
          ariaLabel="job template id"
          isRequired
          stepValidation={stepValidation}
          fieldName="jobTemplateId"
          placeholder=""
        />
      </FormGroup>
      <FormGroup label="Host Config Key" isRequired>
        <ValidatedInputAndTextArea
          value={hostConfigKey || ''}
          onChange={(_event, value) => handleHostConfigKeyChange(value)}
          ariaLabel="host config key"
          isRequired
          stepValidation={stepValidation}
          fieldName=""
          placeholder=""
        />
      </FormGroup>

      <FormGroup label="Certificate authority (CA) for Ansible Controller">
        <FileUpload
          id="aap-certificate-upload"
          type="text"
          value={tlsCertificateAuthority || ''}
          filename={tlsCertificateAuthority ? 'CA detected' : ''}
          onDataChange={handleDataChange}
          onTextChange={handleTextChange}
          onClearClick={handleClear}
          dropzoneProps={{
            accept: {
              'application/x-pem-file': ['.pem'],
              'application/x-x509-ca-cert': ['.cer', '.crt'],
              'application/pkix-cert': ['.der'],
            },
            maxSize: 512000,
            onDropRejected: handleFileRejected,
          }}
          validated={isRejected ? 'error' : validated}
          browseButtonText="Upload"
          allowEditingUploadedText={true}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={
                isRejected || validated === 'error'
                  ? 'error'
                  : validated === 'success'
                  ? 'success'
                  : 'default'
              }
              hasIcon
            >
              {isRejected
                ? 'Must be a .PEM/.CER/.CRT file no larger than 512 KB'
                : validated === 'error'
                ? stepValidation.errors['certificate']
                : validated === 'success'
                ? 'Certificate was uploaded'
                : 'Drag and drop a valid certificate file or upload one'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </>
  );
};

export default AAPRegistration;
