import React from 'react';

import { FormHelperText } from '@patternfly/react-core/dist/dynamic/components/Form';
import { HelperText } from '@patternfly/react-core/dist/dynamic/components/HelperText';
import { HelperTextItem } from '@patternfly/react-core/dist/dynamic/components/HelperText';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon';

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
