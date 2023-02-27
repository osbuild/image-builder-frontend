import React from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';

const GalleryLayout = ({ fields, minWidths, maxWidths }) => {
  const { renderForm } = useFormApi();

  return (
    <Gallery minWidths={minWidths} maxWidths={maxWidths} hasGutter>
      {fields.map((field) => (
        <GalleryItem key={field.name}>{renderForm([field])}</GalleryItem>
      ))}
    </Gallery>
  );
};

GalleryLayout.propTypes = {
  fields: PropTypes.array,
  maxWidths: PropTypes.object,
  minWidths: PropTypes.object,
};

export default GalleryLayout;
