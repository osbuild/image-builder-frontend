import { Distributions, ImageRequest } from '../../../store/imageBuilderApi';

export const generateDefaultName = (
  distribution: Distributions,
  arch: ImageRequest['architecture'],
) => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const dateTimeString = `${month}${day}${year}-${hours}${minutes}`;

  return `${distribution}-${arch}-${dateTimeString}`;
};
