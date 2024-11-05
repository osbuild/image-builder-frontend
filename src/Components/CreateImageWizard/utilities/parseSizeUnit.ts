import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../constants';
import { Units } from '../steps/FileSystem/FileSystemTable';

export const parseSizeUnit = (bytesize: string) => {
  let size: number = 10;
  let unit: Units = 'GiB';

  if (parseInt(bytesize) % UNIT_GIB === 0) {
    size = parseInt(bytesize) / UNIT_GIB;
    unit = 'GiB';
  } else if (parseInt(bytesize) % UNIT_MIB === 0) {
    size = parseInt(bytesize) / UNIT_MIB;
    unit = 'MiB';
  } else if (parseInt(bytesize) % UNIT_KIB === 0) {
    size = parseInt(bytesize) / UNIT_KIB;
    unit = 'KiB';
  }

  return [String(size), unit];
};
