import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type ImageInfo = {
  name: string;
  size: string;
  last_updated: string;
  sha_256_checksum: string;
};

type DownloadImageCardProps = {
  title: string;
  link: string;
  info: ImageInfo;
};

const DownloadImageCard = ({ title, link, info }: DownloadImageCardProps) => {
  return (
    <Card>
      <CardHeader
        actions={{
          actions: (
            <Popover
              position='right'
              headerContent='Details'
              bodyContent={
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>File name</DescriptionListTerm>
                    <DescriptionListDescription>
                      {info.name || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>File size</DescriptionListTerm>
                    <DescriptionListDescription>
                      {info.size || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Last updated</DescriptionListTerm>
                    <DescriptionListDescription>
                      {info.last_updated || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>SHA-256-checksum</DescriptionListTerm>
                    <DescriptionListDescription>
                      {info.sha_256_checksum || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              }
            >
              <Button
                icon={<HelpIcon />}
                variant='plain'
                size='sm'
                aria-label={`About ${title}`}
                hasNoPadding
              />
            </Popover>
          ),
        }}
      >
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        <Button
          target='_blank'
          variant='primary'
          isInline
          href={link}
          onClick={() => {}}
        >
          Download image
        </Button>
      </CardBody>
    </Card>
  );
};

export default DownloadImageCard;
