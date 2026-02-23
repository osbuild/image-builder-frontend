import React from 'react';

import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

type RetirementDateProps = {
  date: string | undefined;
};

const RetirementDate = ({ date }: RetirementDateProps) => {
  if (!date) {
    return <>N/A</>;
  }

  const retirementDate = new Date(date);

  const currentDate = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const differenceInDays = Math.round(
    (retirementDate.getTime() - currentDate.getTime()) / msPerDay,
  );

  let icon;

  switch (true) {
    case differenceInDays < 0:
      icon = (
        <Icon status='danger' isInline>
          <ExclamationCircleIcon />
        </Icon>
      );
      break;
    case differenceInDays <= 365:
      icon = (
        <Icon status='warning' isInline>
          <ExclamationTriangleIcon />
        </Icon>
      );
      break;
    case differenceInDays > 365:
      icon = (
        <Icon status='success' isInline>
          <CheckCircleIcon />
        </Icon>
      );
      break;
  }

  return (
    <>
      {icon}{' '}
      {retirementDate.toLocaleString('en-US', { month: 'short' }) +
        ' ' +
        retirementDate.getFullYear()}
    </>
  );
};

export default RetirementDate;
