import React from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { CONTENT_URL, EPEL_10_REPO_DEFINITION } from '@/constants';
import {
  ApiRepositoryResponseRead,
  useCreateRepositoryMutation,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addPackage,
  addPackageGroup,
  addRepository,
  IBPackage,
  IBPackageGroup,
  selectDistribution,
} from '@/store/slices/wizard';
import {
  getEpelDefinitionForDistribution,
  getEpelVersionForDistribution,
} from '@/Utilities/epel';

import { useEpelRepo } from '../hooks/usePackageHelpers';

type RepositoryModalProps = {
  pendingRepoRec: IBPackage | IBPackageGroup | undefined;
  setPendingRepoRec: (value: IBPackage | IBPackageGroup | undefined) => void;
};

const RepositoryModal = ({
  pendingRepoRec,
  setPendingRepoRec,
}: RepositoryModalProps) => {
  const isGroup = pendingRepoRec && 'package_list' in pendingRepoRec;
  const dispatch = useAppDispatch();
  const distribution = useAppSelector(selectDistribution);
  const { data: epelRepo } = useEpelRepo();

  const [createRepository, { isLoading: createLoading }] =
    useCreateRepositoryMutation();

  const handleCloseModalToggle = () => {
    setPendingRepoRec(undefined);
  };

  const handleConfirmModalToggle = async () => {
    if (!epelRepo || !epelRepo.data) {
      throw new Error(
        `There was an error while adding the recommended repository.`,
      );
    }

    if (epelRepo.data.length === 0) {
      const result = await createRepository({
        apiRepositoryRequest:
          getEpelDefinitionForDistribution(distribution) ??
          EPEL_10_REPO_DEFINITION,
      });
      dispatch(
        addRepository({
          repo: (result as { data: ApiRepositoryResponseRead }).data,
          isRecommended: true,
        }),
      );
    } else {
      dispatch(addRepository({ repo: epelRepo.data[0], isRecommended: true }));
    }
    if (pendingRepoRec) {
      if (isGroup) {
        dispatch(addPackageGroup(pendingRepoRec as IBPackageGroup));
      } else {
        dispatch(addPackage(pendingRepoRec as IBPackage));
      }
    }
    setPendingRepoRec(undefined);
  };

  return (
    <Modal
      isOpen={!!pendingRepoRec}
      onClose={handleCloseModalToggle}
      width='50%'
    >
      <ModalHeader
        title='Custom repositories will be added to your image'
        titleIconVariant='warning'
      />
      <ModalBody>
        You have selected packages that belong to custom repositories. By
        continuing, you are acknowledging and consenting to adding the following
        custom repositories to your image.
        <br />
        <br />
        The repositories will also get enabled in{' '}
        <Button
          component='a'
          target='_blank'
          variant='link'
          iconPosition='right'
          isInline
          icon={<ExternalLinkAltIcon />}
          href={CONTENT_URL}
        >
          content services
        </Button>{' '}
        if they were not enabled yet:
        <br />
        <Table variant='compact'>
          <Thead>
            <Tr>
              {isGroup ? <Th>Package groups</Th> : <Th>Packages</Th>}
              <Th>Repositories</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{pendingRepoRec?.name}</Td>
              <Td>
                EPEL {getEpelVersionForDistribution(distribution)} Everything
                x86_64
              </Td>
            </Tr>
          </Tbody>
        </Table>
        <br />
        To move forward, either add the repos to your image, or go back to
        review your package selections.
      </ModalBody>
      <ModalFooter>
        <Button
          key='add'
          variant='primary'
          isLoading={createLoading}
          isDisabled={createLoading}
          onClick={handleConfirmModalToggle}
        >
          Add listed repositories
        </Button>
        <Button key='back' variant='link' onClick={handleCloseModalToggle}>
          Back
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RepositoryModal;
