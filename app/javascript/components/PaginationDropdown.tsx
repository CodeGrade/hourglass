import React from 'react';
import { Dropdown } from 'react-bootstrap';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import {
  PaginationState,
  Question,
} from '@hourglass/types';
import { scrollToQuestion } from '@hourglass/helpers';

interface PaginationDropdownProps {
  pagination: PaginationState;
  togglePagination: () => void;
  changeQuestion: (idx: number) => void;
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
        {questions.map((q, i) => {
          const selectedQuestion = i === selected.question;
          const active = paginated && selectedQuestion;
          return (
            <Dropdown.Item
              key={i}
              className="pl-3"
              active={active}
              onClick={() => {
                if (paginated) {
                  changeQuestion(i);
                } else {
                  scrollToQuestion(i);
                }
              }}
            >
              Question {i+1}
            </Dropdown.Item>
          );
        })}
        <Dropdown.Item className="pl-5">TODO Part</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
export default PaginationDropdown;
