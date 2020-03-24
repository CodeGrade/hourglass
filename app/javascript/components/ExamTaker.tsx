import TreeItem from "@material-ui/lab/TreeItem";
import React from "react";
import { useExamState, ExamContextProvider } from "./examstate";
import { Question } from "./Question";
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
      {/* TODO: show files */}
      <div>
        {questions.map((q, i) => (
          <Question question={q} qnum={i} key={i} />
        ))}
      </div>
    </ExamContextProvider>
  );
}

export default ExamTaker;
