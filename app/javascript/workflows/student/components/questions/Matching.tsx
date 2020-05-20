import React from 'react';
import {
  Row, Col, Table,
} from 'react-bootstrap';
import {
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import { MatchingInfo, MatchingState } from '@student/types';

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
    promptLabel, prompts, valuesLabel, values,
  } = info;
  return (
    <Row>
      <Col sm={6}>
        <Table>
          <thead>
            <tr>
              <th colSpan={3} className="text-center">
                <p>{promptLabel ?? 'Column A'}</p>
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
                  <td>
                    {String.fromCharCode(65 + i)}
                    .
                  </td>
                  <td>{p}</td>
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
                <p>{valuesLabel ?? 'Column B'}</p>
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
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default Matching;
