import React, { useRef, useState } from 'react';

import {
  Alert,
  Divider,
  Menu,
  MenuContainer,
  MenuContent,
  MenuList,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  SearchInput,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';

import { useListTemplatesQuery } from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeTemplate,
  changeTemplateName,
  selectArchitecture,
  selectDistribution,
  selectTemplate,
} from '@/store/slices/wizard';
import { releaseToVersion } from '@/Utilities/releaseToVersion';

const Templates = () => {
  const dispatch = useAppDispatch();

  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const version = releaseToVersion(distribution);
  const templateUuid = useAppSelector(selectTemplate);

  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    data: { data: templateList = [] } = {},
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useListTemplatesQuery(
    {
      arch: arch,
      version: version,
    },
    { refetchOnMountOrArgChange: 60 },
  );

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: number | string | undefined,
  ) => {
    const template = templateList.find((t) => t.uuid === itemId);

    if (template?.uuid) {
      dispatch(changeTemplate(template.uuid));
    }
    if (template?.name) {
      dispatch(changeTemplateName(template.name));
    }

    setIsOpen(false);
  };

  const onTextInputChange = (value: string) => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setInput(value);
  };

  const templateStatus = (lastTemplateTask: string | undefined) => {
    switch (lastTemplateTask) {
      case 'completed':
        return 'Valid';
      case 'pending':
      case 'running':
        return 'In progress';
      case 'failed':
      case 'cancelled':
        return 'Invalid';
      default:
        return 'N/A';
    }
  };

  const templateMenuItems = templateList
    .filter(
      (item) =>
        !input || item.name?.toLowerCase().includes(input.toLowerCase()),
    )
    .map((template) => {
      const snapshotDate = template.use_latest
        ? 'Use latest'
        : template.date?.split('T')[0];
      const status = templateStatus(template.last_update_task?.status);

      return (
        <SelectOption
          key={template.uuid}
          itemId={template.uuid}
          isSelected={template.uuid === templateUuid}
          description={`Snapshot date: ${snapshotDate} | Status: ${status}`}
        >
          {template.name}
        </SelectOption>
      );
    });

  if (isLoading || isFetching) {
    templateMenuItems.push(
      <SelectOption key='loading' isDisabled>
        <Spinner size='md' /> {isLoading && 'Loading templates'}
      </SelectOption>,
    );
  }

  if (templateMenuItems.length === 0) {
    templateMenuItems.push(
      <SelectOption key='no result' isDisabled>
        {input ? 'No results found' : 'No available templates'}
      </SelectOption>,
    );
  }

  const selectedTemplate = templateList.find((t) => t.uuid === templateUuid);
  const templateDisplayName =
    selectedTemplate?.name || templateUuid || 'Select content template';

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      onClick={() => {
        setIsOpen(!isOpen);
        if (!isOpen) {
          refetch();
        }
      }}
      isExpanded={isOpen}
      style={
        {
          minWidth: '50%',
          maxWidth: '100%',
        } as React.CSSProperties
      }
    >
      {templateDisplayName}
    </MenuToggle>
  );

  const menu = (
    <Menu
      ref={menuRef}
      onSelect={onSelect}
      activeItemId={templateUuid}
      isScrollable
    >
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            value={input}
            aria-label='Filter content templates'
            onChange={(_event, value) => onTextInputChange(value)}
            onClear={(event) => {
              event.stopPropagation();
              onTextInputChange('');
            }}
            placeholder='Find by name'
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      <MenuContent maxMenuHeight='300px'>
        <MenuList>{templateMenuItems}</MenuList>
      </MenuContent>
    </Menu>
  );

  if (isError)
    return (
      <Alert title='Templates unavailable' variant='danger' isInline>
        Templates cannot be reached, try again later.
      </Alert>
    );

  return (
    <MenuContainer
      menu={menu}
      menuRef={menuRef}
      toggle={toggle}
      toggleRef={toggleRef}
      isOpen={isOpen}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      onOpenChangeKeys={['Escape']}
    />
  );
};

export default Templates;
