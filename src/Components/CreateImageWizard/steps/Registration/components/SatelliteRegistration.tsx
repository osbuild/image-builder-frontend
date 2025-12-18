import React from 'react';

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

import SatelliteRegistrationCommand from './SatelliteRegistrationCommand';

import { REGISTRATION_DOCS_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeSatelliteCaCertificate,
  selectSatelliteCaCertificate,
} from '../../../../../store/wizardSlice';
import ExternalLinkButton from '../../../utilities/ExternalLinkButton';
import { useRegistrationValidation } from '../../../utilities/useValidation';

const SatelliteRegistration = () => {
  const dispatch = useAppDispatch();
  const caCertificate = useAppSelector(selectSatelliteCaCertificate);
  const [isRejected, setIsRejected] = React.useState(false);
  const stepValidation = useRegistrationValidation();

  const validated =
    'certificate' in stepValidation.errors
      ? 'error'
      : caCertificate
        ? 'success'
        : 'default';

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
            validated={isRejected ? 'error' : validated}
            browseButtonText='Upload'
            allowEditingUploadedText={true}
          >
            <FileUploadHelperText>
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
                    ? 'Must be a .PEM/.CER/.CRT file no larger than 512 KB'
                    : validated === 'error'
                      ? stepValidation.errors['certificate']
                      : validated === 'success'
                        ? 'Certificate was uploaded'
                        : 'Upload a certificate file'}
                </HelperTextItem>
              </HelperText>
            </FileUploadHelperText>
          </FileUpload>
          <FormHelperText>
            <HelperText>
              {(isRejected || validated !== 'success') && (
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
