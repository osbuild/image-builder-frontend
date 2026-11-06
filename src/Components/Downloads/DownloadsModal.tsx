import React from 'react';

import {
  Content,
  Gallery,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import DownloadImageCard from './DownloadImageCard';

type DownloadsModalProps = {
  setShowDownloadsModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

const galleryMinWidths = {
  default: '18rem',
};

export const DownloadsModal = ({
  setShowDownloadsModal,
  isOpen,
}: DownloadsModalProps) => {
  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={() => setShowDownloadsModal(false)}
    >
      <ModalHeader title='Build and download RHEL' />
      <ModalBody>
        <Content>
          <Content component='p'>
            Download Red Hat Enterprise Linux (RHEL) ISOs and images tailored
            for your environment.
          </Content>
          <Content component='h3'>Network install images</Content>
          {/* TODO-downloads: add download links */}
          <Gallery hasGutter minWidths={galleryMinWidths}>
            <DownloadImageCard
              title='Red Hat Enterprise Linux 10 Boot ISO'
              link=''
              info={{
                name: 'rhel-10-boot.iso',
                size: '',
                last_updated: '',
                sha_256_checksum: '',
              }}
            />
            <DownloadImageCard
              title='Red Hat Enterprise Linux 9.6 Boot ISO'
              link=''
              info={{
                name: 'rhel-9.6-boot.iso',
                size: '',
                last_updated: '',
                sha_256_checksum: '',
              }}
            />
          </Gallery>
          <Content component='h3'>Offline install images</Content>
          <Gallery hasGutter minWidths={galleryMinWidths}>
            <DownloadImageCard
              title='Red Hat Enterprise Linux 10 Binary DVD'
              link=''
              info={{
                name: 'rhel-10-dvd.iso',
                size: '',
                last_updated: '',
                sha_256_checksum: '',
              }}
            />
            <DownloadImageCard
              title='Red Hat Enterprise Linux 9.6 Binary DVD'
              link=''
              info={{
                name: 'rhel-9.6-dvd.iso',
                size: '',
                last_updated: '',
                sha_256_checksum: '',
              }}
            />
          </Gallery>
        </Content>
      </ModalBody>
    </Modal>
  );
};
