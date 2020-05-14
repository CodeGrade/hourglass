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
  scrollToPart,
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
    selected,
    spy,
  } = pagination;
  const justQuestion = spy.part === undefined;
  return (
    <>
      <Form.Check
        type="switch"
        id="toggle-pagination-switch"
        checked={paginated}
        onChange={(_e): void => {
          togglePagination();
          scrollToPart(selected.question, selected.part);
          setTimeout(() => spyQuestion(selected.question, selected.part));
        }}
        label="Toggle pagination"
      />
      <Nav variant="pills" className="flex-column">
        {questions.map((q, qi) => {
          const selectedQuestion = qi === spy.question;
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
                    if (paginated && q.separateSubparts) {
                      changeQuestion(qi, 0);
                      scrollToQuestion(qi);
                      spyQuestion(qi, 0);
                    } else {
                      changeQuestion(qi);
                      scrollToQuestion(qi);
                    }
                  }}
                >
                  {qlabel}
                </Nav.Link>
              </Nav.Item>
              {q.parts.map((_p, pi) => {
                const selectedPart = pi === spy.part;
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
                        changeQuestion(qi, pi);
                        scrollToPart(qi, pi);
                        if (paginated && q.separateSubparts) {
                          spyQuestion(qi, pi);
                        }
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
