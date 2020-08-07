import React from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import Tooltip from '@student/exams/show/components/Tooltip';
import './index.scss';

export const NewMessages: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <Tooltip
    message="Click to mark messages read"
  >
    <Button
      block
      variant="outline-light"
      className="text-dark"
      as="div"
      onClick={onClick}
    >
      <Row className="m-0 fancy-hr">
        <Col>
          <hr className="fancy-left-warning" />
        </Col>
        <Col sm="auto" className="p-0 d-flex justify-content-center flex-column">
          New Messages
        </Col>
        <Col>
          <hr className="fancy-right-warning" />
        </Col>
      </Row>
    </Button>
  </Tooltip>
);

export const PreviousMessages: React.FC = () => (
  <Row className="m-0 fancy-hr">
    <Col>
      <hr className="fancy-left" />
    </Col>
    <Col sm="auto" className="p-0 d-flex justify-content-center flex-column">
      Previous messages
    </Col>
    <Col>
      <hr className="fancy-right" />
    </Col>
  </Row>
);
