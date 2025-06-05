import { v4 as uuidv4 } from 'uuid';

import { useAppDispatch } from '../../../../../store/hooks';
import { Filesystem, Services } from '../../../../../store/imageBuilderApi';
import {
  addPackage,
  addPartition,
  changeDisabledServices,
  changeEnabledServices,
  changeFileSystemConfigurationType,
  changeMaskedServices,
  clearPartitions,
  removePackage,
} from '../../../../../store/wizardSlice';
import { parseSizeUnit } from '../../../utilities/parseSizeUnit';
import { Partition, Units } from '../../FileSystem/components/FileSystemTable';

export const useSelectorHandlers = () => {
  const dispatch = useAppDispatch();

  const clearCompliancePackages = (oscapPackages: string[]) => {
    for (const pkg of oscapPackages) {
      dispatch(removePackage(pkg));
    }
  };

  const handlePackages = (
    oldOscapPackages: string[],
    newOscapPackages: string[],
    reason: string
  ) => {
    clearCompliancePackages(oldOscapPackages);

    for (const pkg of newOscapPackages) {
      dispatch(
        addPackage({
          name: pkg,
          summary: reason,
          repository: 'distro',
        })
      );
    }
  };

  const handlePartitions = (oscapPartitions: Filesystem[]) => {
    dispatch(clearPartitions());

    const newPartitions = oscapPartitions.map((filesystem) => {
      const [size, unit] = parseSizeUnit(filesystem.min_size);
      const partition: Partition = {
        mountpoint: filesystem.mountpoint,
        min_size: size.toString(),
        unit: unit as Units,
        id: uuidv4(),
      };
      return partition;
    });

    if (newPartitions.length > 0) {
      dispatch(changeFileSystemConfigurationType('manual'));
      for (const partition of newPartitions) {
        dispatch(addPartition(partition));
      }
    }
  };

  const handleServices = (services: Services | undefined) => {
    dispatch(changeEnabledServices(services?.enabled || []));
    dispatch(changeMaskedServices(services?.masked || []));
    dispatch(changeDisabledServices(services?.disabled || []));
  };

  return {
    clearCompliancePackages,
    handlePackages,
    handleServices,
    handlePartitions,
  };
};
