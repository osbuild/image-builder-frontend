import React, { useMemo, useState } from 'react';

import {
  Content,
  DropEvent,
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
  changeSatelliteCaCertificate,
  selectSatelliteCaCertificate,
  validateSatelliteCert,
} from '@/store/slices/wizard';

import SatelliteRegistrationCommand from './SatelliteRegistrationCommand';

const SatelliteRegistration = () => {
  const dispatch = useAppDispatch();
  const caCertificate = useAppSelector(selectSatelliteCaCertificate);
  const [isRejected, setIsRejected] = useState(false);

  const { messages, status } = useMemo<{
    messages: string[];
    status: 'default' | 'error' | 'success';
  }>(() => {
    if (isRejected) {
      return {
        status: 'error',
        messages: ['Must be a .PEM/.CER/.CRT file no larger than 512 KB'],
      };
    }

    const { data, errors } = validateSatelliteCert(caCertificate);

    if (errors.length > 0) {
      return {
        status: 'error',
        messages: errors.map((issue) => issue.message),
      };
    }

    if (data) {
      return {
        status: 'success',
        messages: ['Certificate was successfully uploaded'],
      };
    }

    return { status: 'default', messages: ['Upload a certificate file'] };
  }, [caCertificate, isRejected]);

  const handleClear = () => {
    dispatch(changeSatelliteCaCertificate(''));
  };

  const handleTextChange = (
    _event: React.ChangeEvent<HTMLTextAreaElement>,
    value: string,
  ) => {
    dispatch(changeSatelliteCaCertificate(value));
  };

  const handleDataChange = (_: DropEvent, value: string) => {
    dispatch(changeSatelliteCaCertificate(value));
  };

  const handleFileRejected = () => {
    dispatch(changeSatelliteCaCertificate(''));
    setIsRejected(true);
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
            value={caCertificate || ''}
            filename={caCertificate ? 'CA detected' : ''}
            filenamePlaceholder='Drag and drop a file or upload'
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
            validated={status}
            browseButtonText='Upload'
            allowEditingUploadedText={true}
          >
            <FileUploadHelperText>
              <HelperText>
                <HelperTextItem variant={status}>
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
