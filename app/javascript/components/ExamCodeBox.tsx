import React from "react";
import cm from "codemirror";
import {
  Controlled as CodeMirror,
  IControlledCodeMirror
} from "react-codemirror2";
import "codemirror/addon/runmode/runmode";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/mdn-like";

import Highlighter from "react-codemirror-runmode";

interface EditorProps extends IControlledCodeMirror {
  readOnly: boolean;
}

export const Editor = ({ options, readOnly, ...props }: EditorProps) => {
  const myOptions = {
    theme: "mdn-like",
    indentUnit: 2,
    viewportMargin: Infinity,
    lineNumbers: true,
    lineWrapping: false,
    styleActiveLine: true,
    extraKeys: cm.normalizeKeyMap({
      Enter: "newlineAndIndent",
      Tab: "indentAuto"
    }),
    readOnly,
    ...options
  };
  return <CodeMirror {...props} options={myOptions} />;
};

export const Renderer = ({ value, ...props }) => (
  <Highlighter value={value} codeMirror={cm} theme="mdn-like" {...props} />
);
