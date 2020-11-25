import React, { useState } from 'react';
import Tooltip from '@student/exams/show/components/Tooltip';

const Spoiler: React.FC<{
  text: string;
  openAll?: boolean;
  // curent toggle state => true if toggling should be cancelled
  beforeToggle?: (curOpen: boolean) => boolean;
  // new toggle state => void
  onToggle?: (newOpen: boolean) => void;
}> = (props) => {
  const {
    text,
    openAll = false,
    beforeToggle,
    onToggle,
  } = props;
  const [open, setOpen] = useState(false);
  const isOpen = open || openAll;
  const toggle = () => {
    if (beforeToggle && beforeToggle(open)) return;
    const newOpen = !open;
    setOpen(newOpen);
    if (onToggle) onToggle(newOpen);
  };
  return (
    <Tooltip
      message={`${isOpen ? 'Hide' : 'Show'} student name`}
    >
      <span
        role="presentation"
        onKeyUp={toggle}
        onClick={toggle}
        className={`spoiler ${isOpen ? 'show' : 'hide'}`}
      >
        <span>{text}</span>
      </span>
    </Tooltip>
  );
};

export default Spoiler;
