import React from 'react';
import {
  Row, Col, Table,
} from 'react-bootstrap';
import { MatchingInfo, MatchingState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

interface MatchingProps {
  info: MatchingInfo;
  value: MatchingState;
}

const Matching: React.FC<MatchingProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const {
    promptLabel, prompts, valuesLabel, values,
  } = info;
  return (
    <Row>
      <Col>
        <Table>
          <thead>
            <tr>
              <th colSpan={2}>
                <p><HTML value={promptLabel ?? 'Column A'} /></p>
              </th>
              <th colSpan={2}>
                <p><HTML value={valuesLabel ?? 'Answer'} /></p>
              </th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((p, i) => {
              const valueI = value?.[i] ?? -1;
              return (
                // Prompt indices are STATIC.
                // eslint-disable-next-line react/no-array-index-key
                <tr key={i}>
                  <td>
                    {String.fromCharCode(65 + i)}
                    .
                  </td>
                  <td>{p}</td>
                  <td>
                    {valueI === -1 ? 'None' : `Option ${valueI + 1}`}
                  </td>
                  <td>
                    {valueI === -1 ? '' : values[valueI]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default Matching;
