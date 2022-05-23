import React, { useRef } from 'react';
import Radio from '@data-driven-forms/pf4-component-mapper/radio';
import PropTypes from 'prop-types';

const RadioWithPopover = ({ Popover, ...props }) => {
  const ref = useRef();
  return (
    <Radio
      {...props}
      label={
        <span ref={ref} className="ins-c-image--builder__popover">
          {props.label}
          <Popover />
        </span>
      }
    />
  );
};

RadioWithPopover.propTypes = {
  Popover: PropTypes.elementType.isRequired,
  label: PropTypes.node,
};

export default RadioWithPopover;
