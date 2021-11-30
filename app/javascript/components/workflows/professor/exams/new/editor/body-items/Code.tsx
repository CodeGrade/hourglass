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
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import { FaLock, FaBan } from 'react-icons/fa';
import { useDebouncedCallback } from 'use-debounce/lib';
import Loading from '@hourglass/common/loading';
import { ExamContext } from '@hourglass/common/context';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import {
  MarkDescription,
  CodeState,
  CodeInfo,
  HTMLVal,
  CodeInitial,
} from '@student/exams/show/types';
import {
  Editor,
  applyMarks,
  marksToDescs,
  removeMarks,
  removeAllMarks,
} from '@student/exams/show/components/ExamCodeBox';
import { firstFile } from '@student/exams/show/files';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { FilePickerSelectWithPreview } from '@professor/exams/new/editor/components/FilePicker';
import { CodeCreateMutation } from './__generated__/CodeCreateMutation.graphql';
import { CodeChangeMutation } from './__generated__/CodeChangeMutation.graphql';

export const languages = {
  scheme: 'Racket',
  'text/x-java': 'Java',
  'text/x-python': 'Python',
  'text/javascript': 'Javascript',
  mllike: 'ML',
  'text/x-ebnf': 'ML Yacc',
  'text/x-csrc': 'C',
  'text/x-c++src': 'C++',
  // pyret: 'Pyret',
  'text/html': 'HTML',
  'text/css': 'CSS',
  'application/xml': 'XML',
};

export function useCreateCodeMutation(): MutationReturn<CodeCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<CodeCreateMutation>(
    graphql`
    mutation CodeCreateMutation($input: CreateCodeInput!) {
      createCode(input: $input) {
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

function useChangeCodeMutation(): MutationReturn<CodeChangeMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<CodeChangeMutation>(
    graphql`
    mutation CodeChangeMutation($input: ChangeCodeDetailsInput!) {
      changeCodeDetails(input: $input) {
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
  value: CodeInfo['lang'];
  onChange: (newLang: CodeInfo['lang']) => void;
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
  lang: CodeInfo['lang'];
  onChangeLang: (newLang: CodeInfo['lang']) => void;
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
    setAnswerMarks(value.marks);
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
  from: CodeMirror.Position;
  to: CodeMirror.Position;
}

interface LockStateInfo {
  enabled: boolean;
  active: boolean;
  curRange?: CMRange;
  finalPos?: CodeMirror.Position;
}

const SetInitial: React.FC<{
  initial: CodeInfo['initial'];
  lang: CodeInfo['lang'];
  disabled?: boolean;
  onChangeInitial: (newVal: CodeInfo['initial']) => void;
  onChangeLang: (newVal: CodeInfo['lang']) => void;
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
        <>
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
        </>
      )}
    </Loading>
  );
};

const Code: React.FC<{
  info: CodeInfo;
  id: string;
  disabled?: boolean;
  answer: CodeState;
}> = (props) => {
  const {
    id,
    info,
    answer,
    disabled: parentDisabled = false,
  } = props;
  const [mutate, { loading }] = useChangeCodeMutation();
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
  const updateAnswer = useCallback((newAnswer: CodeState) => {
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
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Answer</Form.Label>
        <Col sm={10}>
          <EditCodeAnswerValues
            disabled={disabled}
            lang={info.lang}
            onChangeLang={updateLang}
            value={answer}
            onChangeValue={updateAnswer}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Code;
