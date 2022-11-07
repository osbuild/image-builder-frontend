import React, { useEffect, useState } from 'react';
import {
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
} from '@patternfly/react-core';
import { useFormApi } from '@data-driven-forms/react-form-renderer';
import { Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import api from '../../../api';

const ActivationKeyInformation = () => {
  const { getState } = useFormApi();

  const activationKey = getState()?.values?.['subscription-activation-key'];
  const [role, setRole] = useState(undefined);
  const [serviceLevel, setServiceLevel] = useState(undefined);
  const [usage, setUsage] = useState(undefined);
  const [additionalRepositories, setRepositories] = useState(undefined);

  useEffect(() => {
    const fetchKeyInformation = async () => {
      const data = await api.getActivationKey(activationKey);
      setRole(data?.role);
      setServiceLevel(data?.serviceLevel);
      setUsage(data?.usage);
      setRepositories(data?.additionalRepositories);
    };
    fetchKeyInformation();
  }, []);

  return (
    <>
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <TextListItem component={TextListItemVariants.dt}>Name:</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {activationKey}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dt}>Role:</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {role || 'Not defined'}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dt}>SLA:</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {serviceLevel || 'Not defined'}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dt}>
            Usage:
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {usage || 'Not defined'}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dt}>
            Additional <br /> repositories:
            <Popover
              bodyContent={
                <TextContent>
                  <Text>
                    The core repositories for your operating system version are
                    always enabled and do not need to be explicitly added to the
                    activation key.
                  </Text>
                </TextContent>
              }
            >
              <Button
                variant="plain"
                aria-label="About additional repositories"
                className="pf-u-pl-sm pf-u-pt-0 pf-u-pb-0"
                isSmall
              >
                <HelpIcon />
              </Button>
            </Popover>
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dd}
            className="pf-u-display-flex pf-u-align-items-flex-end"
          >
            {additionalRepositories?.length > 0 ? (
              <Popover
                bodyContent={
                  <TextContent>
                    <Text component={TextVariants.h3}>
                      Additional repositories
                    </Text>
                    <TableComposable
                      aria-label="Additional repositories table"
                      variant="compact"
                    >
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                        </Tr>
                      </Thead>
                      <Tbody data-testid="additional-repositories-table">
                        {additionalRepositories?.map((repo, index) => (
                          <Tr key={index}>
                            <Td>{repo.repositoryLabel}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </TableComposable>
                  </TextContent>
                }
              >
                <Button
                  data-testid="repositories-popover-button"
                  variant="link"
                  aria-label="Show additional repositories"
                  className="pf-u-pl-0 pf-u-pt-0 pf-u-pb-0"
                >
                  {additionalRepositories?.length} repositories
                </Button>
              </Popover>
            ) : (
              'None'
            )}
          </TextListItem>
        </TextList>
      </TextContent>
    </>
  );
};

export default ActivationKeyInformation;
