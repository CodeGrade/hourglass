import React from 'react';
import {
  ButtonGroup,
  Button,
  ButtonProps,
} from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

export interface MoveProps {
  enableUp?: boolean;
  enableDown?: boolean;
  variant?: ButtonProps['variant'];
  visible: boolean;
  onUp?: () => void;
  onDown?: () => void;
}

const MoveItem: React.FC<MoveProps> = (props) => {
  const {
    enableUp,
    enableDown,
    variant,
    visible,
    onUp,
    onDown,
  } = props;
  return (
    <div className={`position-absolute ${visible ? '' : 'd-none'}`}>
      <ButtonGroup
        vertical
        className="m-0 p-0 bg-white rounded position-relative"
        style={{ left: '-100%' }}
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
      </ButtonGroup>
    </div>
  );
};

export default MoveItem;
