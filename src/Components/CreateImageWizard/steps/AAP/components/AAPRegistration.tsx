import React from 'react';

import {
  Checkbox,
  DropEvent,
  FileUpload,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import { AAP_DOCS_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeAapCallbackUrl,
  changeAapHostConfigKey,
  changeAapTlsCertificateAuthority,
  changeAapTlsConfirmation,
  selectAapCallbackUrl,
  selectAapHostConfigKey,
  selectAapTlsCertificateAuthority,
  selectAapTlsConfirmation,
} from '../../../../../store/wizardSlice';
import { useAAPValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { validateMultipleCertificates } from '../../../validators';
import ManageButton from '../../Registration/components/ManageButton';

const AAPRegistration = () => {
  const dispatch = useAppDispatch();
  const callbackUrl = useAppSelector(selectAapCallbackUrl);
  const hostConfigKey = useAppSelector(selectAapHostConfigKey);
  const tlsCertificateAuthority = useAppSelector(
    selectAapTlsCertificateAuthority,
  );
  const tlsConfirmation = useAppSelector(selectAapTlsConfirmation);
  const [isRejected, setIsRejected] = React.useState(false);
  const stepValidation = useAAPValidation();

  const isHttpsUrl = callbackUrl?.toLowerCase().startsWith('https://') || false;
  const shouldShowCaInput = !isHttpsUrl || (isHttpsUrl && !tlsConfirmation);

  const validated = stepValidation.errors['certificate']
    ? 'error'
    : stepValidation.errors['certificate'] === undefined &&
        tlsCertificateAuthority &&
        validateMultipleCertificates(tlsCertificateAuthority).validCertificates
          .length > 0
      ? 'success'
      : 'default';

  const handleCallbackUrlChange = (value: string) => {
    dispatch(changeAapCallbackUrl(value));
  };

  const handleHostConfigKeyChange = (value: string) => {
    dispatch(changeAapHostConfigKey(value));
  };

  const handleClear = () => {
    dispatch(changeAapTlsCertificateAuthority(''));
  };

  const handleTextChange = (
    _event: React.ChangeEvent<HTMLTextAreaElement>,
    value: string,
  ) => {
    dispatch(changeAapTlsCertificateAuthority(value));
    setIsRejected(false);
  };

  const handleDataChange = (_: DropEvent, value: string) => {
    dispatch(changeAapTlsCertificateAuthority(value));
    setIsRejected(false);
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
      <FormGroup label='Ansible Callback URL' isRequired>
        <ValidatedInputAndTextArea
          value={callbackUrl || ''}
          onChange={(_event, value) => handleCallbackUrlChange(value.trim())}
          ariaLabel='ansible callback url'
          isRequired
          stepValidation={stepValidation}
          fieldName='callbackUrl'
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              To generate a callback URL from the Ansible Controller, follow the{' '}
              <ManageButton url={AAP_DOCS_URL} analyticsStepId='wizard-aap'>
                documentation
              </ManageButton>
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup label='Host Config Key' isRequired>
        <ValidatedInputAndTextArea
          value={hostConfigKey || ''}
          onChange={(_event, value) => handleHostConfigKeyChange(value.trim())}
          ariaLabel='host config key'
          isRequired
          stepValidation={stepValidation}
          fieldName='hostConfigKey'
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              To obtain a host config key from the Ansible Controller, follow
              the{' '}
              <ManageButton url={AAP_DOCS_URL} analyticsStepId='wizard-aap'>
                documentation
              </ManageButton>
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      {shouldShowCaInput && (
        <FormGroup label='Certificate authority (CA) for Ansible Controller'>
          <FileUpload
            id='aap-certificate-upload'
            type='text'
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
            browseButtonText='Upload'
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
              >
                {isRejected
                  ? 'Must be a .PEM/.CER/.CRT file'
                  : validated === 'error'
                    ? stepValidation.errors['certificate']
                    : validated === 'success'
                      ? 'Certificate was uploaded'
                      : 'Drag and drop a valid certificate file or upload one'}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                To upload the certificate file, follow the{' '}
                <ManageButton url={AAP_DOCS_URL} analyticsStepId='wizard-aap'>
                  documentation
                </ManageButton>
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      )}
      {isHttpsUrl && (
        <FormGroup>
          <Checkbox
            id='tls-confirmation-checkbox'
            label='Insecure'
            isChecked={tlsConfirmation || false}
            onChange={(_event, checked) => handleTlsConfirmationChange(checked)}
          />
          {stepValidation.errors['tlsConfirmation'] && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant='error'>
                  {stepValidation.errors['tlsConfirmation']}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      )}
    </>
  );
};

export default AAPRegistration;
