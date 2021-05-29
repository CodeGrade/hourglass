import React, { useCallback, useContext } from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { DebouncedFormControl } from '@professor/exams/new/editor/components/helpers';
import { HTMLVal, TextInfo, TextState } from '@student/exams/show/types';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';

import { TextCreateMutation } from './__generated__/TextCreateMutation.graphql';
import { TextChangeMutation } from './__generated__/TextChangeMutation.graphql';

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

function useChangeTextMutation(): MutationReturn<TextChangeMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<TextChangeMutation>(
    graphql`
    mutation TextChangeMutation($input: ChangeTextDetailsInput!) {
      changeTextDetails(input: $input) {
        bodyItem {
          id
          info
          answer
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing Text body item',
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
    id,
    info,
    answer,
    disabled: parentDisabled = false,
  } = props;
  const [mutate, { loading }] = useChangeTextMutation();
  const updatePrompt = useCallback((newPrompt: HTMLVal) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updatePrompt: true,
          prompt: newPrompt,
        },
      },
    });
  }, [id]);
  const updateAnswer = useCallback((newAnswer: string) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id]);
  const disabled = parentDisabled || loading;
  return (
    <>
      <Prompted
        value={info.prompt}
        disabled={disabled}
        onChange={updatePrompt}
      />
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={10}>
          <DebouncedFormControl
            as="textarea"
            rows={3}
            disabled={disabled}
            placeholder="Sketch the intended answer here."
            defaultValue={answer ?? ''}
            onChange={updateAnswer}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Text;
