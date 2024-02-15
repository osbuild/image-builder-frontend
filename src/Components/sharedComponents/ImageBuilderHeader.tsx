import React, { useState } from 'react';

import {
  Button,
  Popover,
  Text,
  TextContent,
  Flex,
  FlexItem,
  Dropdown,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  DropdownItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { Link, useNavigate } from 'react-router-dom';

import {
  useComposeBlueprintMutation,
  useDeleteBlueprintMutation,
} from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';
import './ImageBuilderHeader.scss';
import { DeleteBlueprintModal } from '../Blueprints/DeleteBlueprintModal';

type ImageBuilderHeaderPropTypes = {
  experimentalFlag?: string | true | undefined;
  selectedBlueprint?: string | undefined;
};

export const ImageBuilderHeader = ({
  experimentalFlag,
  selectedBlueprint,
}: ImageBuilderHeaderPropTypes) => {
  const [buildBlueprint, { isLoading: imageBuildLoading }] =
    useComposeBlueprintMutation();
  const navigate = useNavigate();

  const onBuildHandler = async () => {
    selectedBlueprint && (await buildBlueprint({ id: selectedBlueprint }));
  };
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onSelect = () => {
    setIsOpen(!isOpen);
  };

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteBlueprint] = useDeleteBlueprintMutation({
    fixedCacheKey: 'delete-blueprint',
  });
  const handleDelete = async () => {
    if (selectedBlueprint) {
      setShowDeleteModal(false);
      await deleteBlueprint({ id: selectedBlueprint });
    }
  };
  const onDeleteClose = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      {/*@ts-ignore*/}
      <DeleteBlueprintModal
        onDelete={handleDelete}
        selectedBlueprint={selectedBlueprint}
        isOpen={showDeleteModal}
        onClose={onDeleteClose}
      />
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
            <OpenSourceBadge repositoriesURL="https://osbuild.org/docs/service/architecture/" />
          </FlexItem>
          {experimentalFlag && (
            <>
              <FlexItem align={{ default: 'alignRight' }}>
                <Link
                  to={resolveRelPath('imagewizard')}
                  className="pf-c-button pf-m-primary"
                  data-testid="create-image-action"
                >
                  Create
                </Link>
              </FlexItem>
              <FlexItem>
                <Button
                  ouiaId="build-images-button"
                  onClick={onBuildHandler}
                  isDisabled={!selectedBlueprint}
                  isLoading={imageBuildLoading}
                >
                  Build images
                </Button>
              </FlexItem>
              <FlexItem>
                <Dropdown
                  ouiaId={`blueprints-dropdown`}
                  isOpen={isOpen}
                  onSelect={onSelect}
                  onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
                  shouldFocusToggleOnSelect
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      isExpanded={isOpen}
                      onClick={() => setIsOpen(!isOpen)}
                      variant="secondary"
                      aria-label={`blueprint ${selectedBlueprint} menu toggle`}
                      isDisabled={selectedBlueprint === undefined}
                    >
                      Blueprint actions
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem
                      onClick={() =>
                        navigate(
                          resolveRelPath(`imagewizard/${selectedBlueprint}`)
                        )
                      }
                    >
                      Edit details
                    </DropdownItem>
                    <DropdownItem onClick={() => setShowDeleteModal(true)}>
                      Delete blueprint
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </FlexItem>{' '}
            </>
          )}
        </Flex>
      </PageHeader>
    </>
  );
};
