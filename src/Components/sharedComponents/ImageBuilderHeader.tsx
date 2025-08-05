import React, { useState } from 'react';

import { Button, Content, Flex, Popover } from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { useNavigate } from 'react-router-dom';

import {
  CREATING_IMAGES_WITH_IB_SERVICE_URL,
  OSBUILD_SERVICE_ARCHITECTURE_URL,
} from '../../constants';
import { useBackendPrefetch } from '../../store/backendApi';
import { useAppSelector } from '../../store/hooks';
import { selectDistribution } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import './ImageBuilderHeader.scss';
import { useFlagWithEphemDefault } from '../../Utilities/useGetEnvironment';
import { ImportBlueprintModal } from '../Blueprints/ImportBlueprintModal';

type ImageBuilderHeaderPropTypes = {
  inWizard?: boolean;
};

const AboutImageBuilderPopover = () => {
  return (
    <Popover
      minWidth="35rem"
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
              component="a"
              target="_blank"
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              isInline
              href={CREATING_IMAGES_WITH_IB_SERVICE_URL}
            >
              Image builder for RPM-DNF documentation
            </Button>
          </Content>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant="plain"
        aria-label="About image builder"
        className="pf-v6-u-pl-sm header-button"
      />
    </Popover>
  );
};

export const ImageBuilderHeader = ({
  inWizard,
}: ImageBuilderHeaderPropTypes) => {
  const navigate = useNavigate();

  const distribution = useAppSelector(selectDistribution);
  const prefetchTargets = useBackendPrefetch('getArchitectures');

  const importExportFlag = useFlagWithEphemDefault(
    'image-builder.import.enabled',
  );
  const [showImportModal, setShowImportModal] = useState(false);
  return (
    <>
      {importExportFlag && (
        <ImportBlueprintModal
          setShowImportModal={setShowImportModal}
          isOpen={showImportModal}
        />
      )}
      <PageHeader className="pf-m-sticky-top">
        <PageHeaderTitle
          className="title"
          title={
            <>
              Images <AboutImageBuilderPopover />
              <OpenSourceBadge
                repositoriesURL={OSBUILD_SERVICE_ARCHITECTURE_URL}
              />
            </>
          }
          actionsContent={
            <>
              {!inWizard && (
                <Flex>
                  <Button
                    variant="primary"
                    data-testid="blueprints-create-button"
                    onClick={() => navigate(resolveRelPath('imagewizard'))}
                    onMouseEnter={() =>
                      prefetchTargets({
                        distribution: distribution,
                      })
                    }
                  >
                    Create image blueprint
                  </Button>
                  {importExportFlag && (
                    <Button
                      variant="secondary"
                      onClick={() => setShowImportModal(true)}
                    >
                      Import
                    </Button>
                  )}
                  {process.env.IS_ON_PREMISE && (
                    <Button
                      variant="secondary"
                      data-testid="cloud-env-configure-button"
                      ouiaId="cloud-env-configure-button"
                      onClick={() =>
                        navigate(resolveRelPath('cloud-provider-config'))
                      }
                    >
                      Configure Cloud Providers
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
