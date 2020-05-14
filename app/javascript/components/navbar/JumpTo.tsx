import React from 'react';
import {
  Nav,
  Form,
} from 'react-bootstrap';
import {
  PaginationState,
  QuestionInfo,
} from '@hourglass/types';
import {
  scrollToQuestion,
  scrollToTop,
} from '@hourglass/helpers';

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
          scrollToTop();
          // setTimeout(() => spyQuestion(selectedCoords.question, part));
        }}
        label="Toggle pagination"
      />
      <Nav variant="pills" className="flex-column">
        {questions.map((q, qi) => {
          const selectedQuestion = qi === selectedCoords.question;
          const qlabel = `Question ${qi + 1}`;
          return (
            <React.Fragment
              // Question indices are STATIC
              // eslint-disable-next-line react/no-array-index-key
              key={qi}
            >
              <Nav.Item>
                <Nav.Link
                  eventKey={qi}
                  active={selectedQuestion && justQuestion}
                  onSelect={(): void => {
                    if (paginated) {
                      if (q.separateSubparts) {
                        changeQuestion(qi, 0);
                        spyQuestion(qi, 0);
                      } else {
                        changeQuestion(qi);
                      }
                    }
                    scrollToQuestion(qi);
                  }}
                >
                  {qlabel}
                </Nav.Link>
              </Nav.Item>
              {q.parts.map((_p, pi) => {
                const selectedPart = pi === selectedCoords.part;
                const active = selectedQuestion && selectedPart;
                const plabel = `Part ${pi + 1}`;
                return (
                  <Nav.Item
                    // Part indices are STATIC
                    // eslint-disable-next-line react/no-array-index-key
                    key={pi}
                  >
                    <Nav.Link
                      eventKey={pi}
                      className="pl-5"
                      active={active}
                      onSelect={(): void => {
                        if (paginated) {
                          if (q.separateSubparts) {
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
            </React.Fragment>
          );
        })}
      </Nav>
    </>
  );
};
export default JumpTo;
