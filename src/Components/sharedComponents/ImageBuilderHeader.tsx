import React, { useState } from 'react';

import { Button, Content, Flex, Popover } from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';

import './ImageBuilderHeader.scss';

import { OSBUILD_SERVICE_ARCHITECTURE_URL } from '@/constants';
import { useGetDocumentationUrl } from '@/Hooks';
import { useBackendPrefetch } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectDistribution } from '@/store/slices/wizard';
import { openWizardModal } from '@/store/slices/wizardModal';
import { useFlag } from '@/Utilities/useGetEnvironment';

import { ImportBlueprintModal } from '../Blueprints/ImportBlueprintModal';
import { CloudProviderConfig } from '../CloudProviderConfig/CloudProviderConfig';

type ImageBuilderHeaderPropTypes = {
  inWizard?: boolean;
};

const AboutImageBuilderPopover = () => {
  const documentationUrl = useGetDocumentationUrl();
  return (
    <Popover
      minWidth='35rem'
      headerContent={'About image builder'}
      bodyContent={
        <Content>
          <Content>
            Image builder is a tool for creating deployment-ready customized
            system images: installation disks, virtual machines, cloud
            vendor-specific images, and others. By using image builder, you can
            make these images faster than manual procedures because it
            eliminates the specific configurations required for each output
            type.
          </Content>

          <Content>
            <Button
              component='a'
              target='_blank'
              variant='link'
              icon={<ExternalLinkAltIcon />}
              iconPosition='right'
              isInline
              href={documentationUrl}
            >
              Image builder documentation
            </Button>
          </Content>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant='plain'
        aria-label='About image builder'
        className='pf-v6-u-pl-sm'
      />
    </Popover>
  );
};

export const ImageBuilderHeader = ({
  inWizard,
}: ImageBuilderHeaderPropTypes) => {
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const distribution = useAppSelector(selectDistribution);
  const prefetchTargets = useBackendPrefetch('getArchitectures');

  const isImagesTableRevampEnabled = useFlag(
    'image-builder.images-table-revamp.enabled',
  );

  const [showImportModal, setShowImportModal] = useState(false);
  const [showCloudConfigModal, setShowCloudConfigModal] = useState(false);

  return (
    <>
      <ImportBlueprintModal
        setShowImportModal={setShowImportModal}
        isOpen={showImportModal}
      />
      {isOnPremise && showCloudConfigModal && (
        <CloudProviderConfig
          setShowCloudConfigModal={setShowCloudConfigModal}
          isOpen={showCloudConfigModal}
        />
      )}
      <PageHeader className='pf-m-sticky-top image-builder-header'>
        <PageHeaderTitle
          title={
            <>
              Image builder <AboutImageBuilderPopover />
              {!isOnPremise && (
                <OpenSourceBadge
                  repositoriesURL={OSBUILD_SERVICE_ARCHITECTURE_URL}
                />
              )}
            </>
          }
          actionsContent={
            <>
              {!inWizard && (
                <Flex>
                  <Button
                    variant='primary'
                    data-testid='blueprints-create-button'
                    onClick={() => dispatch(openWizardModal('create'))}
                    onMouseEnter={() =>
                      prefetchTargets({
                        distribution: distribution,
                      })
                    }
                  >
                    {isImagesTableRevampEnabled
                      ? 'Build new image'
                      : 'Create image blueprint'}
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={() => setShowImportModal(true)}
                  >
                    Import
                  </Button>
                  {isOnPremise && (
                    <Button
                      variant='secondary'
                      onClick={() => setShowCloudConfigModal(true)}
                    >
                      Configure cloud providers
                    </Button>
                  )}
                </Flex>
              )}
            </>
          }
        />
        {isImagesTableRevampEnabled && (
          <Content className='image-builder-header__description'>
            Build, customize, and deploy RHEL images for public cloud, private
            cloud, and on-premise environments. You can manage your images by
            duplicating, rebuilding, or editing existing configurations.
            Download your finished builds or launch them directly as
            deployment-ready systems.
          </Content>
        )}
      </PageHeader>
    </>
  );
};
