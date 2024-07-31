import { ImageTypes } from '../../../store/imageBuilderApi';

export const generateDefaultName = (
  distribution: string,
  arch: string,
  targetEnvironments: ImageTypes[]
) => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${distribution} ${arch} ${targetEnvironments.join(
    ' '
  )} ${day} ${month} ${year}`;
};
