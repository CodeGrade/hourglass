import React, { useContext } from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { TextInfo, TextState } from '@student/exams/show/types';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import { TextCreateMutation } from './__generated__/TextCreateMutation.graphql';

export function useCreateTextMutation(): MutationReturn<TextCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<TextCreateMutation>(
    graphql`
    mutation TextCreateMutation($input: CreateTextInput!) {
      createText(input: $input) {
        part {
          id
          bodyItems {
            id
            ...BodyItemEditor
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating new Text body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

const Text: React.FC<{
  info: TextInfo,
  id: string,
  disabled?: boolean;
  answer: TextState
}> = (props) => {
  const {
    info,
    answer,
    disabled = false,
  } = props;
  return (
    <>
      <Prompted
        value={info.prompt}
        disabled={disabled}
        onChange={console.log}
      />
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={10}>
          <Form.Control
            as="textarea"
            rows={3}
            disabled={disabled}
            placeholder="Sketch the intended answer here."
            value={answer ?? ''}
            onChange={console.log}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Text;
