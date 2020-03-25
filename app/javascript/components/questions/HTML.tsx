import React from "react";
import { Row, Col } from 'react-bootstrap';

export interface HTMLProps {
  value: string;
}

export function HTML(props: HTMLProps) {
  return (
    <Row>
      <Col>
        <div className="no-hover" dangerouslySetInnerHTML={{ __html: props.value }}></div>
      </Col>
    </Row>
  )
}

