import React from 'react';
import {
  Row, Col, Table,
} from 'react-bootstrap';
import {
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import { MatchingInfo, MatchingState } from '@student/exams/show/types';
import { alphabetIdx, htmlValOrDefault } from '@hourglass/common/helpers';
import HTML from '@student/exams/show/components/HTML';

interface MatchingProps {
  info: MatchingInfo;
  value: MatchingState;
  onChange: (newVal: MatchingState) => void;
  disabled: boolean;
}

const Matching: React.FC<MatchingProps> = (props) => {
  const {
    info,
    value,
    onChange,
    disabled,
  } = props;
  const {
    prompt,
    promptsLabel,
    prompts,
    valuesLabel,
    values,
  } = info;
  return (
    <div>
      <HTML value={prompt} />
      <Row>
        <Col sm={6}>
          <Table>
            <thead>
              <tr>
                <th colSpan={3} className="text-center">
                  <HTML value={htmlValOrDefault(promptsLabel, 'Column A')} />
                </th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p, i) => {
                const valueI = value?.[i] ?? -1;
                const handleChange = (event: React.ChangeEvent<{ value: number }>): void => {
                  const val = event.target.value;
                  const ret = { ...value };
                  ret[i] = val;
                  onChange(ret);
                };
                return (
                  // Prompt indices are STATIC.
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={i}>
                    <td>{`${alphabetIdx(i)}.`}</td>
                    <td><HTML value={p} /></td>
                    <td>
                      <FormControl variant="outlined">
                        <InputLabel>Match</InputLabel>
                        <Select
                          disabled={disabled}
                          margin="dense"
                          value={valueI}
                          onChange={handleChange}
                          label="Match"
                        >
                          <MenuItem value={-1}>
                            <em>None</em>
                          </MenuItem>
                          {(values.map((_v, j) => (
                            <MenuItem
                              // Question choices are STATIC.
                              // eslint-disable-next-line react/no-array-index-key
                              key={j}
                              value={j}
                            >
                              {j + 1}
                            </MenuItem>
                          )))}
                        </Select>
                      </FormControl>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
        <Col sm={6}>
          <Table>
            <thead>
              <tr>
                <th colSpan={2} className="text-center">
                  <HTML value={htmlValOrDefault(valuesLabel, 'Column B')} />
                </th>
              </tr>
            </thead>
            <tbody>
              {values.map((v, i) => (
                // Question choices are STATIC.
                // eslint-disable-next-line react/no-array-index-key
                <tr key={i}>
                  <td>
                    {i + 1}
                    .
                  </td>
                  <td><HTML value={v} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default Matching;
