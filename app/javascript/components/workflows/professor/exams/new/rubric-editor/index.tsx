import React, { useCallback, useContext } from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@hourglass/common/context';
import {
  ExamVersion,
  AnswersState,
} from '@student/exams/show/types';
import {
  Rubric,
} from '@professor/exams/types';
import { examWithAnswers } from '@professor/exams/new/editor';
import { graphql, useQuery } from 'relay-hooks';

import { RenderError } from '@hourglass/common/boundary';
import convertRubric from '@professor/exams/rubrics';
import { Col, Form, Row } from 'react-bootstrap';
import { SelectOption, SelectOptions } from '@hourglass/common/helpers';
import { rubricEditorQuery } from './__generated__/rubricEditorQuery.graphql';
import Select from 'react-select';
import { useMutation } from 'relay-hooks';
import { rubricEditorChangeRubricTypeMutation } from './__generated__/rubricEditorChangeRubricTypeMutation.graphql';
import { AlertContext } from '@hourglass/common/alerts';

export interface RubricEditorProps {
  examVersionId: string;
  exam: ExamVersion;
  versionName: string;
  answers: AnswersState;
}

const RubricEditor: React.FC<RubricEditorProps> = (props) => {
  const {
    examVersionId,
    exam,
    versionName,
    answers,
  } = props;
  const res = useQuery<rubricEditorQuery>(
    graphql`
    query rubricEditorQuery($examVersionId: ID!) {
      examVersion(id: $examVersionId) {
        rubrics {
          id
          type
          parentSectionId
          qnum
          pnum
          bnum
          order
          points
          description {
            type
            value
          }
          rubricPreset {
            id
            direction
            label
            mercy
            presetComments {
              id
              label
              order
              points
              graderHint
              studentFeedback
            }
          }
          subsections {
            id
          }
        }
      }
    }
    `,
    { examVersionId },
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.data) {
    return <p>Loading...</p>;
  }
  const { rubrics } = res.data.examVersion;
  const { examRubric, questions } = convertRubric(rubrics);
  const examVersionWithAnswers = examWithAnswers(exam, answers.answers);
  
  return (
    <ExamContext.Provider
      value={{
        files: exam.files,
        fmap: createMap(exam.files),
      }}
    >
      <ExamFilesContext.Provider
        value={{
          references: exam.references,
        }}
      >
        <Row>
          <Col sm={{ span: 6, offset: 3 }}>
            <h1>{`${versionName} Rubric`}</h1>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <p>Exam-wide rubric:</p>
            {examRubric ? (
              <SingleRubricEditor
                rubric={examRubric}
              />
            ) : 'TODO: NONE'}
            {questions.map((q, qnum) => (
              <Row>
                <Col>
                  <p>Question {qnum} rubric:</p>
                  <SingleRubricEditor
                    rubric={q.questionRubric}
                  />
                  {q.parts.map((p, pnum) => (
                    <Row>
                      <Col>
                        <p>Question {qnum} part {pnum} rubric:</p>
                        <SingleRubricEditor
                          rubric={p.partRubric}
                        />
                        {p.body.map((b, bnum) => (
                          <Row>
                            <Col>
                              <p>Question {qnum} part {pnum} body {bnum} rubric:</p>
                              <SingleRubricEditor
                                rubric={b}
                              />
                            </Col>
                          </Row>
                        ))}
                      </Col>
                    </Row>
                  ))}
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
      </ExamFilesContext.Provider>
    </ExamContext.Provider>
  );
};
export default RubricEditor;

const defaultOptions: Record<Rubric['type'], SelectOption<Rubric['type']>> = {
  none: {
    label: 'No rubric',
    value: 'none',
  },
  all: {
    label: 'Use something from all entries',
    value: 'all',
  },
  any: {
    label: 'Use any applicable entries',
    value: 'any',
  },
  one: {
    label: 'Use exactly one entry',
    value: 'one',
  },
};

interface SingleRubricEditorProps {
  rubric?: Rubric;
}

const SingleRubricEditor: React.FC<SingleRubricEditorProps> = (props) => {
  const {
    rubric,
  } = props;
  return (
    <>
      <p>editing: {JSON.stringify(rubric)}</p>
      <RubricTypeEditor
        rubric={rubric}
        />
    </>
  );
};

// given a rubric, hook up GraphQL mutation for type changes
const RubricTypeEditor: React.FC<{
  rubric: Rubric;
}> = (props) => {
  const { rubric } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangeRubricTypeMutation>(
    graphql`
    mutation rubricEditorChangeRubricTypeMutation($input: ChangeRubricTypeInput!) {
      changeRubricType(input: $input) {
        rubric {
          id
          type
          parentSectionId
          qnum
          pnum
          bnum
          order
          points
          description {
            type
            value
          }
          rubricPreset {
            id
            direction
            label
            mercy
            presetComments {
              id
              label
              order
              points
              graderHint
              studentFeedback
            }
          }
          subsections {
            id
          }
        }
      }
    }
    `,
    {
      onCompleted: ({ changeRubricType }) => {
        const { rubric: changedRubric } = changeRubricType;
        console.log('updated rubric:', changedRubric);
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing rubric type',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const onChange = (newType: Rubric['type']) => {
    mutate({
      variables: {
        input: {
          rubricId: rubric.id,
          type: newType,
        },
      },
    });
  };
  return (
    <ChangeRubricType
      disabled={loading}
      value={rubric.type}
      onChange={onChange}
      disableAllWhenPreset={ // only disable 'all'
        'choices' in rubric && // if we have any saved choices...
        'presets' in rubric.choices && // that are presets,
        rubric.choices.presets.length > 0 // and presets are present
      }
    />
  );
};

type RubricSelectOption = SelectOption<Rubric['type']>;

// just UI for displaying a Rubric type, and calling the callback when changed
export const ChangeRubricType: React.FC<{
  disabled?: boolean;
  value: Rubric['type'];
  onChange: (newVal: Rubric['type']) => void;
  disableAllWhenPreset: boolean;
}> = (props) => {
  const options: RubricSelectOption[] = Object.values(defaultOptions);
  const { value, onChange, disabled = false } = props;
  const changeRubricType = useCallback((newtype: RubricSelectOption) => {
    onChange(newtype.value);
  }, [value, onChange]);
  const disableAllWhenPreset = useCallback((option: RubricSelectOption) => {
    return option.value === 'all' && props.disableAllWhenPreset;
  }, [props.disableAllWhenPreset]);
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2"><h5 className="my-0">Rubric type</h5></Form.Label>
      <Col sm="10">
        <Select
          isDisabled={disabled}
          classNamePrefix="select"
          className="z-1000-select"
          options={options}
          value={defaultOptions[value || 'none']}
          isOptionDisabled={disableAllWhenPreset}
          onChange={changeRubricType}
        />
      </Col>
    </Form.Group>
  );
};
