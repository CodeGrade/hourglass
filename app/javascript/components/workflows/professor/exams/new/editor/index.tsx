import React, {
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@hourglass/common/context';
import {
  ExamFile,
  FileRef,
  HTMLVal,
  Policy,
} from '@student/exams/show/types';
import {
  graphql,
  useQuery,
  useMutation,
} from 'relay-hooks';

import { RenderError } from '@hourglass/common/boundary';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { AlertContext, useAlert } from '@hourglass/common/alerts';
import { useParams } from 'react-router-dom';
import Policies from './Policies';
import FileUploader from './FileUploader';
import Instructions from './Instructions';
import EditReference from './Reference';
import { SingleRubricKeyEditor } from './Rubric';
import { ReorderableQuestionsEditor } from './Question';
import { editorCreateQuestionMutation } from './__generated__/editorCreateQuestionMutation.graphql';
import { editorChangeMutation } from './__generated__/editorChangeMutation.graphql';
import { editorChangeFilesMutation } from './__generated__/editorChangeFilesMutation.graphql';
import { editorQuery } from './__generated__/editorQuery.graphql';
import { DebouncedFormControl } from './components/helpers';

const ExamVersionEditor: React.FC = () => {
  const { versionId: examVersionId } = useParams<{ versionId: string }>();
  const res = useQuery<editorQuery>(
    graphql`
    query editorQuery($examVersionId: ID!) {
      examVersion(id: $examVersionId) {
        name
        anyStarted
        anyFinalized
        rootRubric { ...RubricSingle }
        files
        instructions {
          type
          value
        }
        dbReferences {
          id
          type
          path
        }
        policies
        dbQuestions {
          id
          ...QuestionEditor

        }
      }
    }
    `,
    { examVersionId },
  );
  const { alert } = useContext(AlertContext);
  const [
    mutateUpdateExamVersion,
    { loading: loadingUpdateExamVersion },
  ] = useMutation<editorChangeMutation>(
    graphql`
    mutation editorChangeMutation($input: ChangeExamVersionDetailsInput!) {
      changeExamVersionDetails(input: $input) {
        examVersion {
          id
          name
          instructions {
            type
            value
          }
          dbReferences {
            id
            type
            path
          }
          policies
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error updating exam version',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  // This mutation is separated, because files might be inordinately big
  // compared to the other necessary data
  const [
    mutateUpdateExamVersionFiles,
    { loading: loadingUpdateExamVersionFiles },
  ] = useMutation<editorChangeFilesMutation>(
    graphql`
    mutation editorChangeFilesMutation($input: ChangeExamVersionDetailsInput!) {
      changeExamVersionDetails(input: $input) {
        examVersion {
          id
          dbReferences {
            id
            type
            path
          }
          files
        }
      }
    }
    `,
    {
      onError: (err) => {
        const msgs = err.message.split('\n');
        const errorElem = (
          <ul>
            {msgs.map((msg, idx) => (
              // eslint-disable-next-line react/no-array-index-key -- these only get shown once
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        );
        alert({
          variant: 'danger',
          title: 'Error uploading files for exam version',
          message: errorElem,
          copyButton: true,
        });
      },
    },
  );
  const updateName = useCallback((newVal: string) => {
    mutateUpdateExamVersion({
      variables: {
        input: {
          examVersionId,
          updateName: true,
          name: newVal,
        },
      },
    });
  }, [examVersionId]);
  const updateInstructions = useCallback((newVal: HTMLVal) => {
    mutateUpdateExamVersion({
      variables: {
        input: {
          examVersionId,
          updateInstructions: true,
          instructions: newVal,
        },
      },
    });
  }, [examVersionId]);
  const updatePolicies = useCallback((newVal: Policy[]) => {
    mutateUpdateExamVersion({
      variables: {
        input: {
          examVersionId,
          updatePolicies: true,
          policies: newVal,
        },
      },
    });
  }, [examVersionId]);
  const updateFiles = useCallback((newVal: ExamFile[]) => {
    mutateUpdateExamVersionFiles({
      variables: {
        input: {
          examVersionId,
          updateFiles: true,
          files: newVal,
        },
      },
    });
  }, [examVersionId]);
  const updateReferences = useCallback((newVal: FileRef[]) => {
    mutateUpdateExamVersion({
      variables: {
        input: {
          examVersionId,
          updateReferences: true,
          references: newVal,
        },
      },
    });
  }, [examVersionId]);

  const [
    mutateCreateQuestion,
    { loading: loadingCreateQuestion },
  ] = useMutation<editorCreateQuestionMutation>(
    graphql`
    mutation editorCreateQuestionMutation($input: CreateQuestionInput!) {
      createQuestion(input: $input) {
        examVersion {
          id
          dbQuestions {
            id
            ...QuestionEditor
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error adding new question',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const createQuestion = useCallback(() => {
    mutateCreateQuestion({
      variables: {
        input: {
          examVersionId,
        },
      },
    });
  }, [examVersionId]);
  useAlert(
    {
      variant: 'warning',
      title: 'Students have already started taking this version',
      message: 'Changing the questions will likely result in nonsensical answers, and changing the structure of this version will result in undefined behavior. Be careful!',
    },
    res.data?.examVersion?.anyStarted || res.data?.examVersion?.anyFinalized,
    [res.data?.examVersion?.anyStarted || res.data?.examVersion?.anyFinalized],
  );
  const [showRubrics, setShowRubrics] = useState(false);
  const files = (res?.data?.examVersion?.files as ExamFile[]) ?? [];
  const contextVal = useMemo(() => ({
    files,
    fmap: createMap(files),
  }), [files]);
  const references = res?.data?.examVersion?.dbReferences ?? [];
  const examReference = useMemo(() => ({
    references,
  }), [files]);
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.data) {
    return <Container><p>Loading...</p></Container>;
  }
  const { examVersion } = res.data;
  const { rootRubric, dbQuestions, policies } = examVersion;

  const disabled = (
    loadingCreateQuestion
    || loadingUpdateExamVersion
    || loadingUpdateExamVersionFiles
  );
  return (
    <Container fluid>
      <ExamContext.Provider value={contextVal}>
        <ExamFilesContext.Provider value={examReference}>
          <Row>
            <Col sm={{ span: 8, offset: 2 }}>
              <Form.Group as={Row} controlId="examTitle">
                <Form.Label column sm="auto"><h2>Version name:</h2></Form.Label>
                <Col>
                  <DebouncedFormControl
                    size="lg"
                    placeholder="Enter a name for this version"
                    defaultValue={examVersion.name}
                    onChange={updateName}
                    disabled={disabled}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="text-center">
                <Form.Label column sm="auto"><h3>Show rubric editors?</h3></Form.Label>
                <Col sm="auto">
                  <ToggleButtonGroup
                    className="bg-white rounded"
                    name="wording"
                    type="radio"
                    value={showRubrics ? 'yes' : 'no'}
                    onChange={(newVal) => setShowRubrics(newVal === 'yes')}
                  >
                    <ToggleButton
                      disabled={disabled}
                      variant={showRubrics ? 'primary' : 'outline-primary'}
                      value="yes"
                    >
                      Yes
                    </ToggleButton>
                    <ToggleButton
                      disabled={disabled}
                      variant={!showRubrics ? 'primary' : 'outline-primary'}
                      value="no"
                    >
                      No
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Col>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={12} xl={showRubrics ? 12 : { span: 8, offset: 2 }}>
              <Card border="info" className="mb-4">
                <div className="alert alert-info">
                  <Card.Title>
                    Exam-wide information
                  </Card.Title>
                </div>
                <Card.Body>
                  <Row>
                    <Col>
                      <Policies
                        value={policies}
                        disabled={disabled}
                        onChange={updatePolicies}
                      />
                      <FileUploader
                        value={examVersion.files as ExamFile[]}
                        disabled={disabled}
                        onChange={updateFiles}
                      />
                      <Instructions
                        value={examVersion.instructions}
                        disabled={disabled}
                        onChange={updateInstructions}
                      />
                      <Form.Group as={Row}>
                        <EditReference
                          value={examVersion.dbReferences}
                          disabled={disabled}
                          onChange={updateReferences}
                          label="the entire exam"
                        />
                      </Form.Group>
                    </Col>
                    {showRubrics && (
                      <Col sm={12} xl={6}>
                        <SingleRubricKeyEditor
                          rubricKey={rootRubric}
                        />
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
              <ReorderableQuestionsEditor
                dbQuestions={dbQuestions}
                examVersionId={examVersionId}
                showRubricEditors={showRubrics}
              />
              <Row className="text-center">
                <Col>
                  <Button
                    variant="primary"
                    onClick={createQuestion}
                    disabled={loadingCreateQuestion}
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
export default ExamVersionEditor;
