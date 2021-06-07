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
  Card,
  Col,
  Dropdown,
  DropdownButton,
  Form,
  Row,
} from 'react-bootstrap';
import { RearrangeableList } from '@hourglass/common/rearrangeable';
import { AlertContext } from '@hourglass/common/alerts';
import { PartFilesContext } from '@hourglass/common/context';
import { alphabetIdx } from '@hourglass/common/helpers';

import YesNoControl from '@student/exams/show/components/questions/YesNo';
import { FileRef, HTMLVal } from '@student/exams/show/types';

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

import { QuestionEditor } from './__generated__/QuestionEditor.graphql';
import { PartEditor$key } from './__generated__/PartEditor.graphql';
import { PartDestroyMutation } from './__generated__/PartDestroyMutation.graphql';
import { PartChangeMutation } from './__generated__/PartChangeMutation.graphql';
import { PartReorderMutation } from './__generated__/PartReorderMutation.graphql';

import { languages, useCreateCodeMutation } from './body-items/Code';
import { useCreateCodeTagMutation } from './body-items/CodeTag';
import { useCreateTextMutation } from './body-items/Text';
import { useCreateAllThatApplyMutation } from './body-items/AllThatApply';
import { useCreateMatchingMutation } from './body-items/Matching';
import { useCreateMultipleChoiceMutation } from './body-items/MultipleChoice';
import { useCreateYesNoMutation } from './body-items/YesNo';
import { useCreateHtmlMutation } from './body-items/Html';

export const ReorderablePartsEditor: React.FC<{
  parts: QuestionEditor['parts'];
  disabled?: boolean;
  questionId: string;
  showRubricEditors?: boolean;
}> = (props) => {
  const {
    parts,
    disabled: parentDisabled = false,
    questionId,
    showRubricEditors = false,
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
  const rearrangeParts = useCallback((from, to) => {
    mutate({
      variables: {
        input: {
          questionId,
          fromIndex: from,
          toIndex: to,
        },
      },
    });
  }, [questionId, mutate]);
  const disabled = parentDisabled || loading;
  return (
    <RearrangeableList
      dbArray={parts}
      className="mb-3"
      dropVariant="success"
      disabled={disabled}
      identifier={`PART-${questionId}`}
      onRearrange={rearrangeParts}
    >
      {(part, partHandleRef, partIsDragging) => (
        <Row key={part.id}>
          <Col>
            <OnePart
              partKey={part}
              handleRef={partHandleRef}
              isDragging={partIsDragging}
              disabled={disabled}
              showRubricEditors={showRubricEditors}
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
  showRubricEditors?: boolean;
}> = (props) => {
  const {
    partKey,
    handleRef,
    disabled: parentDisabled = false,
    showRubricEditors = false,
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
        id
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
    mutateUpdatePart,
    { loading: loadingUpdatePart },
  ] = useMutation<PartChangeMutation>(
    graphql`
    mutation PartChangeMutation($input: ChangePartDetailsInput!) {
      changePartDetails(input: $input) {
        part {
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
          points
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error updating part',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const updateName = useCallback((newVal: HTMLVal) => {
    mutateUpdatePart({
      variables: {
        input: {
          partId: part.id,
          updateName: true,
          name: newVal,
        },
      },
    });
  }, [part.id]);
  const updateDescription = useCallback((newVal: HTMLVal) => {
    mutateUpdatePart({
      variables: {
        input: {
          partId: part.id,
          updateDescription: true,
          description: newVal,
        },
      },
    });
  }, [part.id]);
  const updatePoints = useCallback((newVal: number) => {
    mutateUpdatePart({
      variables: {
        input: {
          partId: part.id,
          updatePoints: true,
          points: newVal,
        },
      },
    });
  }, [part.id]);
  const updateSeparateSubparts = useCallback((newVal: boolean) => {
    mutateUpdatePart({
      variables: {
        input: {
          partId: part.id,
          updateExtraCredit: true,
          extraCredit: newVal,
        },
      },
    });
  }, [part.id]);
  const updateReferences = useCallback((newVal: FileRef[]) => {
    mutateUpdatePart({
      variables: {
        input: {
          partId: part.id,
          updateReferences: true,
          references: newVal,
        },
      },
    });
  }, [part.id]);
  const [mutateCreateCode, { loading: loadingCreateCode }] = useCreateCodeMutation();
  const [mutateCreateCodeTag, { loading: loadingCreateCodeTag }] = useCreateCodeTagMutation();
  const [mutateCreateText, { loading: loadingCreateText }] = useCreateTextMutation();
  const [mutateCreateATA, { loading: loadingCreateATA }] = useCreateAllThatApplyMutation();
  const [mutateCreateMatching, { loading: loadingCreateMatching }] = useCreateMatchingMutation();
  const [mutateCreateMC, { loading: loadingCreateMC }] = useCreateMultipleChoiceMutation();
  const [mutateCreateYesNo, { loading: loadingCreateYesNo }] = useCreateYesNoMutation();
  const [mutateCreateHtml, { loading: loadingCreateHtml }] = useCreateHtmlMutation();

  const loadingCreateBodyItem = (
    loadingCreateCode
    || loadingCreateCodeTag
    || loadingCreateText
    || loadingCreateATA
    || loadingCreateMatching
    || loadingCreateMC
    || loadingCreateYesNo
    || loadingCreateHtml
  );
  const disabled = (
    parentDisabled
    || loadingDestroyPart
    || loadingUpdatePart
    || loadingCreateBodyItem
  );
  const partReferences = useMemo(() => ({
    references: part.references,
  }), [part.references]);
  return (
    <PartFilesContext.Provider value={partReferences}>
      <Card border="success">
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
                  value={part.name || {
                    type: 'HTML',
                    value: '',
                  }}
                  disabled={disabled}
                  onChange={updateName}
                  placeholder="Give a short (optional) descriptive name for the part"
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
                    value={part.description || {
                      type: 'HTML',
                      value: '',
                    }}
                    disabled={disabled}
                    onChange={updateDescription}
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
                    step={0.5}
                    variant="warning"
                    disabled={disabled}
                    onCommit={updatePoints}
                  />
                </Col>
                <Form.Label column sm="2">Extra credit?</Form.Label>
                <Col sm="4">
                  <YesNoControl
                    className="bg-white rounded"
                    value={!!part.extraCredit}
                    info={SEP_SUB_YESNO}
                    disabled={disabled}
                    onChange={updateSeparateSubparts}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <EditReference
                  value={part.references}
                  disabled={disabled}
                  onChange={updateReferences}
                  label="this question part"
                />
              </Form.Group>
            </Col>
            {showRubricEditors && (
              <Col sm={12} xl={6}>
                <SingleRubricKeyEditor
                  rubricKey={part.rootRubric}
                  disabled={disabled}
                />
              </Col>
            )}
          </Row>
          <ReorderableBodyItemsEditor
            bodyItems={part.bodyItems}
            partId={part.id}
            showRubricEditors={showRubricEditors}
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
                    mutateCreateHtml({
                      variables: {
                        input: {
                          partId: part.id,
                          value: {
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
                    mutateCreateATA({
                      variables: {
                        input: {
                          partId: part.id,
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          options: [],
                        },
                      },
                    });
                  }}
                >
                  All that apply
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    mutateCreateCode({
                      variables: {
                        input: {
                          partId: part.id,
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
                    });
                  }}
                >
                  Code
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    mutateCreateCodeTag({
                      variables: {
                        input: {
                          partId: part.id,
                          choices: 'exam',
                          prompt: {
                            type: 'HTML',
                            value: '',
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
                    mutateCreateMatching({
                      variables: {
                        input: {
                          partId: part.id,
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          prompts: [],
                          matchValues: [],
                        },
                      },
                    });
                  }}
                >
                  Matching
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    mutateCreateMC({
                      variables: {
                        input: {
                          partId: part.id,
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          options: [],
                        },
                      },
                    });
                  }}
                >
                  Multiple choice
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    mutateCreateText({
                      variables: {
                        input: {
                          partId: part.id,
                          prompt: {
                            type: 'HTML',
                            value: '',
                          },
                          answer: '',
                        },
                      },
                    });
                  }}
                >
                  Free-response
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    mutateCreateYesNo({
                      variables: {
                        input: {
                          partId: part.id,
                          labelType: 'yn',
                          prompt: {
                            type: 'HTML',
                            value: '',
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
    </PartFilesContext.Provider>
  );
};
