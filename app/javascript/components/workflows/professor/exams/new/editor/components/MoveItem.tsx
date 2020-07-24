import React from 'react';
import {
  ButtonGroup,
  Button,
  ButtonProps,
} from 'react-bootstrap';
import { FaChevronUp, FaChevronDown, FaTrashAlt } from 'react-icons/fa';

export interface MoveProps {
  enableUp?: boolean;
  enableDown?: boolean;
  variant?: ButtonProps['variant'];
  visible: boolean;
  onUp?: () => void;
  onDown?: () => void;
  onDelete?: () => void;
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
  } = props;
  return (
    <div
      className={`float-left size-0 ${visible ? '' : 'd-none'}`}
    >
      <div className="float-left">
        <ButtonGroup
          vertical
          className="m-0 p-0 z-1000 bg-white rounded position-relative overhang-left-100"
        >
          <Button
            variant={variant}
            disabled={!enableUp}
            onClick={onUp}
            title="Move up"
          >
            <FaChevronUp />
          </Button>
          <Button
            variant={variant}
            disabled={!enableDown}
            onClick={onDown}
            title="Move down"
          >
            <FaChevronDown />
          </Button>
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
