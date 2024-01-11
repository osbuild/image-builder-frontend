import React from 'react';

import {
  Button,
  Flex,
  FlexItem,
  Popover,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { Link } from 'react-router-dom';

import './ImageBuilderHeader.scss';
import { resolveRelPath } from '../../Utilities/path';

export const ImageBuilderHeader = (props: { noButtons?: boolean }) => {
  const experimentalFlag = process.env.EXPERIMENTAL;
  return (
    <>
      {/*@ts-ignore*/}
      <PageHeader>
        <Flex>
          <FlexItem>
            <PageHeaderTitle className="title" title="Images" />
            <Popover
              minWidth="35rem"
              headerContent={'About image builder'}
              bodyContent={
                <TextContent>
                  <Text>
                    Image builder is a tool for creating deployment-ready
                    customized system images: installation disks, virtual
                    machines, cloud vendor-specific images, and others. By using
                    image builder, you can make these images faster than manual
                    procedures because it eliminates the specific configurations
                    required for each output type.
                  </Text>
                  <Text>
                    <Button
                      component="a"
                      target="_blank"
                      variant="link"
                      icon={<ExternalLinkAltIcon />}
                      iconPosition="right"
                      isInline
                      href={
                        'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/creating_customized_rhel_images_using_the_image_builder_service'
                      }
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
                      href={
                        'https://access.redhat.com/documentation/en-us/edge_management/2022/html/create_rhel_for_edge_images_and_configure_automated_management/index'
                      }
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
            <OpenSourceBadge repositoriesURL="https://www.osbuild.org/guides/image-builder-service/architecture.html" />
          </FlexItem>
          {!props.noButtons && (
            <FlexItem align={{ default: 'alignRight' }}>
              {experimentalFlag && (
                <Link
                  to={resolveRelPath('blueprintwizard')}
                  className="pf-c-button pf-m-primary pf-u-mr-md"
                  data-testid="create-blueprint-action"
                >
                  Create
                </Link>
              )}
              <Link
                to={resolveRelPath('imagewizard')}
                className="pf-c-button pf-m-primary"
                data-testid="create-image-action"
              >
                Build images
              </Link>
            </FlexItem>
          )}
        </Flex>
      </PageHeader>
    </>
  );
};
