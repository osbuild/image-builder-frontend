import React, { useState } from 'react';

import { Button, Content, Flex, Popover } from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { useNavigate } from 'react-router-dom';

import { OSBUILD_SERVICE_ARCHITECTURE_URL } from '../../constants';
import { useGetDocumentationUrl } from '../../Hooks';
import { useBackendPrefetch } from '../../store/backendApi';
import { selectIsOnPremise } from '../../store/envSlice';
import { useAppSelector } from '../../store/hooks';
import { selectDistribution } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
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
  const navigate = useNavigate();
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const distribution = useAppSelector(selectDistribution);
  const prefetchTargets = useBackendPrefetch('getArchitectures');

  const [showImportModal, setShowImportModal] = useState(false);
  const [showCloudConfigModal, setShowCloudConfigModal] = useState(false);

  const pageHeaderProps: React.ComponentProps<typeof PageHeader> &
    React.ComponentPropsWithoutRef<'section'> = {
    className: 'pf-m-sticky-top',
    style: { boxShadow: 'none' },
  };

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
      <PageHeader {...pageHeaderProps}>
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
                    onClick={() => navigate(resolveRelPath('imagewizard'))}
                    onMouseEnter={() =>
                      prefetchTargets({
                        distribution: distribution,
                      })
                    }
                  >
                    Create image blueprint
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
      </PageHeader>
    </>
  );
};
