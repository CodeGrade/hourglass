import React from 'react';
import {
  Row, Col, Table,
} from 'react-bootstrap';
import { MatchingInfo, MatchingState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { alphabetIdx } from '@hourglass/common/helpers';

interface MatchingProps {
  info: MatchingInfo;
  value: MatchingState;
}

const DisplayMatching: React.FC<MatchingProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const {
    promptLabel,
    prompts,
    valuesLabel,
    values,
  } = info;
  return (
    <Row>
      <Col>
        <Table>
          <thead>
            <tr>
              <th colSpan={2}>
                <HTML
                  value={promptLabel ?? {
                    type: 'HTML',
                    value: 'Column A',
                  }}
                />
              </th>
              <th colSpan={2}>
                <HTML
                  value={valuesLabel ?? {
                    type: 'HTML',
                    value: 'Answer',
                  }}
                />
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
                    {alphabetIdx(i)}
                    .
                  </td>
                  <td><HTML value={p} /></td>
                  <td>
                    {valueI === -1 ? 'None' : `Option ${valueI + 1}`}
                  </td>
                  <td>
                    {valueI === -1 ? '' : <HTML value={values[valueI]} />}
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

export default DisplayMatching;
