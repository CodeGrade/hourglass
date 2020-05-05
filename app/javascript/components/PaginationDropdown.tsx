import React from 'react';
import { Dropdown } from 'react-bootstrap';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import {
  PaginationState,
  Question,
} from '@hourglass/types';
import {
  scrollToQuestion,
  scrollToPart,
} from '@hourglass/helpers';

interface PaginationDropdownProps {
  pagination: PaginationState;
  togglePagination: () => void;
  changeQuestion: (qnum: number, pnum?: number) => void;
  questions: Question[];
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
              key={`q-${qi}`}
            >
              <Dropdown.Item
                className="pl-3"
                onClick={() => {
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
              {q.parts.map((p, pi) => {
                const selectedPart = pi === selected.part;
                const active = paginated && selectedQuestion && selectedPart;
                return (
                  <Dropdown.Item
                    key={`q-${qi}-p-${pi}`}
                    className="pl-5"
                    active={active}
                    onClick={() => {
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
