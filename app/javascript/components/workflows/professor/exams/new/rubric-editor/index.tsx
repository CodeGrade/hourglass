import React, { useCallback, useContext, useEffect, useState } from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@hourglass/common/context';
import {
  ExamVersion,
  AnswersState,
  HTMLVal,
} from '@student/exams/show/types';
import {
  Rubric, RubricAll, RubricAny, RubricOne, RubricPresets,
} from '@professor/exams/types';
import { examWithAnswers } from '@professor/exams/new/editor';
import { graphql, useQuery } from 'relay-hooks';

import { RenderError } from '@hourglass/common/boundary';
import convertRubric from '@professor/exams/rubrics';
import { ButtonGroup, Card, Col, Form, Row, ToggleButton } from 'react-bootstrap';
import { SelectOption, SelectOptions } from '@hourglass/common/helpers';
import { rubricEditorQuery } from './__generated__/rubricEditorQuery.graphql';
import Select from 'react-select';
import { useMutation } from 'relay-hooks';
import { rubricEditorChangeRubricTypeMutation } from './__generated__/rubricEditorChangeRubricTypeMutation.graphql';
import { AlertContext } from '@hourglass/common/alerts';
import CustomEditor from '../editor/components/CustomEditor';
import { useDebounce, useDebouncedCallback } from 'use-debounce/lib';
import { rubricEditorChangeRubricDetailsDescriptionMutation } from './__generated__/rubricEditorChangeRubricDetailsDescriptionMutation.graphql';
import { ChangeHandler, normalizeNumber, NumericInput } from '@hourglass/common/NumericInput';
import { rubricEditorChangeRubricDetailsPointsMutation } from './__generated__/rubricEditorChangeRubricDetailsPointsMutation.graphql';
import Tooltip from '@hourglass/workflows/student/exams/show/components/Tooltip';

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
              <Row key={qnum}>
                <Col>
                  <p>Question {qnum+1} rubric:</p>
                  <SingleRubricEditor
                    rubric={q.questionRubric}
                  />
                  {q.parts.map((p, pnum) => (
                    <Row key={pnum}>
                      <Col>
                        <p>Question {qnum+1} part {pnum+1} rubric:</p>
                        <SingleRubricEditor
                          rubric={p.partRubric}
                        />
                        {p.body.map((b, bnum) => (
                          <Row key={bnum}>
                            <Col>
                              <p>Question {qnum+1} part {pnum+1} body {bnum+1} rubric:</p>
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
    <Card
      className="mb-3 alert-dark rubric p-0"
      border="secondary"
    >
      <Card.Body>
        <RubricTypeEditor
          rubric={rubric}
        />
        {'description' in rubric && (
          <Form.Group>
            <RubricDescriptionEditor
              rubric={rubric}
            />
          </Form.Group>
        )}
        <Form.Group as={Row}>
          <Form.Label column sm="1">Label</Form.Label>
          <Col sm="4">
            <RubricPresetLabelEditor
            // rubric={rubric.}
            />
            {/* <Field name="label" component="input" type="text" className="w-100" /> */}
          </Col>
          {('choices' in rubric && 'direction' in rubric.choices) && (
            <>
              <Form.Label column sm="1">Direction</Form.Label>
              <Col sm="3">
                <RubricPresetDirectionEditor
                  value={rubric.choices.direction}
                  onChange={console.log}
                />
              </Col>
            </>
          )}
          {'points' in rubric && (
            <>
              <Form.Label column sm="1">Points</Form.Label>
              <Col sm="2">
                <RubricPointsEditor
                  rubric={rubric}
                />
              </Col>
            </>
          )}
        </Form.Group>
        {('choices' in rubric && rubric.choices instanceof Array) && (
          rubric.choices.map((subRubric) => (
            <SingleRubricEditor
              key={subRubric.id}
              rubric={subRubric}
            />
          ))
        )}
      </Card.Body>
    </Card>
  );
};

interface RubricPresetsDirectionProps {
  value: RubricPresets['direction'];
  onChange: (newval: RubricPresets['direction']) => void;
}
const RubricPresetDirectionEditor: React.FC<RubricPresetsDirectionProps> = (props) => {
  const { value, onChange } = props;
  const values: {
    name: string;
    value: RubricPresets['direction'];
    message: string;
  }[] = [
    { name: 'Credit', value: 'credit', message: 'Grade counts up from zero' },
    { name: 'Deduction', value: 'deduction', message: 'Grade counts down from this section of points' },
  ];
  return (
    <ButtonGroup toggle>
      {values.map((val) => {
        const checked = (value === val.value);
        return (
          <Tooltip
            key={val.value}
            message={val.message}
          >
            <ToggleButton
              type="radio"
              variant={checked ? 'secondary' : 'outline-secondary'}
              className={checked ? '' : 'bg-white text-dark'}
              name="radio"
              value={val.value}
              checked={checked}
              onChange={(e) => onChange(e.currentTarget.value as RubricPresets['direction'])}
            >
              {val.name}
            </ToggleButton>
          </Tooltip>
        );
      })}
    </ButtonGroup>
  );
};

const RubricPresetLabelEditor: React.FC<{
}> = (props) => {
  // TODO
  return (
    <Form.Control>
    </Form.Control>
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

const RubricDescriptionEditor: React.FC<{
  rubric: RubricAll | RubricOne | RubricAny;
}> = (props) => {
  const { rubric } = props;
  const { description = { type: 'HTML', value: '' } } = rubric;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangeRubricDetailsDescriptionMutation>(
    graphql`
    mutation rubricEditorChangeRubricDetailsDescriptionMutation($input: ChangeRubricDetailsInput!) {
      changeRubricDetails(input: $input) {
        rubric {
          id
          description {
            type
            value
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing rubric description',
          message: err.message,
          copyButton: true,
        });
      },
    }
  );
  const onChange = (newDescription: HTMLVal) => {
    mutate({
      variables: {
        input: {
          rubricId: rubric.id,
          updatePoints: false,
          updateDescription: true,
          description: newDescription.value,
        },
      },
    })
  };
  return (
    <EditHTMLVal
      className="bg-white border rounded"
      disabled={loading}
      value={description}
      onChange={onChange}
      placeholder={`Give use-${rubric.type} rubric instructions here`}
      debounceDelay={1000}
      refreshProps={[rubric.type]}
    />
  );
};

const EditHTMLVal: React.FC<{
  disabled?: boolean;
  value: HTMLVal;
  onChange: (newVal: HTMLVal) => void;
  placeholder?: string;
  debounceDelay?: number;
  refreshProps?: React.DependencyList;
  className?: string;
}> = (props) => {
  const {
    disabled = false,
    value,
    onChange,
    placeholder,
    debounceDelay = 0,
    refreshProps,
    className,
  } = props;
  const debouncedOnChange = useDebouncedCallback(
    onChange,
    debounceDelay,
  );
  const handleChange = useCallback((newVal, _delta, source, _editor): void => {
    if (source === 'user') {
      debouncedOnChange({
        type: 'HTML',
        value: newVal,
      });
    }
  }, [onChange]);
  return (
    <CustomEditor
      disabled={disabled}
      value={value.value}
      placeholder={placeholder}
      theme="bubble"
      onChange={handleChange}
      refreshProps={refreshProps}
      className={className}
    />
  );
};

const RubricPointsEditor: React.FC<{
  rubric: RubricOne | RubricAny;
}> = (props) => {
  const { rubric } = props;
  const [pointsVal, setPointsVal] = useState(rubric.points.toString());
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangeRubricDetailsPointsMutation>(
    graphql`
    mutation rubricEditorChangeRubricDetailsPointsMutation($input: ChangeRubricDetailsInput!) {
      changeRubricDetails(input: $input) {
        rubric {
          id
          points
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing rubric points',
          message: err.message,
          copyButton: true,
        });
      },
    }
  )
  const handleChange: ChangeHandler = (newVal: string | number, focused: boolean) => {
    if (focused) {
      const normalized = normalizeNumber(newVal.toString(), pointsVal);
      setPointsVal(normalized);
    } else {
      mutate({
        variables: {
          input: {
            rubricId: rubric.id,
            updatePoints: true,
            updateDescription: false,
            points: newVal as number,
          },
        },
      });
    }
  };
  useEffect(() => {
    setPointsVal(rubric.points.toString());
  }, [rubric.points]);
  return (
    <NumericInput
      disabled={loading}
      value={pointsVal}
      step={0.5}
      variant="warning"
      onChange={handleChange}
    />
  );
};
