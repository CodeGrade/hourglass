import CM from 'codemirror';
import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { graphql } from 'react-relay';
import { FaLock, FaBan } from 'react-icons/fa';
import { useDebouncedCallback } from 'use-debounce';
import Loading from '@hourglass/common/loading';
import { ExamContext } from '@hourglass/common/context';
import { MutationReturn, useMutationWithDefaults } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import {
  MarkDescription,
  CodeInitial,
  CodeSnippet,
  CodeState,
} from '@student/exams/show/types';
import {
  Editor,
  applyMarks,
  marksToDescs,
  removeMarks,
  removeAllMarks,
} from '@student/exams/show/components/ExamCodeBox';
import { firstFile } from '@student/exams/show/files';
import { FilePickerSelectWithPreview } from '@professor/exams/new/editor/components/FilePicker';
import { languages } from './Code';
import { CodeSnippetCreateMutation } from './__generated__/CodeSnippetCreateMutation.graphql';
import { CodeSnippetChangeMutation } from './__generated__/CodeSnippetChangeMutation.graphql';

export function useCreateCodeSnippetMutation(): MutationReturn<CodeSnippetCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutationWithDefaults<CodeSnippetCreateMutation>(
    graphql`
    mutation CodeSnippetCreateMutation($input: CreateCodeSnippetInput!) {
      createCodeSnippet(input: $input) {
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
          title: 'Error creating new Code body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

function useChangeCodeSnippetMutation(): MutationReturn<CodeSnippetChangeMutation> {
  const { alert } = useContext(AlertContext);
  return useMutationWithDefaults<CodeSnippetChangeMutation>(
    graphql`
    mutation CodeSnippetChangeMutation($input: ChangeCodeSnippetDetailsInput!) {
      changeCodeSnippetDetails(input: $input) {
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
          title: 'Error changing Code body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

const EditLang: React.FC<{
  value: CodeSnippet['lang'];
  onChange: (newLang: CodeSnippet['lang']) => void;
}> = (props) => {
  const {
    value,
    onChange,
  } = props;
  return (
    <Form.Control
      as="select"
      custom
      size="sm"
      className="col-sm-3"
      value={value}
      onChange={(e): void => onChange(e.target.value)}
    >
      {Object.keys(languages).map((k) => <option key={k} value={k}>{languages[k]}</option>)}
    </Form.Control>
  );
};

const EditCodeAnswerValues: React.FC<{
  lang: CodeSnippet['lang'];
  onChangeLang: (newLang: CodeSnippet['lang']) => void;
  value: CodeState;
  onChangeValue: (newVal: CodeState) => void;
  disabled?: boolean;
  debounceDelay?: number;
}> = (props) => {
  const {
    lang,
    onChangeLang,
    value,
    onChangeValue,
    disabled: parentDisabled = false,
    debounceDelay = 1000,
  } = props;
  const answerText = value?.text ?? '';
  const [answerMarks, setAnswerMarks] = useState<MarkDescription[]>([]);
  const [instance, setInstance] = useState<CM.Editor>(undefined);
  const [lockState, setLockState] = useState<LockStateInfo>({
    enabled: false,
    active: false,
  });
  // Because of debouncing, value.marks doesn't get updated frequently enough
  // so we cache it as a stateful variable
  useEffect(() => {
    if (value?.marks) { setAnswerMarks(value.marks); }
  }, [value?.marks]);
  const debouncedOnChangeLang = useDebouncedCallback(onChangeLang, debounceDelay);
  const debouncedOnChangeValue = useDebouncedCallback(onChangeValue, debounceDelay);
  let title: string;
  if (lockState.enabled) {
    if (lockState.active) {
      title = 'Region locked; click to unlock';
    } else {
      title = 'Lock region';
    }
  } else {
    title = 'No region selected to lock';
  }
  const disabled = parentDisabled;
  return (
    <Loading loading={disabled} noText>
      <div className="quill bg-white">
        <div className="ql-toolbar ql-snow">
          <EditLang onChange={debouncedOnChangeLang} value={lang} />
          <Button
            className="float-none"
            variant="outline-secondary"
            size="sm"
            disabled={!lockState.enabled}
            active={lockState.active}
            title={title}
            onClick={(): void => {
              const newMarks = [...answerMarks];
              const { curRange, finalPos } = lockState;
              if (lockState.active) {
                const markId = answerMarks.findIndex((m) => (
                  m.from.ch === curRange.from.ch
                  && m.from.line === curRange.from.line
                  && m.to.ch === curRange.to.ch
                  && m.to.line === curRange.to.line
                ));
                if (markId !== -1) {
                  removeMarks(instance, newMarks.splice(markId, 1));
                }
              } else {
                const newMark: MarkDescription = {
                  from: {
                    ch: curRange.from.ch,
                    line: curRange.from.line,
                  },
                  to: {
                    ch: curRange.to.ch,
                    line: curRange.to.line,
                  },
                  options: {
                    inclusiveLeft: (
                      curRange.from.line === 0
                      && curRange.from.ch === 0
                    ),
                    inclusiveRight: (
                      curRange.to.line === finalPos.line
                      && curRange.to.ch === finalPos.ch
                    ),
                  },
                };
                newMarks.push(newMark);
                applyMarks(instance, [newMark]);
              }
              setAnswerMarks(newMarks);
              debouncedOnChangeValue({ text: answerText, marks: newMarks });
            }}
          >
            <FaLock />
          </Button>
          <Button
            className="float-none"
            variant="outline-secondary"
            size="sm"
            title="Clear all locked regions"
            onClick={(): void => {
              const cursor = instance.getCursor();
              setLockState({
                ...lockState,
                enabled: false,
                active: false,
                curRange: { from: cursor, to: cursor },
              });
              removeAllMarks(instance);
              setAnswerMarks([]);
              debouncedOnChangeValue({ text: answerText, marks: [] });
            }}
          >
            <FaBan />
          </Button>
        </div>
        <Editor
          value={answerText}
          instanceRef={setInstance}
          markDescriptions={answerMarks}
          valueUpdate={[answerMarks]}
          refreshProps={[answerText]}
          language={lang}
          onSelection={(editor, data): void => {
            const { ranges, origin } = data;
            if (origin === undefined) return;
            if (ranges.length > 0) {
              const curRange = ranges[0];
              const selectedMarks = marksToDescs(editor.findMarks(curRange.from(), curRange.to()));
              const lastLine = editor.lastLine();
              const lastLineLen = editor.getLine(lastLine).length;
              if (selectedMarks.length === 0) {
                setLockState({
                  enabled: !curRange.empty(),
                  active: false,
                  curRange: { from: curRange.from(), to: curRange.to() },
                  finalPos: { line: lastLine, ch: lastLineLen },
                });
              } else {
                const activeMark = selectedMarks[0];
                setLockState({
                  active: true,
                  enabled: true,
                  curRange: {
                    from: activeMark.from,
                    to: activeMark.to,
                  },
                  finalPos: { line: lastLine, ch: lastLineLen },
                });
              }
            }
          }}
          onChange={(newText, newMarks): void => {
            debouncedOnChangeValue({ text: newText, marks: newMarks });
          }}
        />
      </div>
    </Loading>
  );
};

interface CMRange {
  from: CM.Position;
  to: CM.Position;
}

interface LockStateInfo {
  enabled: boolean;
  active: boolean;
  curRange?: CMRange;
  finalPos?: CM.Position;
}

const SetInitial: React.FC<{
  initial: CodeSnippet['initial'];
  lang: CodeSnippet['lang'];
  disabled?: boolean;
  onChangeInitial: (newVal: CodeSnippet['initial']) => void;
  onChangeLang: (newVal: CodeSnippet['lang']) => void;
}> = (props) => {
  const {
    initial,
    lang,
    disabled = false,
    onChangeInitial,
    onChangeLang,
  } = props;
  const isFile = initial && 'file' in initial;
  const isText = initial && 'text' in initial;
  const isNone = !initial;
  const { files } = useContext(ExamContext);
  const first = firstFile(files);
  return (
    <Loading loading={disabled} noText>
      <ButtonGroup>
        <Button
          variant={isNone ? 'secondary' : 'outline-secondary'}
          active={isNone}
          onClick={(): void => {
            onChangeInitial(null);
          }}
        >
          None
        </Button>
        <Button
          variant={isText ? 'secondary' : 'outline-secondary'}
          active={isText}
          onClick={(): void => {
            onChangeInitial({ text: '', marks: [] });
          }}
        >
          Supply code
        </Button>
        <Button
          variant={isFile ? 'secondary' : 'outline-secondary'}
          active={isFile}
          disabled={first === undefined}
          title={first === undefined ? 'No reference files were supplied for this exam' : undefined}
          onClick={(): void => {
            onChangeInitial({ file: first.relPath });
          }}
        >
          Choose a file
        </Button>
      </ButtonGroup>
      {initial && 'text' in initial && (
        <EditCodeAnswerValues
          value={initial}
          onChangeValue={onChangeInitial}
          lang={lang}
          onChangeLang={onChangeLang}
        />
      )}
      {initial && 'file' in initial && (
        <FilePickerSelectWithPreview
          options={files}
          selected={[{
            type: 'file',
            path: initial.file,
          }]}
          onChange={(arr): void => {
            const lastSelected = arr[arr.length - 1];
            if (!lastSelected) return;
            if (lastSelected.type === 'dir') return;
            onChangeInitial({ file: lastSelected.path });
          }}
        />
      )}
    </Loading>
  );
};

const CodeSnippetEditor: React.FC<{
  info: CodeSnippet;
  id: string;
  disabled?: boolean;
}> = (props) => {
  const {
    id,
    info,
    disabled: parentDisabled = false,
  } = props;
  const [mutate, loading] = useChangeCodeSnippetMutation();
  const updateInitial = useCallback((newInitial: CodeInitial) => {
    if (newInitial === null) {
      mutate({
        variables: {
          input: {
            bodyItemId: id,
            updateInitial: true,
          },
        },
      });
    } else if ('file' in newInitial) {
      mutate({
        variables: {
          input: {
            bodyItemId: id,
            updateInitial: true,
            initialFile: newInitial,
          },
        },
      });
    } else {
      mutate({
        variables: {
          input: {
            bodyItemId: id,
            updateInitial: true,
            initialCode: newInitial,
          },
        },
      });
    }
  }, [id]);
  const updateLang = useCallback((newVal: string) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateLang: true,
          lang: newVal,
        },
      },
    });
  }, [id]);

  const disabled = parentDisabled || loading;
  return (
    <Form.Group as={Row}>
      <Form.Label column sm={2}>Starter</Form.Label>
      <Col sm={10}>
        <SetInitial
          disabled={disabled}
          initial={info.initial}
          onChangeInitial={updateInitial}
          lang={info.lang}
          onChangeLang={updateLang}
        />
      </Col>
    </Form.Group>
  );
};

export default CodeSnippetEditor;
