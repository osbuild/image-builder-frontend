import React, { useState } from 'react';
import { Button, ExpandableSection, Text, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const AzureAuthExpandable = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      <ExpandableSection
        className="azureAuthExpandable"
        toggleText={
          <Title headingLevel="h3">Authorizing an Azure account</Title>
        }
        onToggle={() => setExpanded(!expanded)}
        isExpanded={expanded}
      >
        <Text>
          To authorize Image Builder to push images to Microsoft Azure, the
          account owner must configure Image Builder as an authorized
          application for a specific tenant ID and give it the role of
          &quot;Contributor&quot; to at least one resource group.
          <br />
        </Text>
        <small>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow"
          >
            Learn more about OAuth 2.0
          </Button>
        </small>
      </ExpandableSection>
    </>
  );
};

export default AzureAuthExpandable;
