import CM from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/mdn-like';

import 'codemirror/addon/runmode/runmode';
import 'codemirror/addon/selection/active-line';

import 'codemirror/mode/clike/clike';
import 'codemirror/mode/mllike/mllike';
import 'codemirror/mode/ebnf/ebnf';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/scheme/scheme';
import 'codemirror/mode/python/python';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/htmlmixed/htmlmixed';
import React, { useEffect, useState } from 'react';
import { UnControlled as UnControlledCodeMirror, IUnControlledCodeMirror } from 'react-codemirror2';
import { MarkDescription } from '@student/exams/show/types';
import './ExamCodeBox.css';

function applyMarks(cm: CM.Editor, marks: MarkDescription[]): CM.TextMarker[] {
  return marks.map((mark) => cm.markText(mark.from, mark.to, {
    ...mark.options,
    readOnly: true,
    className: 'readOnly',
  }));
}

function marksToDescs(marks: CM.TextMarker[]): MarkDescription[] {
  return marks.map((m) => {
    const { inclusiveLeft, inclusiveRight } = m;
    const found = m.find();
    return {
      from: {
        ch: found.from.ch,
        line: found.from.line,
      },
      to: {
        ch: found.to.ch,
        line: found.to.line,
      },
      options: {
        inclusiveLeft,
        inclusiveRight,
      },
    };
  });
}

export interface EditorProps {
  value: string;
  valueUpdate?: React.DependencyList;
  markDescriptions: MarkDescription[];
  readOnly?: boolean;
  language?: string;
  options?: IUnControlledCodeMirror['options'];
  onGutterClick?: IUnControlledCodeMirror['onGutterClick'];
  cursor?: IUnControlledCodeMirror['cursor'];
  onCursor?: IUnControlledCodeMirror['onCursor'];
  onChange?: (text: string, marks: MarkDescription[]) => void;
  onFocus?: IUnControlledCodeMirror['onFocus'];
  onSelection?: IUnControlledCodeMirror['onSelection'];
  refreshProps?: React.DependencyList;
  disabled?: boolean;
}

export const Editor: React.FC<EditorProps> = (props) => {
  const {
    value,
    markDescriptions,
    valueUpdate = [],
    options,
    readOnly = false,
    language = '',
    cursor,
    onCursor,
    onGutterClick,
    onChange,
    onFocus,
    onSelection,
    refreshProps = [],
    disabled = false,
  } = props;

  // keep track of codemirror instance
  const [instance, setInstance] = useState<CM.Editor>(undefined);

  // doSave applied marks to clear them if we change files
  const [appliedMarks, setAppliedMarks] = useState([]);

  // whether to enable saving state to redux
  // this boolean is purposefully local to this specific render:
  // using setState would result in one render with the old value and then
  // one with the new value.
  // This way, the effect runs and properly sets doSave in onChange.
  let doSave = true;

  // EFFECT: reset marks and value initially,
  // or if valueUpdate changes
  useEffect(() => {
    if (instance) {
      doSave = false;
      const curCursor = instance.getCursor();
      appliedMarks.forEach((m) => m.clear());
      instance.setValue(value);
      setAppliedMarks(applyMarks(instance, markDescriptions));
      instance.setCursor(curCursor.line, curCursor.ch, {
        scroll: false,
      });
      doSave = true;
    }
  }, [instance, ...valueUpdate]);

  // EFFECT: refresh the instance if any item in refreshProps changes
  useEffect(() => {
    if (instance) {
      if (cursor) {
        instance.setCursor(cursor.line, cursor.ch, {
          scroll: false,
        });
      }
      instance.refresh();
    }
  }, refreshProps);

  const disableCursor = disabled ? 'nocursor' : false;

  const myOptions = {
    theme: 'mdn-like',
    indentUnit: 2,
    viewportMargin: Infinity,
    lineNumbers: true,
    lineWrapping: false,
    mode: language,
    extraKeys: CM.normalizeKeyMap({
      Enter: 'newlineAndIndent',
      Tab: 'indentAuto',
    }),
    readOnly: readOnly || disableCursor,
    cursorBlinkRate: readOnly ? -1 : 500,
    ...options,
  };
  return (
    <UnControlledCodeMirror
      onChange={(cm, _state, newVal): void => {
        if (onChange && doSave) {
          const appliedDescs = marksToDescs(cm.getAllMarks());
          onChange(newVal, appliedDescs);
        }
      }}
      onGutterClick={(...args): void => {
        if (onGutterClick) onGutterClick(...args);
      }}
      cursor={cursor}
      onCursor={(editor, data): void => {
        if (onCursor) {
          onCursor(editor, data);
        }
      }}
      onFocus={(...args): void => {
        if (onFocus) onFocus(...args);
      }}
      onSelection={(...args): void => {
        if (onSelection) onSelection(...args);
      }}
      options={myOptions}
      editorDidMount={(editor): void => {
        setInstance(editor);
      }}
    />
  );
};
