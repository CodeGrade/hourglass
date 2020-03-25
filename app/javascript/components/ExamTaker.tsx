import React from "react";
import { useExamState, ExamContextProvider } from "./examstate";
import { Question } from "./Question";
import { FileViewer } from "./FileViewer";
import { HTML } from "./questions/HTML";

interface ExamTakerProps {
  exam: ExamInfo;
}

function ExamTaker(props: ExamTakerProps) {
  const { exam } = props;
  const { files, info } = exam;
  const { questions, instructions } = info;
  const {getAtPath, dispatch} = useExamState(files, info);
  return (
    <ExamContextProvider value={{ dispatch, getAtPath }}>
      <div><HTML value={instructions} /></div>
      {/* TODO: don't show *every* file, use _references_ for this, q, and p */}
      <FileViewer files={files} />
      <div>
        {questions.map((q, i) => (
          <Question question={q} qnum={i} key={i} />
        ))}
      </div>
    </ExamContextProvider>
  );
}

export default ExamTaker;
