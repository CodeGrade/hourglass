import React from 'react';
import {
  Nav,
  Form,
} from 'react-bootstrap';
import {
  PaginationState,
  QuestionInfo,
} from '@student/exams/show/types';
import {
  scrollToQuestion,
} from '@student/exams/show/helpers';
import { alphabetIdx } from '@hourglass/common/helpers';

interface JumpToProps {
  pagination: PaginationState;
  togglePagination: () => void;
  changeQuestion: (qnum: number, pnum?: number) => void;
  spyQuestion: (qnum: number, pnum?: number) => void;
  questions: QuestionInfo[];
}

const JumpTo: React.FC<JumpToProps> = (props) => {
  const {
    pagination,
    togglePagination,
    changeQuestion,
    spyQuestion,
    questions,
  } = props;
  const {
    paginated,
    spyCoords,
    spy,
  } = pagination;
  if (spyCoords.length === 0) return null;
  const selectedCoords = spyCoords[spy];
  const justQuestion = selectedCoords.part === undefined;
  return (
    <>
      <Form.Check
        type="switch"
        id="toggle-pagination-switch"
        checked={paginated}
        onChange={(_e): void => {
          togglePagination();
          scrollToQuestion(selectedCoords.question, selectedCoords.part, false);
        }}
        label="Toggle pagination"
      />
      <Nav variant="pills" className="flex-column">
        {spyCoords.map((c, ci) => {
          const { question: qi, part: pi } = c;
          const selectedQuestion = qi === selectedCoords.question;
          const qlabel = `Question ${qi + 1}`;
          const { separateSubparts } = questions[qi];
          if (c.part === undefined) {
            return (
              // Question indices are STATIC
              // eslint-disable-next-line react/no-array-index-key
              <Nav.Item key={ci}>
                <Nav.Link
                  eventKey={c.question}
                  active={selectedQuestion && justQuestion}
                  onSelect={(): void => {
                    if (paginated) {
                      if (separateSubparts) {
                        changeQuestion(c.question, 0);
                        spyQuestion(c.question, 0);
                      } else {
                        changeQuestion(c.question);
                      }
                    }
                    scrollToQuestion(c.question);
                  }}
                >
                  {qlabel}
                </Nav.Link>
              </Nav.Item>
            );
          }
          // The only parts in spyCoords are the ones that aren't
          // solo or anonymous parts
          const selectedPart = c.part === selectedCoords.part;
          const active = selectedQuestion && selectedPart;
          const plabel = `Part ${alphabetIdx(c.part)}`;
          return (
            <Nav.Item
              // Part indices are STATIC
              // eslint-disable-next-line react/no-array-index-key
              key={ci}
            >
              <Nav.Link
                eventKey={ci}
                className="pl-5"
                active={active}
                onSelect={(): void => {
                  if (paginated) {
                    if (separateSubparts) {
                      changeQuestion(qi, pi);
                      spyQuestion(qi, pi);
                    }
                    changeQuestion(qi, pi);
                  }
                  scrollToQuestion(qi, pi);
                }}
              >
                {plabel}
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
    </>
  );
};
export default JumpTo;
