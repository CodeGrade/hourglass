import React from 'react';
import {
  Row,
  Col,
} from 'react-bootstrap';
import { MatchingProps } from '@proctor/registrations/show/questions/DisplayMatching';
import HTML from '@student/exams/show/components/HTML';
import { alphabetIdx } from '@hourglass/common/helpers';

const GradeMatching: React.FC<MatchingProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const {
    promptsLabel,
    prompts,
    valuesLabel,
    values,
  } = info;
  return (
    <>
      <Row>
        <Col sm={6}>
          <HTML
            value={promptsLabel ?? {
              type: 'HTML',
              value: 'Column A',
            }}
          />
        </Col>
        <Col>
          <HTML
            value={valuesLabel ?? {
              type: 'HTML',
              value: 'Answer',
            }}
          />
        </Col>
      </Row>
      <hr />
      {prompts.map((p, i) => {
        const valueI = value?.[i] ?? -1;
        return (
          // Prompt indices are STATIC.
          // eslint-disable-next-line react/no-array-index-key
          <Row key={i}>
            <Col>
              <span className="mr-2">
                {`${alphabetIdx(i)}.`}
              </span>
              <div className="d-inline-block"><HTML value={p} /></div>
            </Col>
            <Col sm="auto">
              <span className="mr-2">{valueI === -1 ? 'None' : `Option ${valueI + 1}`}</span>
              <div className="d-inline-block">{valueI === -1 ? '' : <HTML value={values[valueI]} />}</div>
            </Col>
          </Row>
        );
      })}
    </>
  );
};

export default GradeMatching;
