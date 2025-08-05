import React, { useState } from 'react';

import {
  Button,
  Grid,
  Pagination,
  PaginationVariant,
  Panel,
  PanelMain,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import TemplatesEmpty from './TemplatesEmpty';

import { PAGINATION_COUNT } from '../../../../../constants';
import { useListTemplatesQuery } from '../../../../../store/contentSourcesApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeTemplate,
  changeTemplateName,
  selectArchitecture,
  selectDistribution,
  selectTemplate,
} from '../../../../../store/wizardSlice';
import { releaseToVersion } from '../../../../../Utilities/releaseToVersion';
import { Error } from '../../Repositories/components/Error';
import { Loading } from '../../Repositories/components/Loading';

const Templates = () => {
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const version = releaseToVersion(distribution);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const dispatch = useAppDispatch();
  const templateUuid = useAppSelector(selectTemplate);

  const {
    data: {
      data: templateList = [],
      meta: { count: templateCount } = { count: 0 },
    } = {},
    isError,
    isFetching,
    isLoading,
    refetch: refetchTemplates,
  } = useListTemplatesQuery(
    {
      arch: arch,
      version: version,
      limit: perPage,
      offset: perPage * (page - 1),
    },
    { refetchOnMountOrArgChange: 60 },
  );

  const handleRowSelect = (
    templateUuid: string | undefined,
    templateName: string | undefined,
  ): void => {
    if (templateUuid) {
      dispatch(changeTemplate(templateUuid));
    }
    if (templateName) {
      dispatch(changeTemplateName(templateName));
    }
  };

  const handlePerPageSelect = (
    _: React.MouseEvent,
    newPerPage: number,
    newPage: number,
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const refresh = () => {
    refetchTemplates();
  };

  if (isError) return <Error />;
  if (isLoading) return <Loading />;
  return (
    <Grid>
      <Panel>
        {templateList.length > 0 ? (
          <Button
            variant='primary'
            isInline
            onClick={() => refresh()}
            isLoading={isFetching}
          >
            {isFetching ? 'Refreshing' : 'Refresh'}
          </Button>
        ) : (
          <></>
        )}
        <PanelMain>
          {templateList.length === 0 ? (
            <TemplatesEmpty refetch={refresh} />
          ) : (
            <>
              <Pagination
                itemCount={templateCount ?? PAGINATION_COUNT}
                perPage={perPage}
                page={page}
                onSetPage={(_, newPage) => setPage(newPage)}
                onPerPageSelect={handlePerPageSelect}
                isCompact
              />
              <Table variant='compact'>
                <Thead>
                  <Tr>
                    <Th aria-label='Selected' />
                    <Th width={15}>Name</Th>
                    <Th width={50}>Description</Th>
                    <Th width={15}>Snapshot date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {templateList.map((template, rowIndex) => {
                    const { uuid, name, description, date, use_latest } =
                      template;

                    return (
                      <Tr key={uuid}>
                        <Td
                          select={{
                            variant: 'radio',
                            isSelected: uuid === templateUuid,
                            rowIndex: rowIndex,
                            onSelect: () => handleRowSelect(uuid, name),
                          }}
                        />
                        <Td dataLabel={'Name'}>{name}</Td>
                        <Td dataLabel={'Description'}>{description}</Td>
                        <Td dataLabel={'Snapshot date'}>
                          {use_latest ? 'Use latest' : date?.split('T')[0]}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
              <Pagination
                itemCount={templateCount ?? PAGINATION_COUNT}
                perPage={perPage}
                page={page}
                onSetPage={(_, newPage) => setPage(newPage)}
                onPerPageSelect={handlePerPageSelect}
                variant={PaginationVariant.bottom}
              />
            </>
          )}
        </PanelMain>
      </Panel>
    </Grid>
  );
};

export default Templates;
