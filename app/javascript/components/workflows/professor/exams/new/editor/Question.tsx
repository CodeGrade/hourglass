import React, {
  useCallback,
  useContext,
  useMemo,
} from 'react';
import {
  graphql,
  useMutation,
  useFragment,
} from 'relay-hooks';
import {
  Button,
  Card,
  Col,
  Form,
  Row,
} from 'react-bootstrap';

import { RearrangeableList } from '@hourglass/common/rearrangeable';
import { AlertContext } from '@hourglass/common/alerts';
import { QuestionFilesContext } from '@hourglass/common/context';

import { HTMLVal, YesNoInfo, FileRef } from '@student/exams/show/types';
import YesNoControl from '@student/exams/show/components/questions/YesNo';

import { DragHandle, DestroyButton, EditHTMLVal } from './components/helpers';
import { SingleRubricKeyEditor } from './Rubric';
import EditReference from './Reference';
import { ReorderablePartsEditor } from './Part';

import { editorQuery } from './__generated__/editorQuery.graphql';
import { QuestionEditor$key } from './__generated__/QuestionEditor.graphql';
import { QuestionDestroyMutation } from './__generated__/QuestionDestroyMutation.graphql';
import { QuestionChangeMutation } from './__generated__/QuestionChangeMutation.graphql';
import { QuestionReorderMutation } from './__generated__/QuestionReorderMutation.graphql';
import { QuestionCreatePartMutation } from './__generated__/QuestionCreatePartMutation.graphql';

export const SEP_SUB_YESNO: YesNoInfo = {
  type: 'YesNo',
  yesLabel: 'Yes',
  noLabel: 'No',
  prompt: { type: 'HTML', value: '' },
};

export const ReorderableQuestionsEditor: React.FC<{
  dbQuestions: editorQuery['response']['examVersion']['dbQuestions'],
  examVersionId: string,
  disabled?: boolean,
  showRubricEditors?: boolean,
}> = (props) => {
  const {
    dbQuestions,
    examVersionId,
    disabled = false,
    showRubricEditors = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<QuestionReorderMutation>(
    graphql`
    mutation QuestionReorderMutation($input: ReorderQuestionsInput!) {
      reorderQuestions(input: $input) {
        examVersion {
          id
          dbQuestions {
            id
            index
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error reordering questions',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const moveQuestion = useCallback((from, to) => {
    mutate({
      variables: {
        input: {
          examVersionId,
          fromIndex: from,
          toIndex: to,
        },
      },
    });
  }, [examVersionId, mutate]);
  return (
    <RearrangeableList
      dbArray={dbQuestions}
      className="mb-3"
      dropVariant="primary"
      onRearrange={moveQuestion}
      identifier={`QUESTION-${examVersionId}`}
    >
      {(question, handleRef, isDragging) => (
        <OneQuestion
          questionKey={question}
          handleRef={handleRef}
          isDragging={isDragging}
          disabled={disabled || loading}
          showRubricEditors={showRubricEditors}
        />
      )}
    </RearrangeableList>
  );
};

export const OneQuestion: React.FC<{
  questionKey: QuestionEditor$key;
  handleRef: React.Ref<HTMLElement>;
  isDragging?: boolean;
  disabled?: boolean;
  showRubricEditors?: boolean;
}> = (props) => {
  const {
    questionKey,
    handleRef,
    isDragging = false,
    disabled: parentDisabled = false,
    showRubricEditors = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const question = useFragment(
    graphql`
    fragment QuestionEditor on Question {
      id
      index
      name {
        type
        value
      }
      description {
        type
        value
      }
      references { 
        id
        type
        path
       }
      separateSubparts
      extraCredit
      rootRubric { ...RubricSingle }
      parts {
        id
        ...PartEditor
      }
    }
    `,
    questionKey,
  );
  const [
    mutateDestroyQuestion,
    { loading: loadingDestroyQuestion },
  ] = useMutation<QuestionDestroyMutation>(
    graphql`
    mutation QuestionDestroyMutation($input: DestroyQuestionInput!) {
      destroyQuestion(input: $input) {
        examVersion {
          id
          dbQuestions {
            id
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error destroying question',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const [
    mutateUpdateQuestion,
    { loading: loadingUpdateQuestion },
  ] = useMutation<QuestionChangeMutation>(
    graphql`
    mutation QuestionChangeMutation($input: ChangeQuestionDetailsInput!) {
      changeQuestionDetails(input: $input) {
        question {
          id
          name {
            type
            value
          }
          description {
            type
            value
          }
          references {
            id
            type
            path
          }
          extraCredit
          separateSubparts
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error updating question',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const [
    mutateCreatePart,
    { loading: loadingCreatePart },
  ] = useMutation<QuestionCreatePartMutation>(
    graphql`
    mutation QuestionCreatePartMutation($input: CreatePartInput!) {
      createPart(input: $input) {
        question {
          id
          parts {
            id
            ...PartEditor
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error adding new part',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const updateName = useCallback((newVal: HTMLVal) => {
    mutateUpdateQuestion({
      variables: {
        input: {
          questionId: question.id,
          updateName: true,
          name: newVal,
        },
      },
    });
  }, [question.id]);
  const updateDescription = useCallback((newVal: HTMLVal) => {
    mutateUpdateQuestion({
      variables: {
        input: {
          questionId: question.id,
          updateDescription: true,
          description: newVal,
        },
      },
    });
  }, [question.id]);
  const updateExtraCredit = useCallback((newVal: boolean) => {
    mutateUpdateQuestion({
      variables: {
        input: {
          questionId: question.id,
          updateExtraCredit: true,
          extraCredit: newVal,
        },
      },
    });
  }, [question.id]);
  const updateSeparateSubparts = useCallback((newVal: boolean) => {
    mutateUpdateQuestion({
      variables: {
        input: {
          questionId: question.id,
          updateSeparateSubparts: true,
          separateSubparts: newVal,
        },
      },
    });
  }, [question.id]);
  const updateReferences = useCallback((newVal: FileRef[]) => {
    mutateUpdateQuestion({
      variables: {
        input: {
          questionId: question.id,
          updateReferences: true,
          references: newVal,
        },
      },
    });
  }, [question.id]);
  const disabled = (
    loadingDestroyQuestion
    || loadingUpdateQuestion
    || loadingCreatePart
    || parentDisabled
  );
  const questionReference = useMemo(() => ({
    references: question.references,
  }), [question.references]);
  return (
    <QuestionFilesContext.Provider value={questionReference}>
      <Card
        className={isDragging ? '' : 'mb-3'}
        border="primary"
      >
        <div className="alert alert-primary">
          <Card.Title>
            {handleRef && <DragHandle variant="primary" handleRef={handleRef} />}
            <DestroyButton
              disabled={disabled}
              onClick={() => {
                mutateDestroyQuestion({
                  variables: {
                    input: {
                      questionId: question.id,
                    },
                  },
                });
              }}
            />
            <Row>
              <Col sm="auto" className={handleRef ? 'ml-4' : ''}>
                <Form.Label column>{`Question ${question.index + 1}:`}</Form.Label>
              </Col>
              <Col className="mr-5">
                <EditHTMLVal
                  className="bg-white border rounded"
                  value={question.name || {
                    type: 'HTML',
                    value: '',
                  }}
                  disabled={disabled}
                  onChange={updateName}
                  placeholder="Give a short (optional) descriptive name for the question"
                  debounceDelay={1000}
                />
              </Col>
            </Row>
          </Card.Title>
        </div>
        <Card.Body>
          <Row>
            <Col sm={12} xl={showRubricEditors ? 6 : 12}>
              <Form.Group as={Row}>
                <Form.Label column sm="2">Description:</Form.Label>
                <Col sm="10">
                  <EditHTMLVal
                    className="bg-white border rounded"
                    value={question.description || {
                      type: 'HTML',
                      value: '',
                    }}
                    disabled={disabled}
                    onChange={updateDescription}
                    placeholder="Give a longer description of the question"
                    debounceDelay={1000}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                {/* <Field name="separateSubparts" component={QuestionSepSubParts} /> */}
                <Form.Label column sm="2">Separate subparts?</Form.Label>
                <Col sm="4">
                  <YesNoControl
                    className="bg-white rounded"
                    disabled={disabled}
                    value={!!question.separateSubparts}
                    info={SEP_SUB_YESNO}
                    onChange={updateSeparateSubparts}
                  />
                </Col>
                <Form.Label column sm="2">Extra credit?</Form.Label>
                <Col sm="4">
                  <YesNoControl
                    className="bg-white rounded"
                    disabled={disabled}
                    value={!!question.extraCredit}
                    info={SEP_SUB_YESNO}
                    onChange={updateExtraCredit}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <EditReference
                  value={question.references}
                  disabled={disabled}
                  onChange={updateReferences}
                  label="this question"
                />
              </Form.Group>
            </Col>
            {showRubricEditors && (
              <Col sm={12} xl={6}>
                <SingleRubricKeyEditor
                  rubricKey={question.rootRubric}
                  disabled={disabled}
                />
              </Col>
            )}
          </Row>
          <ReorderablePartsEditor
            parts={question.parts}
            disabled={loadingCreatePart || parentDisabled}
            questionId={question.id}
            showRubricEditors={showRubricEditors}
          />
          <Row className="text-center">
            <Col>
              <Button
                variant="success"
                onClick={() => {
                  mutateCreatePart({
                    variables: {
                      input: {
                        questionId: question.id,
                        points: 0,
                      },
                    },
                  });
                }}
                disabled={disabled}
              >
                Add part
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </QuestionFilesContext.Provider>
  );
};
