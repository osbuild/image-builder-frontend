import React, { useRef, useState } from 'react';

import styles from '@patternfly/react-styles/css/components/Table/table';
import {
  Table,
  Tbody,
  TbodyProps,
  Th,
  Thead,
  Tr,
  TrProps,
} from '@patternfly/react-table';

import MinimumSizePopover from './MinimumSizePopover';
import Row from './Row';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changePartitionOrder,
  selectFilesystemPartitions,
} from '../../../../../store/wizardSlice';

const FileSystemTable = () => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggingToItemIndex, setDraggingToItemIndex] = useState<number | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [tempItemOrder, setTempItemOrder] = useState<string[]>([]);

  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const partitions = useAppSelector(selectFilesystemPartitions);
  const itemOrder = partitions.map((partition) => partition.id);
  const dispatch = useAppDispatch();
  const isValidDrop = (
    evt: React.DragEvent<HTMLTableSectionElement | HTMLTableRowElement>,
  ) => {
    const ulRect = bodyRef.current?.getBoundingClientRect();
    if (!ulRect) return false;
    return (
      evt.clientX > ulRect.x &&
      evt.clientX < ulRect.x + ulRect.width &&
      evt.clientY > ulRect.y &&
      evt.clientY < ulRect.y + ulRect.height
    );
  };

  const onDragStart: TrProps['onDragStart'] = (evt) => {
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/plain', evt.currentTarget.id);
    const draggedItemId = evt.currentTarget.id;

    evt.currentTarget.classList.add(styles.modifiers.ghostRow);
    evt.currentTarget.setAttribute('aria-pressed', 'true');

    setDraggedItemId(draggedItemId);
    setIsDragging(true);
  };

  const onDragCancel = () => {
    const children = bodyRef.current?.children;
    if (children) {
      Array.from(children).forEach((el) => {
        el.classList.remove(styles.modifiers.ghostRow);
        el.setAttribute('aria-pressed', 'false');
      });
    }
    setDraggedItemId(null);
    setDraggingToItemIndex(null);
    setIsDragging(false);
  };

  const onDragLeave: TbodyProps['onDragLeave'] = (evt) => {
    if (!isValidDrop(evt)) {
      move(itemOrder);
      setDraggingToItemIndex(null);
    }
  };

  const onDrop: TrProps['onDrop'] = (evt) => {
    if (isValidDrop(evt)) {
      dispatch(changePartitionOrder(tempItemOrder));
    } else {
      onDragCancel();
    }
  };

  const onDragOver: TbodyProps['onDragOver'] = (evt) => {
    evt.preventDefault();

    const curListItem = (evt.target as HTMLTableSectionElement).closest('tr');
    if (
      !curListItem ||
      !bodyRef.current?.contains(curListItem) ||
      curListItem.id === draggedItemId
    ) {
      return null;
    }
    const dragId = curListItem.id;
    const newDraggingToItemIndex = Array.from(
      bodyRef.current.children,
    ).findIndex((item) => item.id === dragId);
    if (newDraggingToItemIndex !== draggingToItemIndex && draggedItemId) {
      const tempItemOrder = moveItem(
        [...itemOrder],
        draggedItemId,
        newDraggingToItemIndex,
      );
      move(tempItemOrder);
      setDraggingToItemIndex(newDraggingToItemIndex);
      setTempItemOrder(tempItemOrder);
    }
  };

  const onDragEnd: TrProps['onDragEnd'] = (evt) => {
    const target = evt.target as HTMLTableRowElement;
    target.classList.remove(styles.modifiers.ghostRow);
    target.setAttribute('aria-pressed', 'false');
    setDraggedItemId(null);
    setDraggingToItemIndex(null);
    setIsDragging(false);
  };

  const moveItem = (arr: string[], i1: string, toIndex: number) => {
    const fromIndex = arr.indexOf(i1);
    if (fromIndex === toIndex) {
      return arr;
    }
    const temp = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, temp[0]);

    return arr;
  };

  const move = (itemOrder: string[]) => {
    const ulNode = bodyRef.current;
    if (!ulNode) {
      return;
    }
    const nodes = Array.from(ulNode.children);
    if (nodes.map((node) => node.id).every((id, i) => id === itemOrder[i])) {
      return;
    }
    while (ulNode.firstChild) {
      ulNode.removeChild(ulNode.lastChild as Node);
    }

    itemOrder.forEach((id) => {
      const node = nodes.find((n) => n.id === id);
      if (node) {
        ulNode.appendChild(node);
      }
    });
  };

  return (
    <Table
      className={isDragging ? styles.modifiers.dragOver : ''}
      aria-label='File system table'
      variant='compact'
    >
      <Thead>
        <Tr>
          <Th aria-label='Drag mount point' />
          <Th>Mount point</Th>
          <Th aria-label='Suffix'>Suffix</Th>
          <Th>Type</Th>
          <Th>
            Minimum size <MinimumSizePopover />
          </Th>
          <Th aria-label='Unit'>Unit</Th>
          <Th aria-label='Remove mount point' />
        </Tr>
      </Thead>

      <Tbody
        onDragOver={onDragOver}
        onDrop={onDragOver}
        onDragLeave={onDragLeave}
        ref={bodyRef}
      >
        {partitions.length > 0 &&
          partitions.map((partition) => (
            <Row
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              key={partition.id}
              partition={partition}
            />
          ))}
      </Tbody>
    </Table>
  );
};

export default FileSystemTable;
