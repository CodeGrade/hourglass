import CM from 'codemirror';
import 'codemirror/addon/runmode/runmode';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/mdn-like';
import React, { useEffect, useState } from 'react';
import Highlighter from 'react-codemirror-runmode';
import { Controlled as ControlledCodeMirror, IControlledCodeMirror } from 'react-codemirror2';
import { MarkDescription } from '../types';

function applyMarks(cm: CM.Editor, marks: MarkDescription[]): CM.TextMarker[] {
  return marks.map((mark) =>
    cm.markText(mark.from, mark.to, {
      ...mark.options,
      readOnly: true,
      className: 'readOnly',
    })
  );
}

export interface EditorProps {
  readOnly?: boolean;
  language?: string;
  initialMarks?: MarkDescription[];
  value: string;
  options?: {};
  onGutterClick?: IControlledCodeMirror["onGutterClick"];
  cursor?: IControlledCodeMirror["cursor"];
  onCursor?: IControlledCodeMirror["onCursor"];
  onBeforeChange?: IControlledCodeMirror["onBeforeChange"];
  onFocus?: IControlledCodeMirror["onFocus"];
  refreshProps?: any[];
}

export const Editor = (props: EditorProps) => {
  const {
    options, readOnly, language, value, initialMarks,
    cursor, onCursor,
    onGutterClick,
    onBeforeChange,
    onFocus,
    refreshProps: rp,
  } = props;
  const refreshProps = rp ?? [];
  const [instance, setInstance] = useState(undefined);

  // save current marks to clear them if we change files
  const [appliedMarks, setAppliedMarks] = useState([]);
  // EFFECT: clear and reset marks if instance or file changes
  useEffect(() => {
    if (instance && initialMarks) {
      appliedMarks.forEach(m => m.clear());
      setAppliedMarks(applyMarks(instance, initialMarks));
    }
  }, [instance, initialMarks]);
  // EFFECT: refresh the instance if any item in refreshProps changes
  useEffect(() => {
    if (instance) {
      instance.refresh();
    }
  }, refreshProps);
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
    readOnly,
    ...options,
  };
  return (
    <ControlledCodeMirror
      onBeforeChange={(...args) => {
        // this callback always needs to be defined
        if (onBeforeChange) onBeforeChange(...args);
      }}
      onGutterClick={onGutterClick}
      cursor={cursor}
      onCursor={(...args) => {
        // this callback always needs to be defined
        if (onCursor) onCursor(...args);
      }}
      onFocus={(...args) => {
        // this callback always needs to be defined
        if (onFocus) onFocus(...args);
      }}
      value={value}
      options={myOptions}
      editorDidMount={(editor) => {
        setInstance(editor);
      }}
    />
  );
};

export const Renderer = ({ value, ...props }) => (
  <Highlighter value={value} codeMirror={CM} theme="mdn-like" {...props} />
);
