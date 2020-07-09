import React, { useState, useContext } from 'react';
import {
  Form,
  Button,
} from 'react-bootstrap';
import { MdCloudDone } from 'react-icons/md';
import { ShowMessage } from '@student/exams/show/components/navbar/ExamMessages';
import { useFragment, graphql, useMutation } from 'relay-hooks';
import { DateTime } from 'luxon';
import { AlertContext } from '@hourglass/common/alerts';

import { AskQuestion$key } from './__generated__/AskQuestion.graphql';
import { AskQuestion_single$key } from './__generated__/AskQuestion_single.graphql';
import { AskQuestionMutation } from './__generated__/AskQuestionMutation.graphql';

const ShowQuestion: React.FC<{
  qKey: AskQuestion_single$key;
}> = (props) => {
  const {
    qKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment AskQuestion_single on Question {
      createdAt
      body
    }
    `,
    qKey,
  );
  return (
    <ShowMessage
      icon={MdCloudDone}
      iconClass="text-success"
      tooltip="Question sent successfully"
      time={DateTime.fromISO(res.createdAt)}
      body={res.body}
    />
  );
};

const SendQuestion: React.FC<{
  registrationId: string;
}> = (props) => {
  const {
    registrationId,
  } = props;
  const [val, setVal] = useState('');
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<AskQuestionMutation>(
    graphql`
    mutation AskQuestionMutation($input: AskQuestionInput!) {
      askQuestion(input: $input) {
        question {
          ...AskQuestion_single
        }
        questionEdge {
          node {
            id
          }
        }
      }
    }
    `,
    {
      configs: [
        {
          type: 'RANGE_ADD',
          parentID: registrationId,
          connectionInfo: [{
            key: 'AskQuestion_questions',
            rangeBehavior: 'prepend',
          }],
          edgeName: 'questionEdge',
        },
      ],
      onCompleted: () => {
        setVal('');
      },
      onError: (errs) => {
        alert({
          variant: 'danger',
          title: 'Error asking question',
          message: errs[0]?.message,
        });
      },
    },
  );
  const buttonText = loading ? 'Saving...' : 'Submit';
  const valEmpty = val === '';
  return (
    <>
      <Form.Control
        value={val}
        onChange={(event): void => {
          setVal(event.target.value);
        }}
        as="textarea"
        disabled={loading}
      />
      <Button
        className="ml-auto mt-3 float-right"
        variant="success"
        disabled={valEmpty || loading}
        onClick={(): void => {
          mutate({
            variables: {
              input: {
                registrationId,
                body: val,
              },
            },
          });
        }}
      >
        {buttonText}
      </Button>
    </>
  );
};

interface AskQuestionProps {
  examKey: AskQuestion$key;
}

const AskQuestion: React.FC<AskQuestionProps> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment AskQuestion on Exam {
      myRegistration {
        id
        questions(
          first: 10
        ) @connection(key: "AskQuestion_questions", filters: []) {
          edges {
            node {
              id
              ...AskQuestion_single
            }
          }
        }
      }
    }
    `,
    examKey,
  );
  const { edges } = res.myRegistration.questions;
  return (
    <div>
      <SendQuestion registrationId={res.myRegistration.id} />
      <span className="clearfix" />
      <hr className="my-2" />
      {edges.length === 0 && (
        <i>No questions sent.</i>
      )}
      <ul className="p-0">
        {edges.map(({ node }) => (
          <ShowQuestion
            key={node.id}
            qKey={node}
          />
        ))}
      </ul>
    </div>
  );
};

export default AskQuestion;
