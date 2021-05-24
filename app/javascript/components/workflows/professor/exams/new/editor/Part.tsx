import React, {
  useContext,
} from 'react';
import {
  graphql,
  useMutation,
  useFragment,
} from 'relay-hooks';
import {
  Card,
  Col,
  Dropdown,
  DropdownButton,
  Form,
  Row,
} from 'react-bootstrap';
import RearrangeableList from '@hourglass/common/rearrangeable';
import { AlertContext } from '@hourglass/common/alerts';
import { alphabetIdx } from '@hourglass/common/helpers';

import { FileRef } from '@student/exams/show/types';
import YesNoControl from '@student/exams/show/components/questions/YesNo';

import { SingleRubricKeyEditor } from './Rubric';
import {
  DragHandle,
  DestroyButton,
  EditHTMLVal,
  NormalizedNumericInput,
} from './components/helpers';
import EditReference from './Reference';
import { SEP_SUB_YESNO } from './Question';
import { ReorderableBodyItemsEditor } from './BodyItem';

import { languages } from './body-items/Code';

import { QuestionEditor } from './__generated__/QuestionEditor.graphql';
import { PartEditor$key } from './__generated__/PartEditor.graphql';
import { PartDestroyMutation } from './__generated__/PartDestroyMutation.graphql';
import { PartReorderMutation } from './__generated__/PartReorderMutation.graphql';
import { PartCreateBodyItemMutation } from './__generated__/PartCreateBodyItemMutation.graphql';

export const ReorderablePartsEditor: React.FC<{
  parts: QuestionEditor['parts'];
  disabled?: boolean;
  questionId: string;
}> = (props) => {
  const {
    parts,
    disabled: parentDisabled = false,
    questionId,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<PartReorderMutation>(
    graphql`
    mutation PartReorderMutation($input: ReorderPartsInput!) {
      reorderParts(input: $input) {
        question {
          id
          parts {
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
          title: 'Error reordering parts',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const disabled = parentDisabled || loading;
  return (
    <RearrangeableList
      dbArray={parts}
      className="mb-3"
      dropVariant="success"
      disabled={disabled}
      identifier={`PART-${questionId}`}
      onRearrange={(from, to) => {
        mutate({
          variables: {
            input: {
              questionId,
              fromIndex: from,
              toIndex: to,
            },
          },
        });
      }}
    >
      {(part, partHandleRef, partIsDragging) => (
        <Row key={part.id}>
          <Col>
            <OnePart
              partKey={part}
              handleRef={partHandleRef}
              isDragging={partIsDragging}
              disabled={disabled}
            />
          </Col>
        </Row>
      )}
    </RearrangeableList>
  );
};
export const OnePart: React.FC<{
  partKey: PartEditor$key;
  handleRef: React.Ref<HTMLElement>;
  isDragging?: boolean;
  disabled?: boolean;
}> = (props) => {
  const {
    partKey,
    handleRef,
    isDragging = false,
    disabled: parentDisabled = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const part = useFragment(
    graphql`
    fragment PartEditor on Part {
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
      rootRubric { ...RubricSingle }
      bodyItems {
        id
        ...BodyItemEditor
      }
    }
    `,
    partKey,
  );
  const [
    mutateDestroyPart,
    { loading: loadingDestroyPart },
  ] = useMutation<PartDestroyMutation>(
    graphql`
    mutation PartDestroyMutation($input: DestroyPartInput!) {
      destroyPart(input: $input) {
        question {
          id
          parts {
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
          title: 'Error destroying part',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const [
    mutateCreateBodyItem,
    { loading: loadingCreateBodyItem },
  ] = useMutation<PartCreateBodyItemMutation>(
    graphql`
    mutation PartCreateBodyItemMutation($input: CreateBodyItemInput!) {
      createBodyItem(input: $input) {
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
          title: 'Error adding new body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const disabled = parentDisabled || loadingDestroyPart || loadingCreateBodyItem;
  return (
    <Card
      className={isDragging ? '' : 'mb-3'}
      border="success"
    >
      <div className="alert alert-success">
        <Card.Title>
          {handleRef && <DragHandle handleRef={handleRef} variant="success" />}
          <DestroyButton
            disabled={disabled}
            onClick={() => {
              mutateDestroyPart({
                variables: {
                  input: {
                    partId: part.id,
                  },
                },
              });
            }}
          />
          <Row>
            <Col sm="auto" className={handleRef ? 'ml-4' : ''}>
              <Form.Label column>{`Part ${alphabetIdx(part.index)}:`}</Form.Label>
            </Col>
            <Col className="mr-5">
              <EditHTMLVal
                className="bg-white border rounded"
                // disabled={loading || disabled}
                value={part.name || {
                  type: 'HTML',
                  value: '',
                }}
                disabled={disabled}
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
                  disabled={disabled}
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
                  disabled={disabled}
                  onCommit={console.log}
                />
              </Col>
              <Form.Label column sm="2">Extra credit?</Form.Label>
              <Col sm="4">
                <YesNoControl
                  className="bg-white rounded"
                  value={!!part.extraCredit}
                  info={SEP_SUB_YESNO}
                  disabled={disabled}
                  onChange={console.log}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <EditReference
                value={part.references as FileRef[]}
                disabled={disabled}
                onChange={console.log}
                label="this question part"
              />
            </Form.Group>
          </Col>
          <Col sm="6">
            <SingleRubricKeyEditor
              rubricKey={part.rootRubric}
              disabled={disabled}
            />
          </Col>
        </Row>
        <ReorderableBodyItemsEditor
          bodyItems={part.bodyItems}
          partId={part.id}
        />
        <Row className="text-center">
          <Col>
            <DropdownButton
              disabled={disabled}
              variant="secondary"
              title="Add new item..."
            >
              <Dropdown.Item
                onClick={() => {
                  mutateCreateBodyItem({
                    variables: {
                      input: {
                        partId: part.id,
                        info: {
                          type: 'HTML',
                          value: '',
                        },
                      },
                    },
                  });
                }}
              >
                Text instructions
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => {
                  mutateCreateBodyItem({
                    variables: {
                      input: {
                        partId: part.id,
                        info: {
                          type: 'AllThatApply',
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          options: [],
                        },
                      },
                    },
                  });
                }}
              >
                All that apply
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  mutateCreateBodyItem({
                    variables: {
                      input: {
                        partId: part.id,
                        info: {
                          type: 'Code',
                          lang: Object.keys(languages)[0],
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          answer: {
                            text: '',
                            marks: [],
                          },
                        },
                      },
                    },
                  });
                }}
              >
                Code
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  mutateCreateBodyItem({
                    variables: {
                      input: {
                        partId: part.id,
                        info: {
                          type: 'CodeTag',
                          choices: 'exam',
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                        },
                      },
                    },
                  });
                }}
              >
                Code tag
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  mutateCreateBodyItem({
                    variables: {
                      input: {
                        partId: part.id,
                        info: {
                          type: 'Matching',
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          prompts: [],
                          values: [],
                        },
                      },
                    },
                  });
                }}
              >
                Matching
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  mutateCreateBodyItem({
                    variables: {
                      input: {
                        partId: part.id,
                        info: {
                          type: 'MultipleChoice',
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          options: [],
                        },
                      },
                    },
                  });
                }}
              >
                Multiple choice
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  mutateCreateBodyItem({
                    variables: {
                      input: {
                        partId: part.id,
                        info: {
                          type: 'Text',
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          answer: '',
                        },
                      },
                    },
                  });
                }}
              >
                Free-response
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  mutateCreateBodyItem({
                    variables: {
                      input: {
                        partId: part.id,
                        info: {
                          type: 'YesNo',
                          yesLabel: 'Yes',
                          noLabel: 'No',
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                        },
                      },
                    },
                  });
                }}
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
