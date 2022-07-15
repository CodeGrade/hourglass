import React from 'react';
import { 
  Toolbar,
  ToolbarItemUnion,
} from '@remirror/react';

export const TopToolbar: React.FC<{ 
  items: ToolbarItemUnion[],
  label?: string,
  refocusEditor?: boolean,
 }> = (props) => {
  const { 
    items,
    label,
    refocusEditor,
  } = props;
  return (
    <Toolbar
      items={items}
      refocusEditor={refocusEditor}
      label={label} 
    />
  );
};
