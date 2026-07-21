import React, { useState } from 'react';

import {
  Alert,
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core';

type RegistryLoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  isLoggingIn: boolean;
  error: string | null;
};

const RegistryLoginModal = ({
  isOpen,
  onClose,
  onLogin,
  isLoggingIn,
  error,
}: RegistryLoginModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleClose = () => {
    setUsername('');
    setPassword('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      try {
        await onLogin(username, password);
        handleClose();
      } catch {
        // Modal stays open on error; error is displayed via the error prop
      }
    }
  };

  const isSubmitDisabled = !username || !password || isLoggingIn;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} variant='small'>
      <ModalHeader title='Log in to registry.redhat.io' />
      <ModalBody>
        <Form id='registry-login-form' onSubmit={handleSubmit}>
          {error && (
            <Alert
              variant='danger'
              title='Login failed'
              className='pf-v6-u-mb-md'
            >
              {error}
            </Alert>
          )}
          <FormGroup label='Username' isRequired fieldId='registry-username'>
            <TextInput
              isRequired
              type='text'
              id='registry-username'
              name='registry-username'
              value={username}
              onChange={(_event, value) => setUsername(value)}
              autoComplete='username'
            />
          </FormGroup>
          <FormGroup label='Password' isRequired fieldId='registry-password'>
            <TextInput
              isRequired
              type='password'
              id='registry-password'
              name='registry-password'
              value={password}
              onChange={(_event, value) => setPassword(value)}
              autoComplete='current-password'
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          variant='primary'
          type='submit'
          form='registry-login-form'
          isDisabled={isSubmitDisabled}
          isLoading={isLoggingIn}
        >
          Log in
        </Button>
        <Button variant='link' onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RegistryLoginModal;
