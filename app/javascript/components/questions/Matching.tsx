import React from 'react';
import {
  Container, Row, Col, Table,
} from 'react-bootstrap';
import {
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import { Matching, MatchingState } from '../../types';

interface MatchingProps {
  info: Matching;
  value: MatchingState;
  onChange: (index: number, newVal: number) => void;
}

export function Matching(props: MatchingProps) {
  const { info, value, onChange } = props;
  const {
    promptLabel, prompts, valuesLabel, values,
  } = info;
  return (
    <Container>
      <Row>
        <Col sm={6}>
          <Table>
            <thead>
              <tr>
                <th />
                <th>
                  <p>{promptLabel ?? 'Column A'}</p>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {prompts.map((p, i) => {
                const valueI = value?.[i] ?? -1;
                const handleChange = (event) => {
                  const val = event.target.value;
                  onChange(i, val);
                };
                return (
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
                          margin="dense"
                          value={valueI}
                          onChange={handleChange}
                          label="Match"
                        >
                          <MenuItem value={-1}>
                            <em>None</em>
                          </MenuItem>
                          {(values.map((v, j) => (
                            <MenuItem
                              key={j}
                              value={j + 1}
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
                <th />
                <th>
                  <p>{valuesLabel ?? 'Column B'}</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {values.map((v, i) => (
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
    </Container>
  );
}
