import React, { useState } from 'react';

import {
  Button,
  Popover,
  Text,
  TextContent,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  HelpIcon,
  ImportIcon,
} from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { useFlag } from '@unleash/proxy-client-react';
import { Link } from 'react-router-dom';

import {
  CREATE_RHEL_IMAGES_WITH_AUTOMATED_MANAGEMENT_URL,
  CREATING_IMAGES_WITH_IB_SERVICE_URL,
  OSBUILD_SERVICE_ARCHITECTURE_URL,
} from '../../constants';
import { resolveRelPath } from '../../Utilities/path';
import './ImageBuilderHeader.scss';
import { ImportBlueprintModal } from '../Blueprints/ImportBlueprintModal';

type ImageBuilderHeaderPropTypes = {
  experimentalFlag?: boolean;
};

const AboutImageBuilderPopover = () => {
  return (
    <Popover
      minWidth="35rem"
      headerContent={'About image builder'}
      bodyContent={
        <TextContent>
          <Text>
            Image builder is a tool for creating deployment-ready customized
            system images: installation disks, virtual machines, cloud
            vendor-specific images, and others. By using image builder, you can
            make these images faster than manual procedures because it
            eliminates the specific configurations required for each output
            type.
          </Text>
          <Text>
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
          </Text>
          <Text>
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
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="About image builder"
        className="pf-u-pl-sm header-button"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

export const ImageBuilderHeader = ({
  experimentalFlag,
}: ImageBuilderHeaderPropTypes) => {
  const importExportFlag = useFlag('image-builder.import.enabled');
  const [showImportModal, setShowImportModal] = useState(false);
  return (
    <>
      {importExportFlag && (
        <ImportBlueprintModal
          setShowImportModal={setShowImportModal}
          isOpen={showImportModal}
        />
      )}
      <PageHeader data-testid="image-builder-header">
        <Flex>
          <FlexItem>
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
            />
          </FlexItem>
          {experimentalFlag && (
            <>
              <FlexItem align={{ default: 'alignRight' }}>
                <Link
                  to={resolveRelPath('imagewizard')}
                  className="pf-c-button pf-m-primary"
                  data-testid="blueprints-create-button"
                >
                  Create blueprint
                </Link>
              </FlexItem>
              <FlexItem>
                {importExportFlag && (
                  <Button
                    variant="secondary"
                    icon={<ImportIcon />}
                    iconPosition="end"
                    onClick={() => setShowImportModal(true)}
                  >
                    Import{' '}
                  </Button>
                )}
              </FlexItem>
            </>
          )}
        </Flex>
      </PageHeader>
    </>
  );
};
