import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@hourglass/common/context';
import {
  HTMLVal,
  ExamFile,
  FileRef,
  YesNoInfo,
  BodyItemInfo,
  CodeState,
  AllThatApplyState,
  MultipleChoiceState,
  YesNoState,
  TextState,
  CodeTagState,
} from '@student/exams/show/types';
import {
  Preset,
  Rubric, RubricAll, RubricAny, RubricOne, RubricPresets,
} from '@professor/exams/types';
import {
  graphql,
  useQuery,
  useMutation,
  MutateWithVariables,
  MutationState,
  useFragment,
} from 'relay-hooks';

import { RenderError } from '@hourglass/common/boundary';
import { expandRootRubric } from '@professor/exams/rubrics';
import {
  Button,
  ButtonGroup,
  ButtonProps,
  Card,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Row,
  ToggleButton,
} from 'react-bootstrap';
import { alphabetIdx, SelectOption } from '@hourglass/common/helpers';
import Select from 'react-select';
import { AlertContext } from '@hourglass/common/alerts';
import CustomEditor from '@hourglass/workflows/professor/exams/new/old-editor/components/CustomEditor';
import { useDebounce, useDebouncedCallback } from 'use-debounce/lib';
import { ChangeHandler, normalizeNumber, NumericInput } from '@hourglass/common/NumericInput';
import Tooltip from '@hourglass/workflows/student/exams/show/components/Tooltip';
import Loading from '@hourglass/common/loading';
import { MutationParameters } from 'relay-runtime';
import { FaTrashAlt } from 'react-icons/fa';
import RearrangableList from '@hourglass/common/rearrangeable';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import { GrDrag } from 'react-icons/gr';
import { useParams } from 'react-router-dom';
import YesNoControl from '@student/exams/show/components/questions/YesNo';
import { ReactQuillProps } from 'react-quill';
import Policies from './Policies';
import FileUploader from './FileUploader';
import Instructions from './Instructions';
import EditReference from './Reference';
import { editorChangeRubricDetailsDescriptionMutation } from './__generated__/editorChangeRubricDetailsDescriptionMutation.graphql';
import { editorChangeRubricTypeMutation } from './__generated__/editorChangeRubricTypeMutation.graphql';
import { editorChangeRubricDetailsPointsMutation } from './__generated__/editorChangeRubricDetailsPointsMutation.graphql';
import { editorQuery } from './__generated__/editorQuery.graphql';
import { editorChangeRubricPresetLabelMutation } from './__generated__/editorChangeRubricPresetLabelMutation.graphql';
import { editorChangeRubricPresetDirectionMutation } from './__generated__/editorChangeRubricPresetDirectionMutation.graphql';
import { editorChangePresetCommentPointsMutation } from './__generated__/editorChangePresetCommentPointsMutation.graphql';
import { editorChangePresetCommentLabelMutation } from './__generated__/editorChangePresetCommentLabelMutation.graphql';
import { editorChangePresetCommentGraderHintMutation } from './__generated__/editorChangePresetCommentGraderHintMutation.graphql';
import { editorChangePresetCommentStudentFeedbackMutation } from './__generated__/editorChangePresetCommentStudentFeedbackMutation.graphql';
import { editorCreatePresetCommentMutation } from './__generated__/editorCreatePresetCommentMutation.graphql';
import { editorCreateRubricMutation } from './__generated__/editorCreateRubricMutation.graphql';
import { editorCreateRubricPresetMutation } from './__generated__/editorCreateRubricPresetMutation.graphql';
import { editorDestroyPresetCommentMutation } from './__generated__/editorDestroyPresetCommentMutation.graphql';
import { editorDestroyRubricMutation } from './__generated__/editorDestroyRubricMutation.graphql';
import { editorReorderPresetCommentMutation } from './__generated__/editorReorderPresetCommentMutation.graphql';
import { editorReorderRubricsMutation } from './__generated__/editorReorderRubricsMutation.graphql';
import { editorSingle$key } from './__generated__/editorSingle.graphql';
import { editorQuestionEditor$key } from './__generated__/editorQuestionEditor.graphql';
import { editorPartEditor$key } from './__generated__/editorPartEditor.graphql';
import { editorBodyItemEditor$key } from './__generated__/editorBodyItemEditor.graphql';
import CodeTag from './body-items/CodeTag';
import Text from './body-items/Text';
import YesNo from './body-items/YesNo';
import Code from './body-items/Code';
import AllThatApply from './body-items/AllThatApply';
import MultipleChoice from './body-items/MultipleChoice';

export const DragHandle: React.FC<{
  handleRef: React.Ref<HTMLElement>,
  variant?: ButtonProps['variant'],
  className?: string,
  alignmentClass?: string,
}> = (props) => {
  const {
    handleRef,
    variant = 'secondary',
    className = 'cursor-grab',
    alignmentClass = 'position-absolute t-0 l-0 z-1000',
  } = props;
  return (
    <span className={`${alignmentClass} btn btn-sm btn-${variant} ${className}`} ref={handleRef}>
      <Icon I={GrDrag} />
    </span>
  );
};

const RubricEditor: React.FC = () => {
  const { versionId: examVersionId } = useParams<{ versionId: string }>();
  const res = useQuery<editorQuery>(
    graphql`
    query editorQuery($examVersionId: ID!) {
      examVersion(id: $examVersionId) {
        name
        rootRubric { ...editorSingle }
        files
        instructions {
          type
          value
        }
        dbReferences {
          type
          path
        }
        policies
        dbQuestions {
          ...editorQuestionEditor
          id
          rootRubric { ...editorSingle }
          parts {
            id
            rootRubric { ...editorSingle }
            bodyItems {
              id
              rootRubric { ...editorSingle }
            }
          }
        }
      }
    }
    `,
    { examVersionId },
  );
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.data) {
    return <Container><p>Loading...</p></Container>;
  }
  const { examVersion } = res.data;
  const { rootRubric, dbQuestions, policies } = examVersion;

  return (
    <Container fluid>
      <ExamContext.Provider
        value={{
          files: examVersion.files as ExamFile[],
          fmap: createMap(examVersion.files as ExamFile[]),
        }}
      >
        <ExamFilesContext.Provider
          value={{
            references: examVersion.dbReferences,
          }}
        >
          <Row>
            <Col sm={{ span: 8, offset: 2 }}>
              <Form.Group as={Row} controlId="examTitle">
                <Form.Label column sm="auto"><h2>Version name:</h2></Form.Label>
                <Col>
                  <Form.Control
                    size="lg"
                    type="text"
                    placeholder="Enter a name for this version"
                    value={examVersion.name}
                    onChange={console.log}
                  />
                </Col>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <Row>
                <Col sm={6}>
                  <div className="alert alert-info">
                    <h4>Exam-wide information</h4>
                    <Policies
                      value={policies}
                      onChange={console.log}
                    />
                    <FileUploader
                      value={examVersion.files as ExamFile[]}
                      onChange={console.log}
                    />
                    <Instructions
                      value={examVersion.instructions}
                      onChange={console.log}
                    />
                  </div>
                  <Form.Group as={Row}>
                    <EditReference
                      value={examVersion.dbReferences as FileRef[]}
                      onChange={console.log}
                      label="the entire exam"
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <SingleRubricKeyEditor
                    rubricKey={rootRubric}
                  />
                </Col>
              </Row>
              <RearrangableList
                dbArray={dbQuestions}
                onRearrange={console.log}
                identifier={`QUESTION-${examVersionId}`}
              >
                {(question, handleRef) => (
                  <QuestionEditor
                    questionKey={question}
                    handleRef={handleRef}
                  />
                )}
              </RearrangableList>
              <Row className="text-center">
                <Col>
                  <Button
                    variant="primary"
                    onClick={console.log}
                  >
                    Add question
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </ExamFilesContext.Provider>
      </ExamContext.Provider>
    </Container>
  );
};
export default RubricEditor;

const SEP_SUB_YESNO: YesNoInfo = {
  type: 'YesNo',
  yesLabel: 'Yes',
  noLabel: 'No',
  prompt: { type: 'HTML', value: '' },
};

const QuestionEditor: React.FC<{
  questionKey: editorQuestionEditor$key;
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    questionKey,
    handleRef,
  } = props;
  const question = useFragment(
    graphql`
    fragment editorQuestionEditor on Question {
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
        type
        path
      }
      separateSubparts
      extraCredit
      rootRubric { ...editorSingle }
      parts {
        id
        ...editorPartEditor
      }
    }
    `,
    questionKey,
  );
  return (
    <Card
      className="mb-3"
      border="primary"
    >
      <div className="alert alert-primary">
        <Card.Title>
          {handleRef && <DragHandle variant="primary" handleRef={handleRef} />}
          <Row>
            <Col sm="auto" className={handleRef ? 'ml-4' : ''}>
              <Form.Label column>{`Question ${question.index + 1}:`}</Form.Label>
            </Col>
            <Col>
              <EditHTMLVal
                className="bg-white border rounded"
                // disabled={loading || disabled}
                value={question.name || {
                  type: 'HTML',
                  value: '',
                }}
                onChange={console.log}
                placeholder="Give a short (optional) descriptive name for the question"
                debounceDelay={1000}
              />
            </Col>
          </Row>
        </Card.Title>
      </div>
      <Card.Body>
        <Row>
          <Col sm="6">
            <Form.Group as={Row}>
              <Form.Label column sm="2">Description:</Form.Label>
              <Col sm="10">
                <EditHTMLVal
                  className="bg-white border rounded"
                  // disabled={loading || disabled}
                  value={question.description || {
                    type: 'HTML',
                    value: '',
                  }}
                  onChange={console.log}
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
                  value={!!question.separateSubparts}
                  info={SEP_SUB_YESNO}
                  onChange={console.log}
                />
              </Col>
              <Form.Label column sm="2">Extra credit?</Form.Label>
              <Col sm="4">
                <YesNoControl
                  className="bg-white rounded"
                  value={!!question.extraCredit}
                  info={SEP_SUB_YESNO}
                  onChange={console.log}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <EditReference
                value={question.references as FileRef[]}
                onChange={console.log}
                label="this question"
              />
            </Form.Group>
          </Col>
          <Col sm="6">
            <SingleRubricKeyEditor
              rubricKey={question.rootRubric}
            />
          </Col>
        </Row>
        <RearrangableList
          dbArray={question.parts}
          identifier={`PART-${question.id}`}
          onRearrange={console.log}
        >
          {(part, partHandleRef) => (
            <Row key={part.id}>
              <Col>
                <PartEditor
                  partKey={part}
                  handleRef={partHandleRef}
                />
              </Col>
            </Row>
          )}
        </RearrangableList>
        <Row className="text-center">
          <Col>
            <Button
              variant="success"
              onClick={console.log}
            >
              Add part
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const PartEditor: React.FC<{
  partKey: editorPartEditor$key;
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    partKey,
    handleRef,
  } = props;
  const part = useFragment(
    graphql`
    fragment editorPartEditor on Part {
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
        type
        path
      }
      extraCredit
      points
      rootRubric { ...editorSingle }
      bodyItems {
        id
        ...editorBodyItemEditor
      }
    }
    `,
    partKey,
  );
  return (
    <Card
      className="mb-3"
      border="success"
    >
      <div className="alert alert-success">
        <Card.Title>
          {handleRef && <DragHandle handleRef={handleRef} variant="success" />}
          <Row>
            <Col sm="auto" className={handleRef ? 'ml-4' : ''}>
              <Form.Label column>{`Part ${alphabetIdx(part.index)}:`}</Form.Label>
            </Col>
            <Col>
              <EditHTMLVal
                className="bg-white border rounded"
                // disabled={loading || disabled}
                value={part.name || {
                  type: 'HTML',
                  value: '',
                }}
                onChange={console.log}
                placeholder="Give a short (optional) descriptive name for the part"
                debounceDelay={1000}
              />
            </Col>
          </Row>
        </Card.Title>
      </div>
      <Card.Body>
        <Row>
          <Col sm="6">
            <Form.Group as={Row}>
              <Form.Label column sm="2">Description:</Form.Label>
              <Col sm="10">
                <EditHTMLVal
                  className="bg-white border rounded"
                  // disabled={loading || disabled}
                  value={part.description || {
                    type: 'HTML',
                    value: '',
                  }}
                  onChange={console.log}
                  placeholder="Give a longer description of the part"
                  debounceDelay={1000}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm="2">Points</Form.Label>
              <Col sm="4">
                <NormalizedNumericInput
                  defaultValue={part.points.toString()}
                  // disabled={loading || disabled}
                  step={0.5}
                  variant="warning"
                  onCommit={console.log}
                />
              </Col>
              <Form.Label column sm="2">Extra credit?</Form.Label>
              <Col sm="4">
                <YesNoControl
                  className="bg-white rounded"
                  value={!!part.extraCredit}
                  info={SEP_SUB_YESNO}
                  onChange={console.log}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <EditReference
                value={part.references as FileRef[]}
                onChange={console.log}
                label="this question part"
              />
            </Form.Group>
          </Col>
          <Col sm="6">
            <SingleRubricKeyEditor
              rubricKey={part.rootRubric}
            />
          </Col>
        </Row>
        <RearrangableList
          dbArray={part.bodyItems}
          identifier={`BODYITEM-${part.id}`}
          onRearrange={console.log}
        >
          {(bodyItem, bodyItemHandleRef) => (
            <Row key={bodyItem.id}>
              <Col>
                <BodyItemEditor
                  bodyItemKey={bodyItem}
                  handleRef={bodyItemHandleRef}
                />
              </Col>
            </Row>
          )}
        </RearrangableList>
        <Row className="text-center">
          <Col>
            <DropdownButton
              // disabled={loading}
              variant="secondary"
              title="Add new item..."
            >
              <Dropdown.Item
                onClick={console.log}
              >
                Text instructions
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={console.log}
              >
                All that apply
              </Dropdown.Item>
              <Dropdown.Item
                onClick={console.log}
              >
                Code
              </Dropdown.Item>
              <Dropdown.Item
                onClick={console.log}
              >
                Code tag
              </Dropdown.Item>
              <Dropdown.Item
                onClick={console.log}
              >
                Matching
              </Dropdown.Item>
              <Dropdown.Item
                onClick={console.log}
              >
                Multiple choice
              </Dropdown.Item>
              <Dropdown.Item
                onClick={console.log}
              >
                Free-response
              </Dropdown.Item>
              <Dropdown.Item
                onClick={console.log}
              >
                Yes/No or True/False
              </Dropdown.Item>
            </DropdownButton>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const BodyItemEditor: React.FC<{
  bodyItemKey: editorBodyItemEditor$key;
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    bodyItemKey,
    handleRef,
  } = props;
  const bodyItem = useFragment(
    graphql`
    fragment editorBodyItemEditor on BodyItem {
      id
      info
      answer
      rootRubric { ...editorSingle }
    }
    `,
    bodyItemKey,
  );
  const info = bodyItem.info as BodyItemInfo;
  const {
    id,
    answer,
  } = bodyItem;
  let editor;
  let showRubric = true;
  switch (info.type) {
    case 'HTML':
      showRubric = false;
      editor = (
        <EditHTMLVal
          className="text-instructions bg-white"
          // disabled={loading || disabled}
          theme="snow"
          value={info}
          onChange={console.log}
          debounceDelay={1000}
          placeholder="Provide instructions here..."
        />
      );
      break;
    case 'Code':
      editor = (
        <Code
          id={id}
          info={info}
          answer={answer as CodeState}
        />
      );
      break;
    case 'AllThatApply':
      editor = (
        <AllThatApply
          id={id}
          info={info}
          answer={answer as AllThatApplyState}
        />
      );
      break;
    case 'MultipleChoice':
      editor = (
        <MultipleChoice
          id={id}
          info={info}
          answer={answer as MultipleChoiceState}
        />
      );
      break;
    case 'YesNo':
      editor = (
        <YesNo
          id={id}
          info={info}
          answer={answer as YesNoState}
        />
      );
      break;
    case 'Text':
      editor = (
        <Text
          id={id}
          info={info}
          answer={answer as TextState}
        />
      );
      break;
    case 'CodeTag':
      editor = (
        <CodeTag
          id={id}
          info={info}
          answer={answer as CodeTagState}
        />
      );
      break;
    default:
      return <p>{`todo: ${info.type}`}</p>;
    // case 'Matching':
    //   editor = <Matching qnum={qnum} pnum={pnum} bnum={bnum} />;
    //   break;
    // default:
    //   throw new ExhaustiveSwitchError(info);
  }
  return (
    <Card
      className="border border-secondary alert-secondary mb-3"
    >
      {handleRef && <DragHandle handleRef={handleRef} variant="secondary" />}
      <Card.Body className="ml-4">
        <Row>
          <Col sm={showRubric ? 6 : 12}>
            {editor}
          </Col>
          {showRubric && (
            <Col sm="6">
              <SingleRubricKeyEditor
                rubricKey={bodyItem.rootRubric}
              />
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};

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
  rubricKey: editorSingle$key;
  showDestroy?: boolean;
  disabled?: boolean;
}

const SingleRubricKeyEditor: React.FC<SingleRubricKeyEditorProps> = (props) => {
  const {
    rubricKey,
    showDestroy = false,
    disabled = false,
  } = props;
  const rawRubric = useFragment<editorSingle$key>(
    graphql`
    fragment editorSingle on Rubric {
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
}
const SingleRubricEditor: React.FC<SingleRubricEditorProps> = (props) => {
  const {
    rubric,
    showDestroy = false,
    disabled = false,
    handleRef,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<editorDestroyRubricMutation>(
    graphql`
    mutation editorDestroyRubricMutation($input: DestroyRubricInput!) {
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
      className="mb-3 alert-dark rubric p-0"
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
        {'description' in rubric && (
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
            rubricId={rubric.id}
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
              <ReordorablePresetCommentEditor
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
  rubricId: string;
  subsections: Rubric[];
  disabled?: boolean;
}> = (props) => {
  const {
    rubricId,
    subsections,
    disabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<editorReorderRubricsMutation>(
    graphql`
    mutation editorReorderRubricsMutation($input: ReorderRubricsInput!) {
      reorderRubrics(input: $input) {
        rubric {
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
  return (
    <RearrangableList
      dbArray={subsections}
      identifier={`SECTION-INDEX-${rubricId}`}
      onRearrange={(from, to) => {
        mutate({
          variables: {
            input: {
              parentSectionId: rubricId,
              fromIndex: from,
              toIndex: to,
            },
          },
        });
      }}
    >
      {(subRubric, handleRef) => (
        <SingleRubricEditor
          rubric={subRubric}
          showDestroy
          disabled={loading || disabled}
          handleRef={handleRef}
        />
      )}
    </RearrangableList>
  );
};

const ReordorablePresetCommentEditor: React.FC<{
  rubricPreset: RubricPresets;
  disabled?: boolean;
}> = (props) => {
  const {
    rubricPreset,
    disabled = false,
  } = props;
  const { presets } = rubricPreset;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<editorReorderPresetCommentMutation>(
    graphql`
    mutation editorReorderPresetCommentMutation($input: ReorderPresetCommentsInput!) {
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
  return (
    <RearrangableList
      dbArray={presets}
      identifier={`PRESET-INDEX-${rubricPreset.id}`}
      onRearrange={(from, to) => {
        mutate({
          variables: {
            input: {
              rubricPresetId: rubricPreset.id,
              fromIndex: from,
              toIndex: to,
            },
          },
        });
      }}
    >
      {(preset, handleRef) => (
        <RubricPresetEditor
          preset={preset}
          disabled={disabled || loading}
          handleRef={handleRef}
        />
      )}
    </RearrangableList>
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

type MutationReturn<T extends MutationParameters> = [MutateWithVariables<T>, MutationState<T>];

function useCreateRubricMutation(): MutationReturn<editorCreateRubricMutation> {
  const { alert } = useContext(AlertContext);
  const results = useMutation<editorCreateRubricMutation>(
    graphql`
    mutation editorCreateRubricMutation($input: CreateRubricInput!) {
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
  ] = useMutation<editorCreateRubricPresetMutation>(
    graphql`
    mutation editorCreateRubricPresetMutation($input: CreateRubricPresetInput!) {
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
  const [mutate, { loading }] = useMutation<editorCreatePresetCommentMutation>(
    graphql`
    mutation editorCreatePresetCommentMutation($input: CreatePresetCommentInput!) {
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
  const [mutate, { loading }] = useMutation<editorChangeRubricPresetDirectionMutation>(
    graphql`
    mutation editorChangeRubricPresetDirectionMutation($input: ChangeRubricPresetDetailsInput!) {
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
        disabled={loading || disabled}
      />
    </>
  );
};

const DestroyButton: React.FC<{
  disabled?: boolean;
  className?: string;
  onClick: () => void;
}> = (props) => {
  const {
    disabled = false,
    className = 'position-absolute t-0 r-0 z-1000',
    onClick,
  } = props;
  return (
    <span className={className}>
      <Button
        variant="danger"
        disabled={disabled}
        onClick={onClick}
        className={!disabled ? '' : 'cursor-not-allowed pointer-events-auto'}
        title="Delete"
      >
        <FaTrashAlt />
      </Button>
    </span>
  );
};

const RubricPresetEditor: React.FC<{
  preset: Preset;
  disabled?: boolean;
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    preset,
    disabled = false,
    handleRef,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<editorDestroyPresetCommentMutation>(
    graphql`
    mutation editorDestroyPresetCommentMutation($input: DestroyPresetCommentInput!) {
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
      className="mb-3 alert-warning p-0 w-100"
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
  const [mutate, { loading }] = useMutation<editorChangePresetCommentLabelMutation>(
    graphql`
    mutation editorChangePresetCommentLabelMutation($input: ChangePresetCommentDetailsInput!) {
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
  const [mutate, { loading }] = useMutation<editorChangePresetCommentGraderHintMutation>(
    graphql`
    mutation editorChangePresetCommentGraderHintMutation($input: ChangePresetCommentDetailsInput!) {
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
  const [mutate, { loading }] = useMutation<editorChangePresetCommentStudentFeedbackMutation>(
    graphql`
    mutation editorChangePresetCommentStudentFeedbackMutation($input: ChangePresetCommentDetailsInput!) {
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
  const [mutate, { loading }] = useMutation<editorChangeRubricPresetLabelMutation>(
    graphql`
    mutation editorChangeRubricPresetLabelMutation($input: ChangeRubricPresetDetailsInput!) {
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
  const [mutate, { loading }] = useMutation<editorChangeRubricTypeMutation>(
    graphql`
    mutation editorChangeRubricTypeMutation($input: ChangeRubricTypeInput!) {
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
  const [mutate, { loading }] = useMutation<editorChangeRubricDetailsDescriptionMutation>(
    graphql`
    mutation editorChangeRubricDetailsDescriptionMutation($input: ChangeRubricDetailsInput!) {
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
      disabled={loading || disabled}
      value={description}
      onChange={onChange}
      placeholder={`Give use-${rubric.type} rubric instructions here`}
      debounceDelay={1000}
      refreshProps={[rubric.type]}
    />
  );
};

export const EditHTMLVal: React.FC<{
  disabled?: boolean;
  value: HTMLVal;
  onChange: (newVal: HTMLVal) => void;
  placeholder?: string;
  debounceDelay?: number;
  refreshProps?: React.DependencyList;
  className?: string;
  theme?: ReactQuillProps['theme'];
}> = (props) => {
  const {
    disabled = false,
    value,
    onChange,
    placeholder,
    debounceDelay = 0,
    refreshProps = [],
    className,
    theme = 'bubble',
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
      theme={theme}
      onChange={handleChange}
      refreshProps={[...refreshProps, value.value]}
      className={className}
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
  const [mutate, { loading }] = useMutation<editorChangePresetCommentPointsMutation>(
    graphql`
    mutation editorChangePresetCommentPointsMutation($input: ChangePresetCommentDetailsInput!) {
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
  const [mutate, { loading }] = useMutation<editorChangeRubricDetailsPointsMutation>(
    graphql`
    mutation editorChangeRubricDetailsPointsMutation($input: ChangeRubricDetailsInput!) {
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
    if (debouncedText === defaultValue) {
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
