import React from 'react';

import {
  Checkbox,
  DropEvent,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import ExternalLinkButton from '@/Components/CreateImageWizard/utilities/ExternalLinkButton';
import {
  type StepValidation,
  useAAPValidation,
} from '@/Components/CreateImageWizard/utilities/useValidation';
import { ValidatedInputAndTextArea } from '@/Components/CreateImageWizard/ValidatedInput';
import { AAP_DOCS_URL } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAapCallbackUrl,
  changeAapHostConfigKey,
  changeAapTlsCertificateAuthority,
  changeAapTlsConfirmation,
  selectAapCallbackUrl,
  selectAapHostConfigKey,
  selectAapTlsCertificateAuthority,
  selectAapTlsConfirmation,
} from '@/store/slices/wizard';

const emptyValidation: StepValidation = { errors: {}, disabledNext: false };

// clear hostConfigKey when the user leaves the step if the callback URL is still empty.
function useClearHostConfigKeyOnUnmount(
  callbackUrl: string | undefined,
  hostConfigKey: string | undefined,
  dispatch: ReturnType<typeof useAppDispatch>,
) {
  const callbackUrlRef = React.useRef(callbackUrl);
  const hostConfigKeyRef = React.useRef(hostConfigKey);
  React.useEffect(() => {
    callbackUrlRef.current = callbackUrl;
    hostConfigKeyRef.current = hostConfigKey;
  }, [callbackUrl, hostConfigKey]);
  React.useEffect(() => {
    return () => {
      if (!callbackUrlRef.current && hostConfigKeyRef.current) {
        dispatch(changeAapHostConfigKey(undefined));
      }
    };
  }, [dispatch]);
}

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

  useClearHostConfigKeyOnUnmount(callbackUrl, hostConfigKey, dispatch);

  const [callbackUrlBlurred, setCallbackUrlBlurred] = React.useState(false);
  const callbackUrlValidation = React.useMemo(
    (): StepValidation =>
      callbackUrlBlurred && stepValidation.errors.callbackUrl
        ? {
            errors: { callbackUrl: stepValidation.errors.callbackUrl },
            disabledNext: stepValidation.disabledNext,
          }
        : emptyValidation,
    [callbackUrlBlurred, stepValidation],
  );

  const isHttpsUrl = callbackUrl?.toLowerCase().startsWith('https:') || false;
  const isHttpUrl =
    (callbackUrl?.toLowerCase().startsWith('http:') && !isHttpsUrl) || false;
  const shouldShowCaInput = !isHttpsUrl || !tlsConfirmation;

  const hasCertContent =
    !!tlsCertificateAuthority && tlsCertificateAuthority.trim() !== '';

  const validated: 'default' | 'success' | 'error' = hasCertContent
    ? stepValidation.errors.certificate
      ? 'error'
      : 'success'
    : 'default';

  const handleCallbackUrlChange = (value: string) => {
    dispatch(changeAapCallbackUrl(value));
    if (tlsConfirmation && !value.toLowerCase().startsWith('https:')) {
      dispatch(changeAapTlsConfirmation(false));
    }
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
    <Form className='pf-v6-u-pb-md'>
      <FormGroup
        label='Ansible Callback URL'
        isRequired
        className='pf-v6-u-w-50'
      >
        <div onBlur={() => setCallbackUrlBlurred(true)}>
          <ValidatedInputAndTextArea
            value={callbackUrl || ''}
            onChange={(_event, value) => handleCallbackUrlChange(value.trim())}
            ariaLabel='ansible callback url'
            isRequired
            stepValidation={callbackUrlValidation}
            fieldName='callbackUrl'
          />
        </div>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              To generate a callback URL from the Ansible Controller, follow the{' '}
              <ExternalLinkButton
                url={AAP_DOCS_URL}
                analyticsStepId='wizard-aap'
              >
                documentation
              </ExternalLinkButton>
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup label='Host Config Key' isRequired className='pf-v6-u-w-50'>
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
              <ExternalLinkButton
                url={AAP_DOCS_URL}
                analyticsStepId='wizard-aap'
              >
                documentation
              </ExternalLinkButton>
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      {shouldShowCaInput && (
        <FormGroup
          label='Certificate authority (CA) for Ansible Controller'
          isRequired={isHttpUrl}
        >
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                {isHttpUrl ? (
                  'Upload a CA certificate for the Ansible Controller'
                ) : (
                  <>
                    Upload a CA certificate, or check &quot;Insecure&quot; to
                    skip TLS verification{' '}
                    <span
                      style={{
                        color:
                          'var(--pf-t--global--color--status--danger--default)',
                        fontSize: 'var(--pf-t--global--font--size--lg)',
                      }}
                    >
                      *
                    </span>
                  </>
                )}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
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
                <ExternalLinkButton
                  url={AAP_DOCS_URL}
                  analyticsStepId='wizard-aap'
                >
                  documentation
                </ExternalLinkButton>
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      )}
      <FormGroup>
        <Checkbox
          id='tls-confirmation-checkbox'
          label='Insecure'
          description={
            isHttpUrl
              ? 'Not available for HTTP URLs — a CA certificate is required'
              : 'Skip TLS certificate verification for HTTPS connections'
          }
          isChecked={tlsConfirmation || false}
          isDisabled={isHttpUrl}
          onChange={(_event, checked) => handleTlsConfirmationChange(checked)}
        />
      </FormGroup>
    </Form>
  );
};

export default AAPRegistration;
