import React, { useMemo } from 'react';

import { Button, Divider, Popover } from '@patternfly/react-core';
import { createSelector } from '@reduxjs/toolkit';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { selectComposeById, selectImagesById } from '../../store/composesSlice';
import { useGetEnvironment } from '../../Utilities/useGetEnvironment';
import BetaLabel from '../sharedComponents/BetaLabel';

export const selectRegions = createSelector(
  [selectComposeById, selectImagesById],
  (compose, images) => {
    const filteredImages = images.filter(
      (image) =>
        compose.share_with_accounts &&
        compose.share_with_accounts[0] === image.share_with_accounts[0]
    );

    const regions = {};
    filteredImages.forEach((image) => {
      if (image.region && image.status === 'success') {
        if (regions[image.region]) {
          if (
            new Date(image.created_at) >
            new Date(regions[image.region].created_at)
          ) {
            regions[image.region] = {
              ami: image.ami,
              created_at: image.created_at,
            };
          }
        } else {
          regions[image.region] = {
            ami: image.ami,
            created_at: image.created_at,
          };
        }
      }
    });

    return regions;
  }
);

const ImageLinkRegion = ({ region, ami }) => {
  const url =
    'https://console.aws.amazon.com/ec2/v2/home?region=' +
    region +
    '#LaunchInstanceWizard:ami=' +
    ami;

  return (
    <Button component="a" target="_blank" variant="link" isInline href={url}>
      {region}
    </Button>
  );
};

export const RegionsPopover = ({ composeId }) => {
  const { isBeta } = useGetEnvironment();
  const regions = useSelector((state) => selectRegions(state, composeId));

  const listItems = useMemo(() => {
    const listItems = [];
    for (const [key, value] of Object.entries(regions).sort()) {
      listItems.push(
        <li key={key}>
          <ImageLinkRegion region={key} ami={value.ami} />
        </li>
      );
    }
    return listItems;
  }, [regions]);

  const compose = useSelector((state) => selectComposeById(state, composeId));
  const createdInPreview = compose?.share_with_sources?.[0] ? true : false;

  return (
    <Popover
      /* popovers aren't rendered inside of the main page section, make sure our prefixed css still
       * applies */
      className="imageBuilder"
      aria-label="Launch instance"
      headerContent={<div>Launch instance</div>}
      bodyContent={
        <>
          <ul>{listItems}</ul>
          {!isBeta() && (
            <>
              {createdInPreview && (
                <p>
                  This image was created using features only available in
                  Preview.
                </p>
              )}
              <Divider className="pf-u-mt-sm pf-u-mb-sm" />
              <Button
                isInline
                component="a"
                variant="link"
                href="/preview/insights/image-builder/landing"
              >
                <BetaLabel />
                Launch from Preview
              </Button>
            </>
          )}
        </>
      }
    >
      <Button variant="link" isInline>
        Launch
      </Button>
    </Popover>
  );
};

ImageLinkRegion.propTypes = {
  region: PropTypes.string,
  ami: PropTypes.string,
};

RegionsPopover.propTypes = {
  composeId: PropTypes.string,
};
