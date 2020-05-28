import React from 'react';
import {
  ButtonGroup,
  Button,
} from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

export interface MoveProps {
  enableUp?: boolean;
  enableDown?: boolean;
  onUp?: () => void;
  onDown?: () => void;
}

const MoveItem: React.FC<MoveProps> = (props) => {
  const {
    enableUp,
    enableDown,
    onUp,
    onDown,
  } = props;
  return (
    <ButtonGroup className="mr-3">
      <Button disabled={!enableUp} onClick={onUp}><FaChevronUp /></Button>
      <Button disabled={!enableDown} onClick={onDown}><FaChevronDown /></Button>
    </ButtonGroup>
  );
};

export default MoveItem;
