import React, { useEffect, useId, useMemo, useState } from 'react';

import {
  Content,
  FileUpload,
  FileUploadHelperText,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import ExternalLinkButton from '@/Components/CreateImageWizard/utilities/ExternalLinkButton';
import { REGISTRATION_DOCS_URL } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addPendingInput,
  changeSatelliteCaCertificate,
  MAX_CERTIFICATE_BYTES,
  removePendingInput,
  selectForceShowErrors,
  selectSatelliteCaCertificates,
  validateSatelliteCert,
  validateSatelliteCerts,
} from '@/store/slices/wizard';

import SatelliteRegistrationCommand from './SatelliteRegistrationCommand';

type Status = {
  status: 'default' | 'error' | 'success';
  messages: string[];
};

const SatelliteRegistration = () => {
  const dispatch = useAppDispatch();
  const certificateInputId = useId();
  const caCertificates = useAppSelector(selectSatelliteCaCertificates);
  const forceShowErrors = useAppSelector(selectForceShowErrors);
  const [draft, setDraft] = useState((caCertificates ?? []).join('\n'));
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    // Reset the local draft when the certificate changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft((caCertificates ?? []).join('\n'));
  }, [caCertificates]);

  useEffect(() => {
    return () => {
      dispatch(removePendingInput(certificateInputId));
    };
  }, [dispatch, certificateInputId]);

  const { status, messages } = useMemo<Status>(() => {
    if (issues.length > 0) {
      return {
        status: 'error',
        messages: issues,
      };
    }

    if (!forceShowErrors && !caCertificates?.length) {
      return {
        status: 'default',
        messages: ['Upload a certificate file'],
      };
    }

    const { errors } = validateSatelliteCerts(caCertificates ?? []);
    if (errors.length > 0) {
      return {
        status: 'error',
        messages: errors.map((issue) => issue.message),
      };
    }

    return {
      status: 'success',
      messages: ['CA certificate loaded'],
    };
  }, [caCertificates, forceShowErrors, issues]);

  const handleClear = () => {
    setDraft('');
    dispatch(changeSatelliteCaCertificate([]));
    dispatch(removePendingInput(certificateInputId));
    setIssues([]);
  };

  const validateCertificate = (cert: string) => {
    const { data, errors } = validateSatelliteCert(cert);
    if (errors.length > 0) {
      setIssues(errors.map((issue) => issue.message));
      return;
    }

    // this shouldn't really be possible if there were no errors
    if (!data) return;

    setDraft(data.join('\n'));
    dispatch(changeSatelliteCaCertificate(data));
    dispatch(removePendingInput(certificateInputId));
    setIssues([]);
  };

  const handleFileRejected = () => {
    setDraft('');
    dispatch(changeSatelliteCaCertificate([]));
    dispatch(removePendingInput(certificateInputId));
    setIssues(['Must be a .PEM/.CER/.CRT file no larger than 512 KB']);
  };

  return (
    <Content>
      <Content className='pf-v6-u-pb-md'>
        <SatelliteRegistrationCommand />
      </Content>
      <Content className='pf-v6-u-pb-md'>
        <FormGroup label='Certificate authority (CA) for Satellite'>
          <FileUpload
            id='text-file-with-restrictions-example'
            type='text'
            value={draft}
            filename={caCertificates?.length ? 'CA detected' : ''}
            filenamePlaceholder='Drag and drop a file or upload'
            onDataChange={(_, value) => {
              setDraft(value);
              dispatch(addPendingInput(certificateInputId));
              validateCertificate(value);
            }}
            onTextChange={(_, value) => {
              setDraft(value);
              dispatch(addPendingInput(certificateInputId));
            }}
            onTextAreaBlur={() => validateCertificate(draft)}
            onClearClick={handleClear}
            dropzoneProps={{
              accept: {
                'application/x-pem-file': ['.pem'],
                'application/x-x509-ca-cert': ['.cer', '.crt'],
              },
              maxSize: MAX_CERTIFICATE_BYTES,
              onDropRejected: handleFileRejected,
            }}
            validated={status}
            browseButtonText='Upload'
            allowEditingUploadedText={true}
          >
            <FileUploadHelperText>
              <HelperText>
                <HelperTextItem>
                  {messages.map((message, index) => (
                    <HelperTextItem
                      key={`${message}-${index}`}
                      variant={status}
                    >
                      {message}
                    </HelperTextItem>
                  ))}
                </HelperTextItem>
              </HelperText>
            </FileUploadHelperText>
          </FileUpload>
          <FormHelperText>
            <HelperText>
              {status !== 'success' && (
                <HelperTextItem>
                  To find the certificate follow this{' '}
                  <ExternalLinkButton
                    url={REGISTRATION_DOCS_URL}
                    analyticsStepId='step-register'
                  >
                    documentation
                  </ExternalLinkButton>
                </HelperTextItem>
              )}
            </HelperText>
          </FormHelperText>
        </FormGroup>
      </Content>
    </Content>
  );
};

export default SatelliteRegistration;
