import React from 'react';

import {
  DropEvent,
  FileUpload,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import SatelliteRegistrationCommand from './SatelliteRegistrationCommand';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeSatelliteCaCertificate,
  selectSatelliteCaCertificate,
} from '../../../../../store/wizardSlice';
import { useRegistrationValidation } from '../../../utilities/useValidation';

const SatelliteRegistration = () => {
  const dispatch = useAppDispatch();
  const caCertificate = useAppSelector(selectSatelliteCaCertificate);
  const [isRejected, setIsRejected] = React.useState(false);
  const stepValidation = useRegistrationValidation();
  const validated = stepValidation.errors['certificate']
    ? 'error'
    : stepValidation.errors['certificate'] === undefined && caCertificate
      ? 'success'
      : 'default';
  const handleClear = () => {
    dispatch(changeSatelliteCaCertificate(''));
  };

  const handleTextChange = (
    _event: React.ChangeEvent<HTMLTextAreaElement>,
    value: string
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
    <>
      <SatelliteRegistrationCommand />
      <FormGroup label="Certificate authority (CA) for Satellite">
        <FileUpload
          id="text-file-with-restrictions-example"
          type="text"
          value={caCertificate || ''}
          filename={caCertificate ? 'CA detected' : ''}
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
            >
              {isRejected
                ? 'Must be a .PEM/.CER/.CRT file no larger than 512 KB'
                : validated === 'error'
                  ? stepValidation.errors['certificate']
                  : validated === 'success'
                    ? 'Certificate was uploaded'
                    : 'Drag and drop a valid certificate file or upload one'}
            </HelperTextItem>
            {(isRejected || validated !== 'success') && (
              <HelperTextItem>
                You can find this certificate at{' '}
                <i>http://satellite.example.com</i>/pub/katello-server-ca.crt
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </>
  );
};

export default SatelliteRegistration;
