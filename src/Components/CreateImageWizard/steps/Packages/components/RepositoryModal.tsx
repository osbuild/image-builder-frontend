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
import { useDispatch } from 'react-redux';

import { CONTENT_URL, EPEL_10_REPO_DEFINITION } from '../../../../../constants';
import {
  ApiRepositoryCollectionResponseRead,
  ApiRepositoryResponseRead,
  useCreateRepositoryMutation,
} from '../../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../../store/hooks';
import {
  addPackage,
  addPackageGroup,
  addRecommendedRepository,
  selectDistribution,
} from '../../../../../store/wizardSlice';
import {
  getEpelDefinitionForDistribution,
  getEpelVersionForDistribution,
} from '../../../../../Utilities/epel';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../packagesTypes';

type RepositoryModalProps = {
  isRepoModalOpen: boolean;
  setIsRepoModalOpen: (value: boolean) => void;
  isSelectingPackage: IBPackageWithRepositoryInfo | undefined;
  setIsSelectingPackage: (
    value: IBPackageWithRepositoryInfo | undefined,
  ) => void;
  isSelectingGroup: GroupWithRepositoryInfo | undefined;
  epelRepo: ApiRepositoryCollectionResponseRead | undefined;
};

const RepositoryModal = ({
  isRepoModalOpen,
  setIsRepoModalOpen,
  isSelectingPackage,
  setIsSelectingPackage,
  isSelectingGroup,
  epelRepo,
}: RepositoryModalProps) => {
  const dispatch = useDispatch();
  const distribution = useAppSelector(selectDistribution);

  const [createRepository, { isLoading: createLoading }] =
    useCreateRepositoryMutation();

  const handleCloseModalToggle = () => {
    setIsRepoModalOpen(!isRepoModalOpen);
    setIsSelectingPackage(undefined);
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
        addRecommendedRepository(
          (result as { data: ApiRepositoryResponseRead }).data,
        ),
      );
    } else {
      dispatch(addRecommendedRepository(epelRepo.data[0]));
    }
    if (isSelectingPackage) {
      dispatch(addPackage(isSelectingPackage!));
    }
    if (isSelectingGroup) {
      dispatch(addPackageGroup(isSelectingGroup!));
    }
    setIsRepoModalOpen(!isRepoModalOpen);
  };

  return (
    <Modal
      isOpen={isRepoModalOpen}
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
              {isSelectingPackage ? <Th>Packages</Th> : <Th>Package groups</Th>}
              <Th>Repositories</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              {isSelectingPackage ? (
                <Td>{isSelectingPackage.name}</Td>
              ) : (
                <Td>{isSelectingGroup?.name}</Td>
              )}
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
