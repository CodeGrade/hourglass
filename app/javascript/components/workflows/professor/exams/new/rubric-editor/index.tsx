import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@hourglass/common/context';
import {
  ExamVersion,
  AnswersState,
  HTMLVal,
} from '@student/exams/show/types';
import {
  Preset,
  Rubric, RubricAll, RubricAny, RubricOne, RubricPresets,
} from '@professor/exams/types';
// import { examWithAnswers } from '@professor/exams/new/editor';
import { graphql, useQuery, useMutation } from 'relay-hooks';

import { RenderError } from '@hourglass/common/boundary';
import convertRubric from '@professor/exams/rubrics';
import {
  ButtonGroup,
  ButtonProps,
  Card,
  Col,
  Form,
  FormControlProps,
  Row,
  ToggleButton,
} from 'react-bootstrap';
import { SelectOption } from '@hourglass/common/helpers';
import Select from 'react-select';
import { AlertContext } from '@hourglass/common/alerts';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import { useDebounce, useDebouncedCallback } from 'use-debounce/lib';
import { ChangeHandler, normalizeNumber, NumericInput } from '@hourglass/common/NumericInput';
import Tooltip from '@hourglass/workflows/student/exams/show/components/Tooltip';
import { rubricEditorChangeRubricDetailsDescriptionMutation } from './__generated__/rubricEditorChangeRubricDetailsDescriptionMutation.graphql';
import { rubricEditorChangeRubricTypeMutation } from './__generated__/rubricEditorChangeRubricTypeMutation.graphql';
import { rubricEditorChangeRubricDetailsPointsMutation } from './__generated__/rubricEditorChangeRubricDetailsPointsMutation.graphql';
import { rubricEditorQuery } from './__generated__/rubricEditorQuery.graphql';
import { rubricEditorChangeRubricPresetLabelMutation } from './__generated__/rubricEditorChangeRubricPresetLabelMutation.graphql';
import { rubricEditorChangeRubricPresetDirectionMutation } from './__generated__/rubricEditorChangeRubricPresetDirectionMutation.graphql';
import { rubricEditorChangePresetCommentPointsMutation } from './__generated__/rubricEditorChangePresetCommentPointsMutation.graphql';
import { rubricEditorChangePresetCommentLabelMutation } from './__generated__/rubricEditorChangePresetCommentLabelMutation.graphql';
import { rubricEditorChangePresetCommentGraderHintMutation } from './__generated__/rubricEditorChangePresetCommentGraderHintMutation.graphql';
import { rubricEditorChangePresetCommentStudentFeedbackMutation } from './__generated__/rubricEditorChangePresetCommentStudentFeedbackMutation.graphql';

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
  // const examVersionWithAnswers = examWithAnswers(exam, answers.answers);

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
              // eslint-disable-next-line react/no-array-index-key
              <Row key={qnum}>
                <Col>
                  <p>{`Question ${qnum + 1} rubric:`}</p>
                  <SingleRubricEditor
                    rubric={q.questionRubric}
                  />
                  {q.parts.map((p, pnum) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Row key={pnum}>
                      <Col>
                        <p>{`Question ${qnum + 1} part ${pnum + 1} rubric:`}</p>
                        <SingleRubricEditor
                          rubric={p.partRubric}
                        />
                        {p.body.map((b, bnum) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <Row key={bnum}>
                            <Col>
                              <p>{`Question ${qnum + 1} part ${pnum + 1} body ${bnum + 1} rubric:`}</p>
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
          {('choices' in rubric && 'direction' in rubric.choices) && (
            <>
              <Form.Label column sm="1">Label</Form.Label>
              <Col sm="4">
                <RubricPresetLabelEditor
                  rubricPreset={rubric.choices}
                />
              </Col>
              <Form.Label column sm="1">Direction</Form.Label>
              <Col sm="3">
                <RubricPresetDirectionEditor
                  rubricPreset={rubric.choices}
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
        {('choices' in rubric && 'presets' in rubric.choices) && (
          <Col>
            <Form.Group as={Row}>
              <Form.Label>
                Presets
                <span className="mx-2">
                  (most point values should be
                  <b className="mx-1">
                    {rubric.choices.direction === 'credit' ? 'positive' : 'negative'}
                  </b>
                  in this set of presets)
                </span>
              </Form.Label>
              {rubric.choices.presets.map((p) => (
                <RubricPresetEditor key={p.id} preset={p} />
              ))}
            </Form.Group>
          </Col>
        )}
      </Card.Body>
    </Card>
  );
};

const RubricPresetDirectionEditor: React.FC<{
  rubricPreset: RubricPresets;
}> = (props) => {
  const {
    rubricPreset,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangeRubricPresetDirectionMutation>(
    graphql`
    mutation rubricEditorChangeRubricPresetDirectionMutation($input: ChangeRubricPresetDetailsInput!) {
      changeRubricPresetDetails(input: $input) {
        rubricPreset {
          id
          direction
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing rubric preset direction',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const handleChange = (newDirection: RubricPresets['direction']) => {
    mutate({
      variables: {
        input: {
          rubricPresetId: rubricPreset.id,
          updateDirection: true,
          direction: newDirection,
        },
      },
    });
  };
  return (
    <>
      <ChangeRubricPresetDirection
        value={rubricPreset.direction}
        onChange={handleChange}
        disabled={loading}
      />
    </>
  );
};

const RubricPresetEditor: React.FC<{ preset: Preset }> = (props) => {
  const { preset } = props;
  return (
    <Card
      className="mb-3 alert-warning p-0 w-100"
      border="warning"
    >
      <Card.Body>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Label</Form.Label>
          <Col sm="4">
            <PresetCommentLabelEditor
              presetComment={preset}
            />
          </Col>
          <Form.Label column sm="2">Points</Form.Label>
          <Col sm="4">
            <PresetPointsEditor presetComment={preset} />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Grader hint</Form.Label>
          <Col sm="10">
            <PresetCommentGraderHintEditor
              presetComment={preset}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Student feedback</Form.Label>
          <Col sm="10">
            <PresetCommentStudentFeedbackEditor
              presetComment={preset}
            />
          </Col>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

const PresetCommentLabelEditor: React.FC<{
  presetComment: Preset;
}> = (props) => {
  const {
    presetComment,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangePresetCommentLabelMutation>(
    graphql`
    mutation rubricEditorChangePresetCommentLabelMutation($input: ChangePresetCommentDetailsInput!) {
      changePresetCommentDetails(input: $input) {
        presetComment {
          id
          label
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing preset comment label',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const handleChange = (newVal: string) => {
    mutate({
      variables: {
        input: {
          presetCommentId: presetComment.id,
          updateLabel: true,
          label: newVal,
        },
      },
    });
  };
  return (
    <DebouncedFormControl
      disabled={loading}
      onChange={handleChange}
      defaultValue={presetComment.label || ''}
      placeholder="(optional) Give a terse description of this preset comment"
    />
  );
};

const PresetCommentGraderHintEditor: React.FC<{
  presetComment: Preset;
}> = (props) => {
  const {
    presetComment,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangePresetCommentGraderHintMutation>(
    graphql`
    mutation rubricEditorChangePresetCommentGraderHintMutation($input: ChangePresetCommentDetailsInput!) {
      changePresetCommentDetails(input: $input) {
        presetComment {
          id
          graderHint
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing rubric preset grader hint',
          message: err.message,
          copyButton: true,
        });
      },
    }
  );
  const handleChange = (newVal: string) => {
    mutate({
      variables: {
        input: {
          presetCommentId: presetComment.id,
          updateGraderHint: true,
          graderHint: newVal,
        },
      },
    });
  };
  return (
    <DebouncedFormControl
      placeholder="Give a description to graders to use"
      defaultValue={presetComment.graderHint || ''}
      onChange={handleChange}
      disabled={loading}
    />
  );
};

const PresetCommentStudentFeedbackEditor: React.FC<{
  presetComment: Preset;
}> = (props) => {
  const {
    presetComment,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangePresetCommentStudentFeedbackMutation>(
    graphql`
    mutation rubricEditorChangePresetCommentStudentFeedbackMutation($input: ChangePresetCommentDetailsInput!) {
      changePresetCommentDetails(input: $input) {
        presetComment {
          id
          studentFeedback
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing rubric preset student feedback',
          message: err.message,
          copyButton: true,
        });
      },
    }
  );
  const handleChange = (newVal: string) => {
    mutate({
      variables: {
        input: {
          presetCommentId: presetComment.id,
          updateStudentFeedback: true,
          studentFeedback: newVal,
        },
      },
    });
  };
  return (
    <DebouncedFormControl
      placeholder="Give a default message to students -- if blank, will use the grader hint"
      defaultValue={presetComment.studentFeedback || ''}
      onChange={handleChange}
      disabled={loading}
    />
  );
};

interface ChangeRubricPresetDirectionProps {
  value: RubricPresets['direction'];
  onChange: (newval: RubricPresets['direction']) => void;
  disabled?: boolean;
}
const ChangeRubricPresetDirection: React.FC<ChangeRubricPresetDirectionProps> = (props) => {
  const {
    value,
    onChange,
    disabled = false,
  } = props;
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
              disabled={disabled}
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
  rubricPreset: RubricPresets;
}> = (props) => {
  const {
    rubricPreset,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangeRubricPresetLabelMutation>(
    graphql`
    mutation rubricEditorChangeRubricPresetLabelMutation($input: ChangeRubricPresetDetailsInput!) {
      changeRubricPresetDetails(input: $input) {
        rubricPreset {
          id
          label
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing rubric preset label',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const handleChange = (newVal: string) => {
    mutate({
      variables: {
        input: {
          rubricPresetId: rubricPreset.id,
          updateLabel: true,
          label: newVal,
        },
      },
    });
  };
  return (
    <DebouncedFormControl
      disabled={loading}
      defaultValue={rubricPreset.label}
      onChange={handleChange}
      placeholder="(optional) Give a short description of this rubric section"
    />
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
      disableAllWhenPreset={
        // only disable 'all' if we have any saved choices that are presests,
        // and presets are present
        'choices' in rubric && 'presets' in rubric.choices && rubric.choices.presets.length > 0
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
  const {
    value,
    onChange,
    disableAllWhenPreset,
    disabled = false,
  } = props;
  const changeRubricType = useCallback((newtype: RubricSelectOption) => {
    onChange(newtype.value);
  }, [value, onChange]);
  const disableAllOptionWhenPreset = useCallback((option: RubricSelectOption) => (
    option.value === 'all' && disableAllWhenPreset
  ), [disableAllWhenPreset]);
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
          isOptionDisabled={disableAllOptionWhenPreset}
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
    },
  );
  const onChange = (newDescription: HTMLVal) => {
    mutate({
      variables: {
        input: {
          rubricId: rubric.id,
          updateDescription: true,
          description: newDescription.value,
        },
      },
    });
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

const PresetPointsEditor: React.FC<{
  presetComment: Preset;
}> = (props) => {
  const { presetComment } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<rubricEditorChangePresetCommentPointsMutation>(
    graphql`
    mutation rubricEditorChangePresetCommentPointsMutation($input: ChangePresetCommentDetailsInput!) {
      changePresetCommentDetails(input: $input) {
        presetComment {
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
          title: 'Error changing preset comment points',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const handleChange = (newVal: number) => {
    mutate({
      variables: {
        input: {
          presetCommentId: presetComment.id,
          updatePoints: true,
          points: newVal,
        },
      },
    });
  };
  return (
    <NormalizedNumericInput
      defaultValue={presetComment.points.toString()}
      disabled={loading}
      step={0.5}
      variant="warning"
      onCommit={handleChange}
    />
  );
};

const RubricPointsEditor: React.FC<{
  rubric: RubricOne | RubricAny;
}> = (props) => {
  const { rubric } = props;
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
    },
  );
  const handleChange = (newVal: number) => {
    mutate({
      variables: {
        input: {
          rubricId: rubric.id,
          updatePoints: true,
          points: newVal,
        },
      },
    });
  };
  return (
    <NormalizedNumericInput
      defaultValue={rubric.points.toString()}
      disabled={loading}
      step={0.5}
      variant="warning"
      onCommit={handleChange}
    />
  );
};

const DebouncedFormControl: React.FC<{
  defaultValue: string;
  debounceMillis?: number;
  onChange: (newVal: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}> = (props) => {
  const {
    defaultValue,
    debounceMillis = 1000,
    onChange,
    disabled,
    className,
    placeholder,
  } = props;
  const [text, setText] = useState(defaultValue);
  const [debouncedText] = useDebounce(text, debounceMillis);
  useEffect(() => {
    if (debouncedText == defaultValue) {
      return;
    }
    onChange(debouncedText);
  }, [debouncedText]);
  useEffect(() => {
    setText(defaultValue);
  }, [defaultValue]);
  return (
    <Form.Control
      disabled={disabled}
      value={text}
      onChange={(e) => setText(e.target.value)}
      className={className}
      placeholder={placeholder}
    />
  );
};

const NormalizedNumericInput: React.FC<{
  defaultValue?: string;
  disabled?: boolean;
  onCommit: (newVal: number) => void;
  step?: number;
  variant?: ButtonProps['variant'];
}> = (props) => {
  const {
    defaultValue = '',
    disabled = false,
    onCommit,
    step,
    variant,
  } = props;
  const [pointsVal, setPointsVal] = useState(defaultValue);
  const handleChange: ChangeHandler = (newVal: string | number, focused: boolean) => {
    if (focused) {
      const normalized = normalizeNumber(newVal.toString(), pointsVal);
      setPointsVal(normalized);
    } else {
      if (newVal === defaultValue) return;
      onCommit(newVal as number);
    }
  };
  useEffect(() => {
    setPointsVal(defaultValue);
  }, [defaultValue]);
  return (
    <NumericInput
      disabled={disabled}
      value={pointsVal}
      step={step}
      variant={variant}
      onChange={handleChange}
    />
  );
};
