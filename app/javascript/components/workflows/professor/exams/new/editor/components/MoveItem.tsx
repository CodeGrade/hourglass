import React, { useState } from 'react';
import {
  ButtonGroup,
  Button,
  ButtonProps,
} from 'react-bootstrap';
import {
  FaChevronUp,
  FaChevronDown,
  FaTrashAlt,
  FaCopy,
} from 'react-icons/fa';

export interface MoveProps {
  enableUp?: boolean;
  enableDown?: boolean;
  variant?: ButtonProps['variant'];
  visible: boolean;
  onUp?: () => void;
  onDown?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

const MoveItem: React.FC<MoveProps> = (props) => {
  const {
    enableUp,
    enableDown,
    variant,
    visible,
    onUp,
    onDown,
    onDelete,
    onCopy,
  } = props;
  const [forceVisible, setForceVisible] = useState(false);
  return (
    <div
      className={`float-left size-0 ${visible || forceVisible ? '' : 'd-none'}`}
    >
      <div
        className="float-left"
        onMouseOver={() => setForceVisible(true)}
        onMouseOut={() => setForceVisible(false)}
        onFocus={() => setForceVisible(true)}
        onBlur={() => setForceVisible(false)}
      >
        <ButtonGroup
          vertical
          className="m-0 p-0 z-1000 bg-white rounded position-relative overhang-left-100"
        >
          <Button
            variant={variant}
            disabled={!enableUp}
            className={enableUp ? '' : 'pointer-events-none'}
            onClick={onUp}
            title="Move up"
          >
            <FaChevronUp />
          </Button>
          <Button
            variant={variant}
            disabled={!enableDown}
            className={enableDown ? '' : 'pointer-events-none'}
            onClick={onDown}
            title="Move down"
          >
            <FaChevronDown />
          </Button>
          {onCopy && (
          <Button
            variant={variant}
            onClick={onCopy}
            title="Copy"
          >
            <FaCopy />
          </Button>
          )}
          <Button
            variant="danger"
            onClick={onDelete}
            title="Delete"
          >
            <FaTrashAlt />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default MoveItem;
