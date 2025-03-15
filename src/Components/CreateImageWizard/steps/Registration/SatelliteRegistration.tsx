import React from 'react';

import {
  DropEvent,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import SatelliteRegistrationCommand from './components/SatelliteRegistrationCommand';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeSatelliteCaCertificate,
  selectSatelliteCaCertificate,
} from '../../../../store/wizardSlice';
import { useRegistrationValidation } from '../../utilities/useValidation';

const SatelliteRegistration = () => {
  const dispatch = useAppDispatch();
  const caCertificate = useAppSelector(selectSatelliteCaCertificate);
  const [isRejected, setIsRejected] = React.useState(false);
  const stepValidation = useRegistrationValidation();
  const validated =
    stepValidation.errors['certificate'] === 'default'
      ? 'default'
      : stepValidation.errors['certificate']
      ? 'error'
      : 'success';

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
    <Form>
      <SatelliteRegistrationCommand />
      <FormGroup label="Certificate authority (CA)" isRequired>
        <FileUpload
          id="text-file-with-restrictions-example"
          type="text"
          value={caCertificate || ''}
          filename={caCertificate ? 'CA detected' : ''}
          onDataChange={handleDataChange}
          onTextChange={handleTextChange}
          onClearClick={handleClear}
          isRequired={true}
          dropzoneProps={{
            accept: {
              'application/x-pem-file': ['.pem'],
              'application/x-x509-ca-cert': ['.cer', '.crt'],
              'application/pkix-cert': ['.der'],
            },
            maxSize: 512000,
            onDropRejected: handleFileRejected,
          }}
          validated={isRejected ? 'error' : 'default'}
          browseButtonText="Upload"
          allowEditingUploadedText={true}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={
                isRejected || validated === 'error' ? 'error' : 'default'
              }
              hasIcon
            >
              {isRejected
                ? 'Must be a .PEM/.CER/.CRT file no larger than 512 KB'
                : validated === 'error'
                ? stepValidation.errors['certificate']
                : 'Drag and drop a file or upload one'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </Form>
  );
};

export default SatelliteRegistration;
