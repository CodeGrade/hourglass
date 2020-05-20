import CM from 'codemirror';
import 'codemirror/addon/runmode/runmode';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/mdn-like';
import React, { useEffect, useState } from 'react';
import { UnControlled as UnControlledCodeMirror, IUnControlledCodeMirror } from 'react-codemirror2';
import { MarkDescription } from '@student/types';
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
    const { readOnly, inclusiveLeft, inclusiveRight } = m;
    const found = m.find();
    return {
      ...found,
      options: {
        readOnly,
        inclusiveLeft,
        inclusiveRight,
      },
    };
  });
}

export interface EditorProps {
  value: string;
  valueUpdate: React.DependencyList;
  markDescriptions: MarkDescription[];
  readOnly?: boolean;
  language?: string;
  options?: {};
  onGutterClick?: IUnControlledCodeMirror['onGutterClick'];
  cursor?: IUnControlledCodeMirror['cursor'];
  onCursor?: IUnControlledCodeMirror['onCursor'];
  onChange?: (text: string, marks: MarkDescription[]) => void;
  onFocus?: IUnControlledCodeMirror['onFocus'];
  refreshProps?: React.DependencyList;
  disabled?: boolean;
}

export const Editor: React.FC<EditorProps> = (props) => {
  const {
    value,
    markDescriptions,
    valueUpdate,
    options,
    readOnly = false,
    language = '',
    cursor,
    onCursor,
    onGutterClick,
    onChange,
    onFocus,
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
      appliedMarks.forEach((m) => m.clear());
      instance.setValue(value);
      setAppliedMarks(applyMarks(instance, markDescriptions));
      doSave = true;
    }
  }, [instance, ...valueUpdate]);

  // EFFECT: refresh the instance if any item in refreshProps changes
  useEffect(() => {
    if (instance) {
      if (cursor) instance.setCursor(cursor);
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
      onGutterClick={onGutterClick}
      cursor={cursor}
      onCursor={(editor, data): void => {
        // this callback always needs to be defined
        if (onCursor) {
          onCursor(editor, data);
        }
      }}
      onFocus={(...args): void => {
        // this callback always needs to be defined
        if (onFocus) onFocus(...args);
      }}
      options={myOptions}
      editorDidMount={(editor): void => {
        setInstance(editor);
      }}
    />
  );
};
