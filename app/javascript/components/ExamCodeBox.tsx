import CM from 'codemirror';
import 'codemirror/addon/runmode/runmode';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/mdn-like';
import React, { useEffect, useState } from 'react';
import Highlighter from 'react-codemirror-runmode';
import { Controlled as ControlledCodeMirror, IControlledCodeMirror } from 'react-codemirror2';
import { MarkDescription } from '../types';

function applyMarks(cm: CM.Editor, marks: MarkDescription[]) {
  marks.forEach((mark) => {
    cm.markText(mark.from, mark.to, {
      ...mark.options,
      readOnly: true,
      className: 'readOnly',
    });
  });
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
}

export const Editor = (props: EditorProps) => {
  const {
    options, readOnly, language, value, initialMarks,
    cursor, onCursor,
    onGutterClick,
    onBeforeChange,
  } = props;
  const [instance, setInstance] = useState(undefined);
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
        if (onCursor) onCursor(...args);
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
