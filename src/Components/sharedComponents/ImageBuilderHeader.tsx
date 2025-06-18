import React, { useState } from 'react';

import { Button, Popover, Content, Flex, Alert } from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { useNavigate } from 'react-router-dom';

import {
  CREATE_RHEL_IMAGES_WITH_AUTOMATED_MANAGEMENT_URL,
  CREATING_IMAGES_WITH_IB_SERVICE_URL,
  OSBUILD_SERVICE_ARCHITECTURE_URL,
  RHEM_DOCUMENTATION_URL,
} from '../../constants';
import { useBackendPrefetch } from '../../store/backendApi';
import { useAppSelector } from '../../store/hooks';
import { selectDistribution } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import './ImageBuilderHeader.scss';
import { useFlagWithEphemDefault } from '../../Utilities/useGetEnvironment';
import { ImportBlueprintModal } from '../Blueprints/ImportBlueprintModal';

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
          <Content>
            <Button
              component="a"
              target="_blank"
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              isInline
              href={CREATE_RHEL_IMAGES_WITH_AUTOMATED_MANAGEMENT_URL}
            >
              Image builder for OSTree documentation
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

type ImageBuilderHeaderPropTypes = {
  activeTab?: number;
  inWizard?: boolean;
};

export const ImageBuilderHeader = ({
  activeTab,
  inWizard,
}: ImageBuilderHeaderPropTypes) => {
  const navigate = useNavigate();

  const distribution = useAppSelector(selectDistribution);
  const prefetchTargets = useBackendPrefetch('getArchitectures');

  const importExportFlag = useFlagWithEphemDefault(
    'image-builder.import.enabled'
  );
  const [showImportModal, setShowImportModal] = useState(false);
  const isOnBlueprintsTab = activeTab === 0;
  return (
    <>
      {importExportFlag && (
        <ImportBlueprintModal
          setShowImportModal={setShowImportModal}
          isOpen={showImportModal}
        />
      )}
      <PageHeader>
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
                    isDisabled={!isOnBlueprintsTab}
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
                      data-testid="import-blueprint-button"
                      variant="secondary"
                      onClick={() => setShowImportModal(true)}
                      isDisabled={!isOnBlueprintsTab}
                    >
                      Import
                    </Button>
                  )}
                </Flex>
              )}
            </>
          }
        />
        {!isOnBlueprintsTab && !inWizard && !process.env.IS_ON_PREMISE && (
          <Alert
            variant="info"
            isInline
            title={<>Upcoming decommission of hosted Edge Management service</>}
            className="pf-v6-u-mt-sm pf-v6-u-mb-sm"
          >
            <Content>
              <Content>
                As of July 31, 2025, the hosted edge management service will no
                longer be supported. This means that pushing image updates to
                Immutable (OSTree) systems using the Hybrid Cloud Console will
                be discontinued. For an alternative way to manage edge systems,
                customers are encouraged to explore Red Hat Edge Manager (RHEM).
              </Content>
              <Content>
                <Button
                  component="a"
                  target="_blank"
                  variant="link"
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="right"
                  isInline
                  href={RHEM_DOCUMENTATION_URL}
                >
                  Red Hat Edge Manager (RHEM) documentation
                </Button>
              </Content>
            </Content>
          </Alert>
        )}
      </PageHeader>
    </>
  );
};
