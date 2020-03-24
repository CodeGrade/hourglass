import React from "react";
import { Part } from "./Part"
import { HTML } from "./questions/HTML";

export interface QuestionProps {
  question: Question;
  qnum: number;
}

export function Question(props: QuestionProps) {
  const { question, qnum } = props;
  const { name, description, separateSubparts, parts } = question;
  let jumpToPart = null;
  if (separateSubparts) {
    jumpToPart =
      <div className="mt-4 question-nav d-print-none">
        <b>Jump to part:</b>
        <nav aria-label="part navigation" className="d-inline-block">
          <ul className="pagination">
            {parts.map((p, i) => {
              return (
                <li key={i} className="page-item part-page-item" id={`nav-q${qnum + 1}p${i + 1}`}>
                  <a href="#" className="page-link question-link">
                    {qnum + 1}-{i + 1}
                  </a>
                </li>)
            })}
          </ul>
        </nav>
      </div>
  }
  return (
    <div className={`row question no-gutters ${separateSubparts ? "paginated" : ""}`}>
      <h1>Question {qnum + 1}: {name}</h1>
      <div><HTML value={description} /></div>
      {/* TODO: show files */}
      {jumpToPart}
      {parts.map((p, i) => (
        <Part part={p} pnum={i} qnum={qnum} key={i} />
      ))}
    </div>
  );
}

