import React from 'react';
import { Dropdown } from 'react-bootstrap';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import {
  PaginationState,
  QuestionInfo,
} from '@hourglass/types';
import {
  scrollToQuestion,
  scrollToPart,
} from '@hourglass/helpers';

interface PaginationDropdownProps {
  pagination: PaginationState;
  togglePagination: () => void;
  changeQuestion: (qnum: number, pnum?: number) => void;
  questions: QuestionInfo[];
}

const PaginationDropdown: React.FC<PaginationDropdownProps> = (props) => {
  const {
    pagination,
    togglePagination,
    changeQuestion,
    questions,
  } = props;
  const {
    paginated,
    selected,
  } = pagination;
  return (
    <Dropdown className="d-inline">
      <Dropdown.Toggle
        className="text-white"
        id="toggle-exam-contents"
        variant="outline-secondary"
      >
        <MenuBookIcon />
      </Dropdown.Toggle>
      <Dropdown.Menu alignRight>
        <Dropdown.Item
          active={paginated}
          onClick={togglePagination}
        >
          Toggle paginated display
        </Dropdown.Item>
        <Dropdown.Divider />
        {questions.map((q, qi) => {
          const selectedQuestion = qi === selected.question;
          return (
            <div
              // Question numbers are STATIC.
              // eslint-disable-next-line react/no-array-index-key
              key={qi}
            >
              <Dropdown.Item
                className="pl-3"
                onClick={(): void => {
                  if (paginated) {
                    changeQuestion(qi);
                  }
                  scrollToQuestion(qi);
                }}
              >
                Question
                {' '}
                {qi + 1}
              </Dropdown.Item>
              {q.parts.map((_p, pi) => {
                const selectedPart = pi === selected.part;
                const active = paginated && selectedQuestion && selectedPart;
                return (
                  <Dropdown.Item
                    // Part numbers are STATIC.
                    // eslint-disable-next-line react/no-array-index-key
                    key={pi}
                    className="pl-5"
                    active={active}
                    onClick={(): void => {
                      if (paginated) {
                        changeQuestion(qi, pi);
                      }
                      scrollToPart(qi, pi);
                    }}
                  >
                    Part
                    {' '}
                    {pi + 1}
                  </Dropdown.Item>
                );
              })}
            </div>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};
export default PaginationDropdown;
