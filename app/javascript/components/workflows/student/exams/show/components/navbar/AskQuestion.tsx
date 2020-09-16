import React, {
  useState,
  useContext,
  useEffect,
} from 'react';
import {
  Form,
  Button,
} from 'react-bootstrap';
import { MdCloudDone } from 'react-icons/md';
import {
  ShowMessage,
} from '@student/exams/show/components/navbar/ExamMessages';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import {
  useFragment,
  graphql,
  useMutation,
  usePagination,
} from 'relay-hooks';
import { DateTime } from 'luxon';
import { AlertContext } from '@hourglass/common/alerts';
import { pluralize } from '@hourglass/common/helpers';

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
      urgent
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
  urgent: boolean;
}> = (props) => {
  const {
    registrationId,
    urgent,
  } = props;
  const [val, setVal] = useState('');
  const [inTimeout, setInTimeout] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  useEffect(() => {
    if (inTimeout) {
      setRemainingTime(60);
      const timer = setInterval(() => {
        setRemainingTime((t) => {
          if (t === 1) {
            setInTimeout(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return (): void => {
        clearInterval(timer);
      };
    }
    return undefined;
  }, [inTimeout]);
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
        setInTimeout(true);
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error asking question',
          message: err.message,
        });
      },
    },
  );
  const buttonText = loading ? 'Saving...' : 'Submit';
  const valEmpty = val === '';
  let disabledMessage;
  if (valEmpty) {
    disabledMessage = 'You cannot send an empty question.';
  } else if (inTimeout) {
    disabledMessage = `Wait another ${pluralize(remainingTime, 'second', 'seconds')} between asking questions`;
  } else if (loading) {
    disabledMessage = 'Please wait...';
  }
  return (
    <>
      <Form.Control
        maxLength={2000}
        value={val}
        onChange={(event): void => {
          setVal(event.target.value);
        }}
        as="textarea"
        disabled={loading}
      />
      <TooltipButton
        className="ml-auto mt-3 float-right"
        variant="success"
        disabled={valEmpty || loading || inTimeout}
        disabledMessage={disabledMessage}
        onClick={(): void => {
          mutate({
            variables: {
              input: {
                registrationId,
                urgent,
                body: val,
              },
            },
          });
        }}
      >
        {buttonText}
      </TooltipButton>
    </>
  );
};

const questionPaginationConfig = {
  getVariables(_props, { count, cursor }, fragmentVariables) {
    return {
      count,
      cursor,
      examId: fragmentVariables.examId,
    };
  },
  query: graphql`
  query AskQuestionPaginationQuery(
    $count: Int!
    $cursor: String
    $examId: ID!
  ) {
    exam: node(id: $examId) {
      ...AskQuestion @arguments(count: $count, cursor: $cursor)
    }
  }
  `,
};

interface AskQuestionProps {
  examKey: AskQuestion$key;
  urgent: boolean;
}

const AskQuestion: React.FC<AskQuestionProps> = (props) => {
  const {
    examKey,
    urgent,
  } = props;
  const { alert } = useContext(AlertContext);
  const [res, { isLoading, hasMore, loadMore }] = usePagination(
    graphql`
    fragment AskQuestion on Exam
    @argumentDefinitions(
      count: { type: "Int", defaultValue: 10 }
      cursor: { type: "String" }
    ) {
      myRegistration {
        id
        questions(
          first: $count
          after: $cursor
        ) @connection(key: "AskQuestion_questions", filters: []) {
          edges {
            node {
              id
              createdAt
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
      <SendQuestion registrationId={res.myRegistration.id} urgent={urgent} />
      <span className="clearfix" />
      <hr className="my-2" />
      {edges.length === 0 && (
        <i>No questions sent.</i>
      )}
      <ul className="p-0 list-unstyled">
        {edges.map(({ node }) => (
          <ShowQuestion
            key={node.id}
            qKey={node}
          />
        ))}
        {hasMore() && (
          <li className="text-center">
            <Button
              onClick={() => {
                if (!hasMore() || isLoading()) return;
                loadMore(
                  questionPaginationConfig,
                  10,
                  (error) => {
                    if (!error) return;
                    alert({
                      variant: 'danger',
                      title: 'Error fetching additional questions.',
                      message: error.message,
                    });
                  },
                  {},
                );
              }}
              variant="success"
            >
              Load more...
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default AskQuestion;
