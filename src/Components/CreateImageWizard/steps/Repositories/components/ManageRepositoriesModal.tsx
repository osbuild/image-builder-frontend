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
  Tab,
  Tabs,
  TabTitleText,
  TextArea,
  TextInput,
} from '@patternfly/react-core';

import { useCreateRepositoryMutation } from '../../../../../store/contentSourcesApi';

interface ManageRepositoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageRepositoriesModal: React.FC<ManageRepositoriesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [gpgKey, setGpgKey] = useState('');
  const [metadataVerification, setMetadataVerification] = useState(true);
  const [error, setError] = useState('');

  const [createRepository, { isLoading }] = useCreateRepositoryMutation();

  const handleTabClick = (
    _event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex);
  };

  const resetForm = () => {
    setName('');
    setUrl('');
    setGpgKey('');
    setMetadataVerification(true);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required fields.');
      return;
    }

    try {
      await createRepository({
        apiRepositoryRequest: {
          name: name.trim(),
          url: url.trim(),
          gpg_key: gpgKey.trim() || undefined,
          metadata_verification: metadataVerification,
        },
      }).unwrap();

      resetForm();
      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message || 'Failed to create repository. Please try again.',
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Manage Custom Repositories'
      variant='medium'
    >
      <ModalHeader title='Manage Custom Repositories' />
      <ModalBody>
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          aria-label='Repository management tabs'
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Add Repository</TabTitleText>}
            aria-label='Add repository tab'
          >
            <div style={{ marginTop: '16px' }}>
              {error && (
                <Alert variant='danger' isInline title='Error'>
                  {error}
                </Alert>
              )}
              <Form>
                <FormGroup
                  label='Repository Name'
                  isRequired
                  fieldId='repo-name'
                >
                  <TextInput
                    isRequired
                    type='text'
                    id='repo-name'
                    name='repo-name'
                    value={name}
                    onChange={(_, value) => setName(value)}
                    placeholder='Enter repository name'
                  />
                </FormGroup>
                <FormGroup label='Repository URL' isRequired fieldId='repo-url'>
                  <TextInput
                    isRequired
                    type='url'
                    id='repo-url'
                    name='repo-url'
                    value={url}
                    onChange={(_, value) => setUrl(value)}
                    placeholder='https://example.com/repo/'
                  />
                </FormGroup>
                <FormGroup label='GPG Key' fieldId='repo-gpg-key'>
                  <TextArea
                    id='repo-gpg-key'
                    name='repo-gpg-key'
                    value={gpgKey}
                    onChange={(_, value) => setGpgKey(value)}
                    placeholder='-----BEGIN PGP PUBLIC KEY BLOCK-----'
                    rows={8}
                  />
                </FormGroup>
              </Form>
            </div>
          </Tab>
        </Tabs>
      </ModalBody>
      <ModalFooter>
        <Button
          key='create'
          variant='primary'
          onClick={handleSubmit}
          isLoading={isLoading}
          isDisabled={!name.trim() || !url.trim()}
        >
          {isLoading ? 'Creating...' : 'Create Repository'}
        </Button>
        <Button key='cancel' variant='link' onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ManageRepositoriesModal;
