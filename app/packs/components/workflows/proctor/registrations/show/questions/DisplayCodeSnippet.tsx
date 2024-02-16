import React, { useContext } from 'react';
import { CodeSnippet } from '@student/exams/show/types';
import { ExamContext } from '@hourglass/common/context';
import DisplayCode from './DisplayCode';

interface CodeSnippetProps {
  info: CodeSnippet;
  refreshProps?: React.DependencyList;
  fullyExpandCode?: boolean;
}

const DisplayCodeSnippet: React.FC<CodeSnippetProps> = (props) => {
  const {
    info,
    refreshProps,
    fullyExpandCode = false,
  } = props;
  const { lang, initial } = info;
  const { fmap } = useContext(ExamContext);
  if (!initial) return null;
  if ('file' in initial) {
    const f = fmap[initial.file];
    if (f.filedir === 'dir') {
      return `Unexpected directory reference ${f.path}`;
    }
    return (
      <div className="no-hover">
        <DisplayCode
          info={{ type: 'Code', lang }}
          value={{ marks: f.marks, text: f.contents }}
          fullyExpandCode={fullyExpandCode}
          refreshProps={refreshProps}
        />
      </div>
    );
  }
  return (
    <div className="no-hover">
      <DisplayCode
        info={{ type: 'Code', lang }}
        value={initial}
        refreshProps={refreshProps}
        fullyExpandCode={fullyExpandCode}
      />
    </div>
  );
};

export default DisplayCodeSnippet;
