import React from "react";
import { FileDir } from "./examstate";
import { Part } from "./Part"
import { HTML } from "./questions/HTML";

export interface Question {
  name?: string;
  description: string;
  separateSubparts: boolean;
  parts: Array<Part>;
  reference?: Array<FileDir>;
}

export interface QuestionProps extends Question {
  qnum: number;
}

export function Question(props: QuestionProps) {
  const { name, description, qnum, parts } = props;
  return (
    <div>
      <h1>Question {qnum + 1}: {name}</h1>
      <div><HTML value={description} /></div>
      {/* TODO: show files */}
      {parts.map((p, i) => (
        <Part {...p} pnum={i} qnum={qnum} key={i} />
      ))}
    </div>
  );
}

