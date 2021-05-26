import React, {
  useContext, useState,
} from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@hourglass/common/context';
import {
  ExamFile,
  FileRef,
} from '@student/exams/show/types';
import {
  graphql,
  useQuery,
  useMutation,
} from 'relay-hooks';

import { RenderError } from '@hourglass/common/boundary';
import {
  Button,
  Col,
  Container,
  Form,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { AlertContext } from '@hourglass/common/alerts';
import { useParams } from 'react-router-dom';
import Policies from './Policies';
import FileUploader from './FileUploader';
import Instructions from './Instructions';
import EditReference from './Reference';
import { SingleRubricKeyEditor } from './Rubric';
import { ReorderableQuestionsEditor } from './Question';
import { editorCreateQuestionMutation } from './__generated__/editorCreateQuestionMutation.graphql';
import { editorQuery } from './__generated__/editorQuery.graphql';

const ExamVersionEditor: React.FC = () => {
  const { versionId: examVersionId } = useParams<{ versionId: string }>();
  const res = useQuery<editorQuery>(
    graphql`
    query editorQuery($examVersionId: ID!) {
      examVersion(id: $examVersionId) {
        name
        rootRubric { ...RubricSingle }
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
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.data) {
    return <Container><p>Loading...</p></Container>;
  }
  const { examVersion } = res.data;
  const { rootRubric, dbQuestions, policies } = examVersion;

  const [showRubrics, setShowRubrics] = useState(false);

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
                      variant={showRubrics ? 'primary' : 'outline-primary'}
                      value="yes"
                    >
                      Yes
                    </ToggleButton>
                    <ToggleButton
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
            <Col sm={showRubrics ? 12 : { span: 8, offset: 2 }}>
              <Row>
                <Col sm={showRubrics ? 6 : 12}>
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
                {showRubrics && (
                  <Col sm={6}>
                    <SingleRubricKeyEditor
                      rubricKey={rootRubric}
                    />
                  </Col>
                )}
              </Row>
              <ReorderableQuestionsEditor
                dbQuestions={dbQuestions}
                examVersionId={examVersionId}
                showRubricEditors={showRubrics}
              />
              <Row className="text-center">
                <Col>
                  <Button
                    variant="primary"
                    onClick={() => {
                      mutateCreateQuestion({
                        variables: {
                          input: {
                            examVersionId,
                          },
                        },
                      });
                    }}
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
