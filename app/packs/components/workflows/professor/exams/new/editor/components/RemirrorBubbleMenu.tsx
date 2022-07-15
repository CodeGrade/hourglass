import React from 'react';
import { FloatingToolbar, ToolbarItemUnion } from '@remirror/react';

/**
 * Bubble menu for the pre-packaged editors
 */
export const BubbleMenu: React.FC<{
  items: ToolbarItemUnion[],
  enabled?: boolean,
}> = (props) => {
  const { 
    items,
    enabled,
  } = props;
  return (
    <FloatingToolbar
      displayArrow
      renderOutsideEditor={false}
      enabled={enabled}
      items={items}
      positioner='selection'
      placement='top'
      />
  );
};
