import { Distributions, ImageRequest } from '@/store/api/backend';

// TODO: this can be converted into a derived selector once we've
// moved all the other wizard slices to their own submodule, it's
// too complicated to do now
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

  const dateTimeString = `${year}${month}${day}-${hours}${minutes}`;

  return `${distribution}-${arch}-${dateTimeString}`;
};
