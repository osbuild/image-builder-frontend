import React from 'react';

import {
  DropEvent,
  FormGroup,
  FileUpload,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Checkbox,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  selectAapControllerUrl,
  selectAapJobTemplateId,
  selectAapHostConfigKey,
  selectAapTlsCertificateAuthority,
  selectAapTlsConfirmation,
  changeAapControllerUrl,
  changeAapJobTemplateId,
  changeAapHostConfigKey,
  changeAapTlsCertificateAuthority,
  changeAapTlsConfirmation,
} from '../../../../../store/wizardSlice';
import { useAAPValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { validateMultipleCertificates } from '../../../validators';

const AAPRegistration = () => {
  const dispatch = useAppDispatch();
  const controllerUrl = useAppSelector(selectAapControllerUrl);
  const jobTemplateId = useAppSelector(selectAapJobTemplateId);
  const hostConfigKey = useAppSelector(selectAapHostConfigKey);
  const tlsCertificateAuthority = useAppSelector(
    selectAapTlsCertificateAuthority
  );
  const tlsConfirmation = useAppSelector(selectAapTlsConfirmation);
  const [isRejected, setIsRejected] = React.useState(false);
  const stepValidation = useAAPValidation();

  const isHttpsUrl =
    controllerUrl?.toLowerCase().startsWith('https://') || false;
  const shouldShowCaInput = !isHttpsUrl || (isHttpsUrl && !tlsConfirmation);

  const validated = stepValidation.errors['certificate']
    ? 'error'
    : stepValidation.errors['certificate'] === undefined &&
      tlsCertificateAuthority &&
      validateMultipleCertificates(tlsCertificateAuthority).validCertificates
        .length > 0
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

  const handleTlsConfirmationChange = (checked: boolean) => {
    dispatch(changeAapTlsConfirmation(checked));
  };

  return (
    <>
      <FormGroup label="Ansible Controller URL" isRequired>
        <ValidatedInputAndTextArea
          value={controllerUrl || ''}
          onChange={(_event, value) => handleControllerUrlChange(value.trim())}
          ariaLabel="ansible controller url"
          isRequired
          stepValidation={stepValidation}
          fieldName="controllerUrl"
          placeholder=""
        />
      </FormGroup>
      {isHttpsUrl && (
        <FormGroup>
          <Checkbox
            id="tls-confirmation-checkbox"
            label="This HTTPS URL does not require a custom TLS certificate"
            isChecked={tlsConfirmation || false}
            onChange={(_event, checked) => handleTlsConfirmationChange(checked)}
          />
          {stepValidation.errors['tlsConfirmation'] && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant="error">
                  {stepValidation.errors['tlsConfirmation']}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      )}
      <FormGroup label="Job Template ID" isRequired>
        <ValidatedInputAndTextArea
          value={jobTemplateId || ''}
          onChange={(_event, value) => handleJobTemplateIdChange(value.trim())}
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
          onChange={(_event, value) => handleHostConfigKeyChange(value.trim())}
          ariaLabel="host config key"
          isRequired
          stepValidation={stepValidation}
          fieldName=""
          placeholder=""
        />
      </FormGroup>

      {shouldShowCaInput && (
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
                // hasIcon
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
      )}
    </>
  );
};

export default AAPRegistration;
