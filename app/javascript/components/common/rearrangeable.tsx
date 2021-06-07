import { AlertProps } from 'react-bootstrap';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
  XYCoord,
} from 'react-dnd';

export function arrSplice<T>(arr: readonly T[], from: number, to: number): T[] {
  const ret = [...arr];

  if (from < 0 || to < 0 || from >= arr.length || to >= arr.length) {
    return ret;
  }

  ret.splice(to, 0, ...ret.splice(from, 1));
  return ret;
}

// This type allows clients of RearrangeableList to manage ids, in case they're not
// managed by React or the database itself
export type IdArray = {
  ids: string[];
  base: string;
  current: number;
}

// Gensyms the next id from the current id array
// Updates the id array counter to the next value
function nextId(ids : IdArray): string {
  // eslint-disable-next-line no-param-reassign
  ids.current += 1;
  return `${ids.base}_${ids.current}`;
}

// Looksup the appropriate id for the current index, or generates one
// Updates the id array with the appropriate id
export function idForIndex(ids: IdArray, index: number): string {
  if (ids.ids[index]) {
    return ids.ids[index];
  }
  // eslint-disable-next-line no-param-reassign
  ids.ids[index] = nextId(ids);
  return ids.ids[index];
}

export interface RearrangeableListProps<T extends { id: string }> {
  dbArray: readonly T[];
  identifier: string;
  onRearrange: (from: number, to: number) => void;
  className?: string;
  disabled?: boolean;
  dropVariant?: AlertProps['variant'];
  children: (item: T, handleRef: React.Ref<HTMLElement>, isDragging: boolean) => ReactNode;
}

export function RearrangeableList<T extends { id: string }>(
  props: React.PropsWithChildren<RearrangeableListProps<T>>,
): React.ReactElement {
  const {
    dbArray,
    identifier,
    onRearrange,
    disabled = false,
    className,
    dropVariant,
    children,
  } = props;
  const [order, setOrder] = useState<string[]>(() => []);
  useEffect(() => {
    setOrder(dbArray.map((dbItem) => dbItem.id));
  }, [dbArray]);
  const cancel = useCallback(() => setOrder(dbArray.map((dbItem) => dbItem.id)), [dbArray]);
  const idToDbItemMap: Record<string, T> = {};
  dbArray.forEach((dbItem) => {
    idToDbItemMap[dbItem.id] = dbItem;
  });
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setOrder(arrSplice(order, dragIndex, hoverIndex));
  }, [order]);
  return (
    <>
      {order.map((id, index) => (
        <RearrangeableItem
          key={id}
          disabled={disabled}
          identifier={identifier}
          moveItem={moveItem}
          index={index}
          className={className}
          dropVariant={dropVariant}
          onRearrange={onRearrange}
          onCancel={cancel}
        >
          {(handleRef, isDragging) => (idToDbItemMap[id]
            // if an item was deleted, it will take 2 render cycles for `order` to catch up
            ? children(idToDbItemMap[id], handleRef, isDragging)
            : null)}
        </RearrangeableItem>
      ))}
    </>
  );
}

interface DropItem {
  startIndex: number;
  index: number;
  type: string;
}

const RearrangeableItem: React.FC<{
  identifier: string;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  index: number;
  onRearrange: (from: number, to: number) => void;
  onCancel: () => void;
  disabled?: boolean;
  className?: string;
  dropVariant?: AlertProps['variant'];
  children: (handleRef: React.Ref<HTMLElement>, isDragging: boolean) => ReactNode;
}> = (props) => {
  // Borrowed from:
  // https://react-dnd.github.io/react-dnd/examples/sortable/simple
  const {
    identifier,
    moveItem,
    index,
    onRearrange,
    onCancel,
    disabled = false,
    children,
    className = '',
    dropVariant,
  } = props;
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLElement>(null);
  const [{ handlerId, isOver, canDrop }, drop] = useDrop({
    accept: identifier,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    hover(item: DropItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      if (disabled) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      // eslint-disable-next-line no-param-reassign
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: identifier, index, startIndex: index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: DropItem, monitor) => {
      if (item.startIndex === item.index || !monitor.didDrop()) {
        onCancel();
        return;
      }
      onRearrange(item.startIndex, item.index);
    },
  });
  const opacity = isDragging ? 0 : 1;
  const variant = (isDragging && isOver && canDrop && dropVariant) ? `alert-${dropVariant}` : '';
  drag(handleRef);
  preview(drop(ref));
  return (
    <div ref={ref} style={{ opacity: Math.max(0.5, opacity) }} className={`${variant} ${className}`} data-handler-id={handlerId}>
      <div style={{ opacity }}>
        {children(handleRef, isDragging)}
      </div>
    </div>
  );
};
