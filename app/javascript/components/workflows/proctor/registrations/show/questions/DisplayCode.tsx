import React, { useContext } from 'react';
import { CodeState, CodeInfo } from '@student/exams/show/types';
import { Editor } from '@student/exams/show/components/ExamCodeBox';
import { ExamContext } from '@hourglass/common/context';

interface CodeProps {
  info: CodeInfo;
  value?: CodeState;
  refreshProps?: React.DependencyList;
  fullyExpandCode?: boolean;
}

const DisplayCode: React.FC<CodeProps> = (props) => {
  const {
    info,
    value,
    refreshProps,
    fullyExpandCode = false,
  } = props;
  const { lang, initial } = info;
  const { fmap } = useContext(ExamContext);
  if (value === undefined) {
    return (
      <>
        <b>Answer: </b>
        <i>No answer given</i>
      </>
    );
  }
  let text = value?.text ?? undefined;
  let marks = value?.marks ?? undefined;
  if (initial) {
    if ('file' in initial) {
      const f = fmap[initial.file];
      if (f?.filedir === 'dir') {
        throw new Error('Code initial cannot be a directory.');
      }
      text = text ?? f?.contents;
      marks = marks ?? f?.marks;
    } else if ('text' in initial) {
      text = text ?? initial.text;
      marks = marks ?? initial.marks;
    }
  }
  text = text ?? '';
  marks = marks ?? [];
  return (
    <Editor
      refreshProps={refreshProps}
      readOnly
      value={text}
      markDescriptions={marks}
      language={lang}
      autosize={fullyExpandCode}
    />
  );
};

export default DisplayCode;
