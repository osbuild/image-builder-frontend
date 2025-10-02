import { v4 as uuidv4 } from 'uuid';

import { FIRST_BOOT_SERVICE } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { Filesystem, Services } from '../../../../../store/imageBuilderApi';
import {
  addKernelArg,
  addPackage,
  addPartition,
  changeDisabledServices,
  changeEnabledServices,
  changeFscMode,
  changeMaskedServices,
  clearKernelAppend,
  clearPartitions,
  removePackage,
  selectServices,
} from '../../../../../store/wizardSlice';
import { parseSizeUnit } from '../../../utilities/parseSizeUnit';
import { FilesystemPartition, Units } from '../../FileSystem/fscTypes';

export const useSelectorHandlers = () => {
  const dispatch = useAppDispatch();
  const existingServices = useAppSelector(selectServices);

  const clearCompliancePackages = (oscapPackages: string[]) => {
    for (const pkg of oscapPackages) {
      dispatch(removePackage(pkg));
    }
  };

  const handleKernelAppend = (kernelAppend: string | undefined) => {
    dispatch(clearKernelAppend());

    if (kernelAppend) {
      const kernelArgsArray = kernelAppend.split(' ');
      for (const arg of kernelArgsArray) {
        dispatch(addKernelArg(arg));
      }
    }
  };

  const handlePackages = (
    oldOscapPackages: string[],
    newOscapPackages: string[],
    reason: string,
  ) => {
    clearCompliancePackages(oldOscapPackages);

    for (const pkg of newOscapPackages) {
      dispatch(
        addPackage({
          name: pkg,
          summary: reason,
          repository: 'distro',
        }),
      );
    }
  };

  const handlePartitions = (oscapPartitions: Filesystem[]) => {
    dispatch(clearPartitions());

    const newPartitions = oscapPartitions.map((filesystem) => {
      const [size, unit] = parseSizeUnit(filesystem.min_size);
      const partition: FilesystemPartition = {
        mountpoint: filesystem.mountpoint,
        min_size: size.toString(),
        unit: unit as Units,
        id: uuidv4(),
      };
      return partition;
    });

    if (newPartitions.length > 0) {
      dispatch(changeFscMode('basic'));
      for (const partition of newPartitions) {
        dispatch(addPartition(partition));
      }
    }
  };

  const handleServices = (services: Services | undefined) => {
    let enabled = services?.enabled || [];
    if (existingServices.enabled.includes(FIRST_BOOT_SERVICE)) {
      enabled = [...enabled, FIRST_BOOT_SERVICE];
    }

    dispatch(changeEnabledServices(enabled));
    dispatch(changeMaskedServices(services?.masked || []));
    dispatch(changeDisabledServices(services?.disabled || []));
  };

  return {
    clearCompliancePackages,
    handleKernelAppend,
    handlePackages,
    handleServices,
    handlePartitions,
  };
};
