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
  Card,
  Col,
  Form,
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
          <Form.Group as={Row}>
            {rubric.choices.presets.map((p) => (
              <RubricPresetEditor key={p.id} preset={p} />
            ))}
          </Form.Group>
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
          updateLabel: false,
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
  const {
    graderHint,
    studentFeedback,
    label,
  } = preset;
  return (
    <Card
      className="mb-3 alert-warning p-0"
      border="warning"
    >
      <Card.Body>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Label</Form.Label>
          <Col sm="4">
            <input defaultValue={label} className="bg-white border rounded w-100" />
          </Col>
          <Form.Label column sm="2">Points</Form.Label>
          <Col sm="4">
            <PresetPointsEditor preset={preset} />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Grader hint</Form.Label>
          <Col sm="10">
            <input
              className="bg-white border rounded w-100"
              name="graderHint"
              placeholder="Give a description to graders to use"
              defaultValue={graderHint}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Student feedback</Form.Label>
          <Col sm="10">
            <input
              className="bg-white border rounded w-100"
              name="studentFeedback"
              defaultValue={studentFeedback}
              placeholder="Give a default message to students -- if blank, will use the grader hint"
            />
          </Col>
        </Form.Group>
      </Card.Body>
    </Card>
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
  const [currentLabel, setCurrentLabel] = useState(rubricPreset.label);
  const [debouncedLabel] = useDebounce(currentLabel, 1000);
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
  useEffect(() => {
    if (debouncedLabel === rubricPreset.label) {
      return;
    }
    mutate({
      variables: {
        input: {
          rubricPresetId: rubricPreset.id,
          updateDirection: false,
          updateLabel: true,
          label: debouncedLabel,
        },
      },
    });
  }, [debouncedLabel]);
  return (
    <Form.Control
      disabled={loading}
      value={currentLabel}
      onChange={(e) => setCurrentLabel(e.target.value)}
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
          updatePoints: false,
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
  preset: Preset
}> = (props) => {
  const { preset } = props;
  const [pointsVal, setPointsVal] = useState(preset.points.toString());
  // TODO: mutation
  const loading = false;
  const handleChange: ChangeHandler = (newVal : string | number, _focused: boolean) => {
    setPointsVal(String(newVal));
  };
  useEffect(() => {
    setPointsVal(preset.points.toString());
  }, [preset.points]);
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
    },
  );
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
