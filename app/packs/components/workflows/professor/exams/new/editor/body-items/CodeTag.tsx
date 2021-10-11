import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import {
  FileRef,
  CodeTagState,
  CodeTagInfo,
  HTMLVal,
} from '@student/exams/show/types';
import {
  Form,
  Row,
  Col,
  Modal,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import { ControlledFileViewer } from '@student/exams/show/components/FileViewer';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import { getFilesForRefs, countFiles } from '@student/exams/show/files';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import {
  ExamContext,
  ExamFilesContext,
  QuestionFilesContext,
  PartFilesContext,
} from '@hourglass/common/context';
import { AlertContext } from '@hourglass/common/alerts';
import { ExhaustiveSwitchError, MutationReturn, useRefresher } from '@hourglass/common/helpers';

import { CodeTagCreateMutation } from './__generated__/CodeTagCreateMutation.graphql';
import { CodeTagChangeMutation } from './__generated__/CodeTagChangeMutation.graphql';

export function useCreateCodeTagMutation(): MutationReturn<CodeTagCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<CodeTagCreateMutation>(
    graphql`
    mutation CodeTagCreateMutation($input: CreateCodeTagInput!) {
      createCodeTag(input: $input) {
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
          title: 'Error creating new CodeTag body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

function useChangeCodeTagMutation(): MutationReturn<CodeTagChangeMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<CodeTagChangeMutation>(
    graphql`
    mutation CodeTagChangeMutation($input: ChangeCodeTagDetailsInput!) {
      changeCodeTagDetails(input: $input) {
        bodyItem {
          id
          info
          answer
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing CodeTag body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}
interface CodeTagValProps {
  value?: CodeTagState;
  hideFile?: boolean;
}

const CodeTagVal: React.FC<CodeTagValProps> = (props) => {
  const { value, hideFile = false } = props;
  return (
    <div>
      {hideFile || (
        <span className="mr-2">
          <b className="mr-2">File:</b>
          {value?.selectedFile
            ? (
              <Button disabled size="sm" variant="outline-dark">
                {value.selectedFile}
              </Button>
          )
            : <i>Unanswered</i>}
        </span>
      )}
      <span>
        <b className="mr-2">Line:</b>
        {value?.lineNumber
          ? (
            <Button disabled size="sm" variant="outline-dark">
              {value.lineNumber}
            </Button>
        )
          : <i>Unanswered</i>}
      </span>
    </div>
  );
};

export { CodeTagVal };

interface FileModalProps {
  references: readonly FileRef[];
  show: boolean;
  onClose: () => void;
  onSave: (newState: CodeTagState) => void;
  startValue: CodeTagState;
  disabled: boolean;
}

const FileModal: React.FC<FileModalProps> = (props) => {
  const {
    show,
    onClose,
    onSave,
    references,
    startValue,
    disabled,
  } = props;
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  // Modal has its own state so the user can manipulate it before saving.
  const [selected, setSelected] = useState(startValue);
  const [refresher, refreshCodeMirror] = useRefresher();
  useEffect(() => {
    // Reset my starting state when outer state changes.
    setSelected(startValue);
  }, [startValue]);
  const saveEnabled = selected?.selectedFile && selected?.lineNumber;
  const saveButtonDisabled = disabled || !saveEnabled;
  const disabledMessage = disabled
    ? 'Lost connection to server...'
    : 'Please choose a file and line to save.';
  return (
    <Modal
      show={show}
      onEscapeKeyDown={onClose}
      onHide={onClose}
      onEntering={refreshCodeMirror}
      dialogClassName="w-100 mw-100 m-2"
      centered
      keyboard
    >
      <Modal.Header closeButton>
        <Modal.Title>Choose a line</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ControlledFileViewer
          refreshProps={[refresher]}
          references={references}
          selection={selected}
          onChangeFile={(newFile): void => {
            // This might occur when there's only one file visible,
            // and so ControlledFileViewer triggers an onChangeFile
            // as a preemptive measure.
            if (newFile === selected.selectedFile) { return; }
            setSelected({
              selectedFile: newFile,
              lineNumber: undefined,
            });
          }}
          onChangeLine={(newLine): void => {
            setSelected((old) => ({
              selectedFile: old.selectedFile,
              lineNumber: newLine,
            }));
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="mr-auto">
          <CodeTagVal value={selected} hideFile={countFiles(filteredFiles) === 1} />
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <TooltipButton
          disabled={saveButtonDisabled}
          disabledMessage={disabledMessage}
          variant="primary"
          onClick={(): void => onSave(selected)}
        >
          Save Changes
        </TooltipButton>
      </Modal.Footer>
    </Modal>
  );
};

const EditChoices: React.FC<{
  value: CodeTagInfo['choices'],
  disabled?: boolean;
  onChange: (newVal: CodeTagInfo['choices']) => void,
}> = (props) => {
  const {
    value,
    disabled = false,
    onChange,
  } = props;
  return (
    <>
      <Form.Label column sm={2}>Files source</Form.Label>
      <Col sm={10}>
        <ButtonGroup>
          <Button
            variant={value === 'exam' ? 'secondary' : 'outline-secondary'}
            disabled={disabled}
            active={value === 'exam'}
            onClick={(): void => {
              onChange('exam');
              // answer.input.onChange({ NO_ANS: true });
            }}
          >
            Files for full exam
          </Button>
          <Button
            variant={value === 'question' ? 'secondary' : 'outline-secondary'}
            disabled={disabled}
            active={value === 'question'}
            onClick={(): void => {
              onChange('question');
              // answer.input.onChange({ NO_ANS: true });
            }}
          >
            Files for current question
          </Button>
          <Button
            variant={value === 'part' ? 'secondary' : 'outline-secondary'}
            disabled={disabled}
            active={value === 'part'}
            onClick={(): void => {
              onChange('part');
              // answer.input.onChange({ NO_ANS: true });
            }}
          >
            Files for current part
          </Button>
        </ButtonGroup>
      </Col>
    </>
  );
};

const EditAnswer: React.FC<{
  value: CodeTagState,
  choice: CodeTagInfo['choices'],
  disabled?: boolean;
  onChange: (newAnswer: CodeTagState) => void;
}> = (props) => {
  const {
    value,
    choice,
    disabled = false,
    onChange,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const examReferences = useContext(ExamFilesContext);
  const questionReferences = useContext(QuestionFilesContext);
  const partReferences = useContext(PartFilesContext);
  let references: readonly FileRef[];
  switch (choice) {
    case 'exam':
      references = examReferences.references;
      break;
    case 'question':
      references = questionReferences.references;
      break;
    case 'part':
      references = partReferences.references;
      break;
    default:
      throw new ExhaustiveSwitchError(choice);
  }
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  return (
    <>
      <Form.Label column sm={2}>Correct answer</Form.Label>
      <Col sm={6}>
        <CodeTagVal value={value} hideFile={countFiles(filteredFiles) === 1} />
      </Col>
      <Col sm={4}>
        <Button
          disabled={disabled}
          onClick={(): void => setShowModal(true)}
        >
          Choose line
        </Button>
        <FileModal
          disabled={false}
          references={references}
          show={showModal}
          onClose={(): void => setShowModal(false)}
          onSave={(newState): void => {
            setShowModal(false);
            onChange(newState);
          }}
          startValue={value}
        />
      </Col>
    </>
  );
};

const CodeTag: React.FC<{
  info: CodeTagInfo,
  id: string,
  disabled?: boolean;
  answer: CodeTagState,
}> = (props) => {
  const {
    id,
    info,
    answer,
    disabled: parentDisabled = false,
  } = props;
  const [mutate, { loading }] = useChangeCodeTagMutation();
  const updatePrompt = useCallback((newPrompt: HTMLVal) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updatePrompt: true,
          prompt: newPrompt,
        },
      },
    });
  }, [id]);
  const updateChoices = useCallback((newChoices: CodeTagInfo['choices']) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateChoices: true,
          choices: newChoices,
        },
      },
    });
  }, [id]);
  const updateAnswer = useCallback((newAnswer: CodeTagState) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id]);
  const disabled = parentDisabled || loading;
  return (
    <>
      <Prompted
        value={info.prompt}
        disabled={disabled}
        onChange={updatePrompt}
      />
      <Form.Group as={Row}>
        <EditChoices
          value={info.choices}
          disabled={disabled}
          onChange={updateChoices}
        />
      </Form.Group>
      <Form.Group as={Row} className="align-items-baseline">
        <EditAnswer
          choice={info.choices}
          disabled={disabled}
          value={answer}
          onChange={updateAnswer}
        />
      </Form.Group>
    </>
  );
};

export default CodeTag;
