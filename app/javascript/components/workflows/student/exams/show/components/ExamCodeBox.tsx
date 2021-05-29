import CM from 'codemirror';
import './ExamCodeBox.scss';

import 'codemirror/addon/runmode/runmode';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/edit/matchbrackets';

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

export function applyMarks(cm: CM.Editor, marks: MarkDescription[]): void {
  marks.map((mark) => cm.markText(mark.from, mark.to, {
    ...mark.options,
    readOnly: true,
    className: 'readOnly',
  }));
}

export function removeMarks(cm: CM.Editor, marks: MarkDescription[]): void {
  marks.forEach((mark) => {
    cm.findMarks(mark.from, mark.to).forEach((m) => {
      if (m.className === 'readOnly') {
        const where = m.find();
        if (where.from.ch === mark.from.ch
          && where.from.line === mark.from.line
          && where.to.ch === mark.to.ch
          && where.to.line === mark.to.line) {
          m.clear();
        }
      }
    });
  });
}

export function marksToDescs(marks: CM.TextMarker[]): MarkDescription[] {
  return marks.filter((m) => m.className === 'readOnly').map((m) => {
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
  autosize?: boolean;
  instanceRef?: React.RefCallback<CM.Editor>;
}

const languageSpecificKeys = {
  scheme: {
    'Ctrl-\\': (cm : CM.Editor): void => {
      cm.replaceSelection('λ');
    },
  },
};

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
    autosize = false,
    instanceRef,
  } = props;

  // keep track of codemirror instance
  const [instance, setInstance] = useState<CM.Editor>(undefined);

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
      instance.getAllMarks().forEach((m) => {
        if (m.className === 'readOnly') {
          m.clear();
        }
      });
      if (instance.getValue() !== value) { instance.setValue(value); }
      applyMarks(instance, markDescriptions);
      instance.setCursor(curCursor.line, curCursor.ch, {
        scroll: false,
      });
      doSave = true;
    }
  }, [instance, ...valueUpdate]);

  // EFFECT: refresh the instance if any item in refreshProps changes
  useEffect(() => {
    setTimeout(() => {
      if (instance) {
        if (cursor) {
          instance.setCursor(cursor.line, cursor.ch, {
            scroll: false,
          });
        }
        instance.refresh();
      }
    });
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
      ...languageSpecificKeys[language],
    }),
    readOnly: readOnly || disableCursor,
    cursorBlinkRate: readOnly ? -1 : 500,
    matchBrackets: true,
    ...options,
  };
  return (
    <UnControlledCodeMirror
      className={autosize ? 'h-auto' : ''}
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
        if (instanceRef) {
          instanceRef(editor);
        }
      }}
    />
  );
};
