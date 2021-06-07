import React, {
  useCallback,
  useContext,
} from 'react';
import {
  graphql,
  useMutation,
  useFragment,
} from 'relay-hooks';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Dropdown,
  DropdownButton,
  Form,
  Row,
  ToggleButton,
} from 'react-bootstrap';
import Select from 'react-select';

import { AlertContext } from '@hourglass/common/alerts';
import { SelectOption, MutationReturn } from '@hourglass/common/helpers';
import { RearrangeableList } from '@hourglass/common/rearrangeable';
import Loading from '@hourglass/common/loading';
import { HTMLVal } from '@student/exams/show/types';
import Tooltip from '@student/exams/show/components/Tooltip';
import { expandRootRubric } from '@professor/exams/rubrics';
import {
  Preset,
  Rubric, RubricAll, RubricAny, RubricOne, RubricPresets,
} from '@professor/exams/types';
import {
  DragHandle,
  DestroyButton,
  DebouncedFormControl,
  EditHTMLVal,
  NormalizedNumericInput,
} from './components/helpers';

import { RubricChangeDetailsDescriptionMutation } from './__generated__/RubricChangeDetailsDescriptionMutation.graphql';
import { RubricChangeTypeMutation } from './__generated__/RubricChangeTypeMutation.graphql';
import { RubricChangeDetailsPointsMutation } from './__generated__/RubricChangeDetailsPointsMutation.graphql';
import { RubricChangeRubricPresetLabelMutation } from './__generated__/RubricChangeRubricPresetLabelMutation.graphql';
import { RubricChangeRubricPresetDirectionMutation } from './__generated__/RubricChangeRubricPresetDirectionMutation.graphql';
import { RubricChangePresetCommentPointsMutation } from './__generated__/RubricChangePresetCommentPointsMutation.graphql';
import { RubricChangePresetCommentLabelMutation } from './__generated__/RubricChangePresetCommentLabelMutation.graphql';
import { RubricChangePresetCommentGraderHintMutation } from './__generated__/RubricChangePresetCommentGraderHintMutation.graphql';
import { RubricChangePresetCommentStudentFeedbackMutation } from './__generated__/RubricChangePresetCommentStudentFeedbackMutation.graphql';
import { RubricCreatePresetCommentMutation } from './__generated__/RubricCreatePresetCommentMutation.graphql';
import { RubricCreateMutation } from './__generated__/RubricCreateMutation.graphql';
import { RubricCreateRubricPresetMutation } from './__generated__/RubricCreateRubricPresetMutation.graphql';
import { RubricDestroyPresetCommentMutation } from './__generated__/RubricDestroyPresetCommentMutation.graphql';
import { RubricDestroyMutation } from './__generated__/RubricDestroyMutation.graphql';
import { RubricReorderPresetCommentMutation } from './__generated__/RubricReorderPresetCommentMutation.graphql';
import { RubricReorderMutation } from './__generated__/RubricReorderMutation.graphql';
import { RubricSingle$key } from './__generated__/RubricSingle.graphql';

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

interface SingleRubricKeyEditorProps {
  rubricKey: RubricSingle$key;
  showDestroy?: boolean;
  disabled?: boolean;
}

export const SingleRubricKeyEditor: React.FC<SingleRubricKeyEditorProps> = (props) => {
  const {
    rubricKey,
    showDestroy = false,
    disabled = false,
  } = props;
  const rawRubric = useFragment<RubricSingle$key>(
    graphql`
    fragment RubricSingle on Rubric {
      id
      type
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
      subsections { id }
      allSubsections {
        id
        type
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
        subsections { id }
      }
    }
    `,
    rubricKey,
  );
  const rubric = expandRootRubric(rawRubric);
  return (
    <SingleRubricEditor
      rubric={rubric}
      showDestroy={showDestroy}
      disabled={disabled}
    />
  );
};

interface SingleRubricEditorProps {
  rubric: Rubric;
  showDestroy?: boolean;
  disabled?: boolean;
  handleRef?: React.Ref<HTMLElement>;
  isDragging?: boolean;
}
const SingleRubricEditor: React.FC<SingleRubricEditorProps> = (props) => {
  const {
    rubric,
    showDestroy = false,
    disabled = false,
    handleRef,
    isDragging = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricDestroyMutation>(
    graphql`
    mutation RubricDestroyMutation($input: DestroyRubricInput!) {
      destroyRubric(input: $input) {
        parentSection {
          examVersion {
            id
            rootRubric {
              allSubsections { 
                id 
                subsections { id }
              }
            }
          }
          question {
            id
            rootRubric {
              id
              allSubsections { 
                id 
                subsections { id }
              }
            }
          }
          part {
            id
            rootRubric {
              id
              allSubsections { 
                id 
                subsections { id }
              }
            }
          }
          bodyItem {
            id
            rootRubric {
              id
              allSubsections { 
                id 
                subsections { id }
              }
            }
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error destroying rubric section',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Card
      className={`${isDragging ? '' : 'mb-3'} alert-dark rubric p-0`}
      border="secondary"
    >
      <Card.Body>
        {handleRef && <DragHandle handleRef={handleRef} variant="secondary" />}
        {showDestroy && (
          <DestroyButton
            disabled={loading || disabled}
            onClick={() => {
              mutate({
                variables: {
                  input: {
                    rubricId: rubric.id,
                  },
                },
              });
            }}
          />
        )}
        <Form.Group as={Row} className={`${(handleRef && showDestroy) ? 'ml-4' : ''} ${showDestroy ? 'mr-4' : ''}`}>
          <Form.Label column sm="2">
            <h5 className="my-0">
              Rubric type
            </h5>
          </Form.Label>
          <Col sm="10">
            <RubricTypeEditor
              rubric={rubric}
              disabled={loading || disabled}
            />
          </Col>
        </Form.Group>
        {rubric.type !== 'none' && (
          <Form.Group>
            <RubricDescriptionEditor
              rubric={rubric}
              disabled={loading || disabled}
            />
          </Form.Group>
        )}
        <Form.Group as={Row}>
          {('choices' in rubric && 'direction' in rubric.choices && rubric.choices.presets.length > 0) && (
            <>
              <Col sm="12" md>
                <Row>
                  <Form.Label column sm="2" md="auto">Label</Form.Label>
                  <Col md>
                    <RubricPresetLabelEditor
                      rubricPreset={rubric.choices}
                      disabled={loading || disabled}
                    />
                  </Col>
                </Row>
              </Col>
              <Col sm="12" md="auto">
                <Row>
                  <Form.Label column sm="3" md="auto">Direction</Form.Label>
                  <Col>
                    <RubricPresetDirectionEditor
                      rubricPreset={rubric.choices}
                      disabled={loading || disabled}
                    />
                  </Col>
                </Row>
              </Col>
            </>
          )}
          {'points' in rubric && (
            <Col sm="12" md="3">
              <Row>
                <Form.Label column sm="2" md="auto">Points</Form.Label>
                <Col md>
                  <RubricPointsEditor
                    rubric={rubric}
                    disabled={loading || disabled}
                  />
                </Col>
              </Row>
            </Col>
          )}
        </Form.Group>
        {('choices' in rubric && rubric.choices instanceof Array) && (
          <ReordorableRubricEditor
            parentSectionId={rubric.id}
            subsections={rubric.choices}
          />
        )}
        {('choices' in rubric && 'presets' in rubric.choices && rubric.choices.presets.length > 0) && (
          <Form.Group as={Row}>
            <Col>
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
              <ReorderablePresetCommentEditor
                disabled={loading || disabled}
                rubricPreset={rubric.choices}
              />
            </Col>
          </Form.Group>
        )}
        {rubric.type !== 'none' && (
          <RubricEntriesEditor
            rubric={rubric}
            disabled={loading || disabled}
          />
        )}
      </Card.Body>
    </Card>
  );
};

const ReordorableRubricEditor: React.FC<{
  parentSectionId: string;
  subsections: Rubric[];
  disabled?: boolean;
}> = (props) => {
  const {
    parentSectionId,
    subsections,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricReorderMutation>(
    graphql`
    mutation RubricReorderMutation($input: ReorderRubricsInput!) {
      reorderRubrics(input: $input) {
        parentSection {
          id
          subsections {
            id
            order
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error reordering rubric subsection',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const rearrangeSections = useCallback((from, to) => {
    mutate({
      variables: {
        input: {
          parentSectionId,
          fromIndex: from,
          toIndex: to,
        },
      },
    });
  }, [mutate, parentSectionId]);
  return (
    <RearrangeableList
      dbArray={subsections}
      identifier={`SECTION-INDEX-${parentSectionId}`}
      className="mb-3"
      dropVariant="light"
      onRearrange={rearrangeSections}
    >
      {(subRubric, handleRef, isDragging) => (
        <SingleRubricEditor
          rubric={subRubric}
          showDestroy
          disabled={loading || disabled}
          handleRef={handleRef}
          isDragging={isDragging}
        />
      )}
    </RearrangeableList>
  );
};

const ReorderablePresetCommentEditor: React.FC<{
  rubricPreset: RubricPresets;
  disabled?: boolean;
}> = (props) => {
  const {
    rubricPreset,
    disabled = false,
  } = props;
  const { presets } = rubricPreset;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricReorderPresetCommentMutation>(
    graphql`
    mutation RubricReorderPresetCommentMutation($input: ReorderPresetCommentsInput!) {
      reorderPresetComments(input: $input) {
        rubricPreset {
          id
          presetComments {
            id
            label
            order
            points
            graderHint
            studentFeedback
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error reordering preset comment',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const rearrangePresets = useCallback((from, to) => {
    mutate({
      variables: {
        input: {
          rubricPresetId: rubricPreset.id,
          fromIndex: from,
          toIndex: to,
        },
      },
    });
  }, [mutate, rubricPreset.id]);
  return (
    <RearrangeableList
      dbArray={presets}
      className="mb-3"
      dropVariant="light"
      identifier={`PRESET-INDEX-${rubricPreset.id}`}
      onRearrange={rearrangePresets}
    >
      {(preset, handleRef, isDragging) => (
        <RubricPresetEditor
          preset={preset}
          disabled={disabled || loading}
          isDragging={isDragging}
          handleRef={handleRef}
        />
      )}
    </RearrangeableList>
  );
};

const RubricEntriesEditor: React.FC<{
  rubric: RubricAny | RubricAll | RubricOne;
  disabled?: boolean;
}> = (props) => {
  const {
    rubric,
    disabled = false,
  } = props;
  const {
    choices,
  } = rubric;
  const addNewRubricSection = (
    <CreateRubricSectionButton
      parentSectionId={rubric.id}
      disabled={disabled}
    />
  );
  const addNewRubricItemDropdown = (
    <CreateRubricItemDropdown
      parentSectionId={rubric.id}
      disabled={disabled}
    />
  );
  if (choices instanceof Array) {
    if (choices.length > 0) {
      return addNewRubricSection;
    }
    if (rubric.type === 'all') {
      return addNewRubricSection;
    }
    return addNewRubricItemDropdown;
  }
  if (choices.presets.length > 0) {
    return (
      <div className="text-center">
        <CreatePresetCommentButton
          rubricPresetId={choices.id}
        />
      </div>
    );
  }
  // This should not be reached, but we will make it the same as the false/false case above
  // for completeness
  if (rubric.type === 'all') {
    return addNewRubricSection;
  }
  return addNewRubricItemDropdown;
};

function useCreateRubricMutation(): MutationReturn<RubricCreateMutation> {
  const { alert } = useContext(AlertContext);
  const results = useMutation<RubricCreateMutation>(
    graphql`
    mutation RubricCreateMutation($input: CreateRubricInput!) {
      createRubric(input: $input) {
        parentSection {
          id
          subsections { id }
        }
        rubric {
          id
          type
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
          examVersion {
            id
            rootRubric {
              id
              allSubsections { id }
            }
          }
          question {
            id
            rootRubric {
              id
              allSubsections { id }
            }
          }
          part {
            id
            rootRubric {
              id
              allSubsections { id }
            }
          }
          bodyItem {
            id
            rootRubric {
              id
              allSubsections { id }
            }
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating rubric section',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return results;
}

const CreateRubricItemDropdown: React.FC<{
  parentSectionId: string;
  disabled?: boolean;
}> = (props) => {
  const {
    parentSectionId,
    disabled = false,
  } = props;
  const [sectionMutate, { loading: sectionLoading }] = useCreateRubricMutation();
  const { alert } = useContext(AlertContext);
  const [
    presetCommentMutate,
    { loading: presetCommentLoading },
  ] = useMutation<RubricCreateRubricPresetMutation>(
    graphql`
    mutation RubricCreateRubricPresetMutation($input: CreateRubricPresetInput!) {
      createRubricPreset(input: $input) {
        rubric {
          id
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
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating preset comment',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const loading = sectionLoading || presetCommentLoading;
  return (
    <Row className="text-center">
      <Col>
        <DropdownButton
          title="Add new rubric item..."
          variant="secondary"
          disabled={loading || disabled}
        >
          <Dropdown.Item
            onClick={() => {
              sectionMutate({
                variables: {
                  input: {
                    type: 'none',
                    parentSectionId,
                  },
                },
              });
            }}
          >
            Rubric section
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              presetCommentMutate({
                variables: {
                  input: {
                    rubricId: parentSectionId,
                    direction: 'credit',
                  },
                },
              });
            }}
          >
            Preset comment
          </Dropdown.Item>
        </DropdownButton>
      </Col>
    </Row>
  );
};

const CreateRubricSectionButton: React.FC<{
  parentSectionId: string;
  disabled?: boolean;
}> = (props) => {
  const {
    parentSectionId,
    disabled = false,
  } = props;
  const [mutate, { loading }] = useCreateRubricMutation();
  return (
    <Row className="text-center">
      <Col>
        <Button
          variant="secondary"
          disabled={loading || disabled}
          onClick={() => {
            mutate({
              variables: {
                input: {
                  type: 'none',
                  parentSectionId,
                },
              },
            });
          }}
        >
          Add new rubric section
        </Button>
      </Col>
    </Row>
  );
};

const CreatePresetCommentButton: React.FC<{
  rubricPresetId: string;
}> = (props) => {
  const {
    rubricPresetId,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricCreatePresetCommentMutation>(
    graphql`
    mutation RubricCreatePresetCommentMutation($input: CreatePresetCommentInput!) {
      createPresetComment(input: $input) {
        rubricPreset {
          id
          presetComments {
            id
            label
            order
            points
            graderHint
            studentFeedback
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating rubric preset',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Button
      disabled={loading}
      variant="warning"
      onClick={() => {
        mutate({
          variables: {
            input: {
              rubricPresetId,
              graderHint: '',
              points: 0,
            },
          },
        });
      }}
    >
      Add new preset
    </Button>
  );
};

const RubricPresetDirectionEditor: React.FC<{
  rubricPreset: RubricPresets;
  disabled?: boolean;
}> = (props) => {
  const {
    rubricPreset,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangeRubricPresetDirectionMutation>(
    graphql`
    mutation RubricChangeRubricPresetDirectionMutation($input: ChangeRubricPresetDetailsInput!) {
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
  const handleChange = useCallback((newDirection: RubricPresets['direction']) => {
    mutate({
      variables: {
        input: {
          rubricPresetId: rubricPreset.id,
          updateDirection: true,
          direction: newDirection,
        },
      },
    });
  }, [rubricPreset.id]);
  return (
    <>
      <ChangeRubricPresetDirection
        value={rubricPreset.direction}
        onChange={handleChange}
        disabled={loading || disabled}
      />
    </>
  );
};

const RubricPresetEditor: React.FC<{
  preset: Preset;
  disabled?: boolean;
  isDragging?: boolean;
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    preset,
    disabled = false,
    isDragging = false,
    handleRef,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricDestroyPresetCommentMutation>(
    graphql`
    mutation RubricDestroyPresetCommentMutation($input: DestroyPresetCommentInput!) {
      destroyPresetComment(input: $input) {
        rubric {
          id
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
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error destroying rubric preset',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Card
      className={`${isDragging ? '' : 'mb-3'} alert-warning p-0 w-100`}
      border="warning"
    >
      <Card.Body>
        {handleRef && <DragHandle handleRef={handleRef} variant="warning" />}
        <DestroyButton
          disabled={loading || disabled}
          onClick={() => {
            mutate({
              variables: {
                input: {
                  presetCommentId: preset.id,
                },
              },
            });
          }}
        />
        <Form.Group as={Row} className={handleRef ? 'ml-4' : ''}>
          <Form.Label column sm="2">
            Label
          </Form.Label>
          <Col sm="4">
            <PresetCommentLabelEditor
              disabled={loading || disabled}
              presetComment={preset}
            />
          </Col>
          <Form.Label column sm="2">Points</Form.Label>
          <Col className="pr-5">
            <PresetPointsEditor
              disabled={loading || disabled}
              presetComment={preset}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className={handleRef ? 'ml-4' : ''}>
          <Form.Label column sm="2">Grader hint</Form.Label>
          <Col sm="10">
            <PresetCommentGraderHintEditor
              disabled={loading || disabled}
              presetComment={preset}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className={handleRef ? 'ml-4' : ''}>
          <Form.Label column sm="2">Student feedback</Form.Label>
          <Col sm="10">
            <PresetCommentStudentFeedbackEditor
              disabled={loading || disabled}
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
  disabled?: boolean;
}> = (props) => {
  const {
    presetComment,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangePresetCommentLabelMutation>(
    graphql`
    mutation RubricChangePresetCommentLabelMutation($input: ChangePresetCommentDetailsInput!) {
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
  const handleChange = useCallback((newVal: string) => {
    mutate({
      variables: {
        input: {
          presetCommentId: presetComment.id,
          updateLabel: true,
          label: newVal,
        },
      },
    });
  }, [presetComment.id]);
  return (
    <DebouncedFormControl
      disabled={loading || disabled}
      onChange={handleChange}
      defaultValue={presetComment.label || ''}
      placeholder="(optional) Give a terse description of this preset comment"
    />
  );
};

const PresetCommentGraderHintEditor: React.FC<{
  presetComment: Preset;
  disabled?: boolean;
}> = (props) => {
  const {
    presetComment,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangePresetCommentGraderHintMutation>(
    graphql`
    mutation RubricChangePresetCommentGraderHintMutation($input: ChangePresetCommentDetailsInput!) {
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
    },
  );
  const handleChange = useCallback((newVal: string) => {
    mutate({
      variables: {
        input: {
          presetCommentId: presetComment.id,
          updateGraderHint: true,
          graderHint: newVal,
        },
      },
    });
  }, [presetComment.id]);
  return (
    <DebouncedFormControl
      placeholder="Give a description to graders to use"
      defaultValue={presetComment.graderHint || ''}
      onChange={handleChange}
      disabled={loading || disabled}
    />
  );
};

const PresetCommentStudentFeedbackEditor: React.FC<{
  presetComment: Preset;
  disabled?: boolean;
}> = (props) => {
  const {
    presetComment,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangePresetCommentStudentFeedbackMutation>(
    graphql`
    mutation RubricChangePresetCommentStudentFeedbackMutation($input: ChangePresetCommentDetailsInput!) {
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
    },
  );
  const handleChange = useCallback((newVal: string) => {
    mutate({
      variables: {
        input: {
          presetCommentId: presetComment.id,
          updateStudentFeedback: true,
          studentFeedback: newVal,
        },
      },
    });
  }, [presetComment.id]);
  return (
    <DebouncedFormControl
      placeholder="Give a default message to students -- if blank, will use the grader hint"
      defaultValue={presetComment.studentFeedback || ''}
      onChange={handleChange}
      disabled={loading || disabled}
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
  disabled?: boolean;
}> = (props) => {
  const {
    rubricPreset,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangeRubricPresetLabelMutation>(
    graphql`
    mutation RubricChangeRubricPresetLabelMutation($input: ChangeRubricPresetDetailsInput!) {
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
  const handleChange = useCallback((newVal: string) => {
    mutate({
      variables: {
        input: {
          rubricPresetId: rubricPreset.id,
          updateLabel: true,
          label: newVal,
        },
      },
    });
  }, [rubricPreset.id]);
  return (
    <DebouncedFormControl
      disabled={loading || disabled}
      defaultValue={rubricPreset.label}
      onChange={handleChange}
      placeholder="(optional) Give a short description of this rubric section"
    />
  );
};

// given a rubric, hook up GraphQL mutation for type changes
const RubricTypeEditor: React.FC<{
  rubric: Rubric;
  disabled?: boolean;
}> = (props) => {
  const {
    rubric,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangeTypeMutation>(
    graphql`
    mutation RubricChangeTypeMutation($input: ChangeRubricTypeInput!) {
      changeRubricType(input: $input) {
        rubric {
          id
          type
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
  const onChange = useCallback((newType: Rubric['type']) => {
    mutate({
      variables: {
        input: {
          rubricId: rubric.id,
          type: newType,
        },
      },
    });
  }, [rubric.id]);
  return (
    <ChangeRubricType
      disabled={loading || disabled}
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
    <Loading loading={disabled} noText>
      <Select
        classNamePrefix="select"
        className="z-1000-select"
        options={options}
        value={defaultOptions[value || 'none']}
        isOptionDisabled={disableAllOptionWhenPreset}
        onChange={changeRubricType}
      />
    </Loading>
  );
};

const RubricDescriptionEditor: React.FC<{
  rubric: RubricAll | RubricOne | RubricAny;
  disabled?: boolean;
}> = (props) => {
  const {
    rubric,
    disabled = false,
  } = props;
  const { description = { type: 'HTML', value: '' } } = rubric;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangeDetailsDescriptionMutation>(
    graphql`
    mutation RubricChangeDetailsDescriptionMutation($input: ChangeRubricDetailsInput!) {
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
  const onChange = useCallback((newDescription: HTMLVal) => {
    mutate({
      variables: {
        input: {
          rubricId: rubric.id,
          updateDescription: true,
          description: newDescription.value,
        },
      },
    });
  }, [rubric.id]);
  return (
    <EditHTMLVal
      className="bg-white border rounded"
      disabled={loading || disabled}
      value={description}
      onChange={onChange}
      placeholder={`Give use-${rubric.type} rubric instructions here`}
      debounceDelay={1000}
    />
  );
};

const PresetPointsEditor: React.FC<{
  presetComment: Preset;
  disabled?: boolean;
}> = (props) => {
  const {
    presetComment,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangePresetCommentPointsMutation>(
    graphql`
    mutation RubricChangePresetCommentPointsMutation($input: ChangePresetCommentDetailsInput!) {
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
      disabled={loading || disabled}
      step={0.5}
      variant="warning"
      onCommit={handleChange}
    />
  );
};

const RubricPointsEditor: React.FC<{
  rubric: RubricOne | RubricAny;
  disabled?: boolean;
}> = (props) => {
  const {
    rubric,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<RubricChangeDetailsPointsMutation>(
    graphql`
    mutation RubricChangeDetailsPointsMutation($input: ChangeRubricDetailsInput!) {
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
      disabled={loading || disabled}
      step={0.5}
      variant="warning"
      onCommit={handleChange}
    />
  );
};
