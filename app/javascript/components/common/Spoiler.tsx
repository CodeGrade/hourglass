import React, { useState } from 'react';
import Tooltip from '@hourglass/workflows/student/exams/show/components/Tooltip';

const Spoiler: React.FC<{
  text: string;
  openAll?: boolean
}> = (props) => {
  const {
    text,
    openAll = false,
  } = props;
  const [open, setOpen] = useState(false);
  const isOpen = open || openAll;
  return (
    <Tooltip
      message={`${isOpen ? 'Hide' : 'Show'} student name`}
    >
      <span
        role="presentation"
        onKeyUp={() => setOpen((o) => !o)}
        onClick={() => setOpen((o) => !o)}
        className={`spoiler ${isOpen ? 'show' : 'hide'}`}
      >
        <span>{text}</span>
      </span>
    </Tooltip>
  );
};

export default Spoiler;
