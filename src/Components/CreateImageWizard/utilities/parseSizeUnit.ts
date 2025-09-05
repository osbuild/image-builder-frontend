import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../constants';
import { Units } from '../steps/FileSystem/fscTypes';

export const parseSizeUnit = (bytesize: string) => {
  let size;
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
  } else if (parseInt(bytesize)) {
    size = parseInt(bytesize);
    unit = 'B';
  } else {
    size = 10;
    unit = 'GiB';
  }

  return [String(size), unit];
};
