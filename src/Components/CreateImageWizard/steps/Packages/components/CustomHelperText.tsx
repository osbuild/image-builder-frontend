import React from 'react';

import {
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
export type HelperTextVariant =
  | 'default'
  | 'indeterminate'
  | 'warning'
  | 'success'
  | 'error';

interface Props {
  variant?: HelperTextVariant;
  textValue?: string;
  defaultText?: string;
  hide?: boolean;
}

const CustomHelperText = ({
  hide = false,
  variant = 'error',
  textValue = '',
  defaultText = '',
}: Props) =>
  (!!textValue || !!defaultText) && !hide ? (
    <FormHelperText>
      <HelperText>
        <HelperTextItem icon={<ExclamationCircleIcon />} variant={variant}>
          {textValue ? textValue : defaultText}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  ) : (
    <></>
  );

export default CustomHelperText;
