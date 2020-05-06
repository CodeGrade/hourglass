import React from 'react';
import { Row, Col } from 'react-bootstrap';

export interface HTMLProps {
  value: string;
}

const HTML: React.FC<HTMLProps> = (props) => {
  const { value } = props;
  return (
    <Row>
      <Col>
        <div
          className="no-hover"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </Col>
    </Row>
  );
};

export default HTML;
