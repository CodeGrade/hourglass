import React, {
  ReactNode,
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

function arrSplice<T>(arr: readonly T[], from: number, to: number): T[] {
  const firstIndex = Math.min(from, to);
  const secondIndex = Math.max(from, to);
  const distance = secondIndex - firstIndex + 1;
  const spliced = [...arr];
  const cycle = spliced.splice(firstIndex, distance);
  if (from < to) {
    cycle.push(cycle.shift());
  } else {
    cycle.unshift(cycle.pop());
  }
  spliced.splice(firstIndex, 0, ...cycle);
  return spliced;
}

interface RearrangeableListProps<T extends { id: string }> {
  dbArray: readonly T[];
  identifier: string;
  onRearrange: (from: number, to: number) => void;
  children: (item: T) => ReactNode;
}

export default function RearrangableList<T extends { id: string }>(
  props: React.PropsWithChildren<RearrangeableListProps<T>>,
): React.ReactElement {
  const {
    dbArray,
    identifier,
    onRearrange,
    children,
  } = props;
  const [order, setOrder] = useState<string[]>(() => []);
  useEffect(() => {
    setOrder(dbArray.map((dbItem) => dbItem.id));
  }, [dbArray]);
  const idToDbItemMap: Record<string, T> = {};
  dbArray.forEach((dbItem) => {
    idToDbItemMap[dbItem.id] = dbItem;
  });
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    setOrder(arrSplice(order, dragIndex, hoverIndex));
  };
  return (
    <>
      {order.map((id, index) => (
        <RearrangeableItem
          key={id}
          identifier={identifier}
          moveItem={moveItem}
          index={index}
          onRearrange={onRearrange}
        >
          {idToDbItemMap[id]
          // if an item was deleted, it will take 2 render cycles for `order` to catch up
            ? children(idToDbItemMap[id])
            : null}
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
}> = (props) => {
  // Borrowed from:
  // https://react-dnd.github.io/react-dnd/examples/sortable/simple
  const {
    identifier,
    moveItem,
    index,
    onRearrange,
    children,
  } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: identifier,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover(item: DropItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
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
  const [{ isDragging }, drag] = useDrag({
    item: { type: identifier, index, startIndex: index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: DropItem, _monitor) => {
      onRearrange(item.startIndex, item.index);
    },
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <div ref={ref} style={{ opacity }} className="cursor-move" data-handler-id={handlerId}>
      {children}
    </div>
  );
};
