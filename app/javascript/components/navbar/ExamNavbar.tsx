import React, { useContext } from 'react';
import SnapshotInfo from '@hourglass/containers/SnapshotInfo';
import LockdownInfo from '@hourglass/containers/LockdownInfo';
import { RailsContext } from '@hourglass/context';
import './ExamNavbar.css';
import {
  Accordion,
  Card,
} from 'react-bootstrap';
import {
  MdFeedback,
  MdNoteAdd,
  MdLiveHelp,
  MdTimer,
} from 'react-icons/md';
import { GiOpenBook } from 'react-icons/gi';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { IconType } from 'react-icons';
import JumpTo from '@hourglass/containers/navbar/JumpTo';
import Scratch from '@hourglass/containers/navbar/Scratch';
import ExamMessages from '@hourglass/containers/navbar/ExamMessages';


interface NavAccordionItemProps {
  Icon: IconType;
  label: string;
  className?: string;
  eventKey: string;
  direction?: 'up' | 'down';
}

const NavAccordionItem: React.FC<NavAccordionItemProps> = (props) => {
  const {
    Icon,
    label,
    eventKey,
    children,
    className = 'bg-secondary text-light',
    direction = 'down',
  } = props;
  const iconSize = '1.5em';
  const toggle = (
    <Accordion.Toggle eventKey={eventKey} as={Card.Header} className={`${className} cursor-pointer`}>
      <Icon size={iconSize} />
      <span className="align-middle ml-3">
        {label}
      </span>
    </Accordion.Toggle>
  );
  const collapse = (
    <Accordion.Collapse eventKey={eventKey}>
      <Card.Body className="bg-light text-dark">
        {children}
      </Card.Body>
    </Accordion.Collapse>
  );
  const cardBody = direction === 'up'
    ? [collapse, toggle]
    : [toggle, collapse];
  return (
    <Card className="border-dark">
      {cardBody}
    </Card>
  );
};

const NavAccordion: React.FC<{}> = () => (
  <Accordion>
    <NavAccordionItem
      Icon={GiOpenBook}
      label="Jump to"
      eventKey="jump"
    >
      <JumpTo />
    </NavAccordionItem>
    <NavAccordionItem
      Icon={MdFeedback}
      label="Professor messages"
      className="bg-warning text-dark"
      eventKey="profmsg"
    >
      <ExamMessages />
    </NavAccordionItem>
    <NavAccordionItem
      Icon={MdNoteAdd}
      label="Scratch space"
      eventKey="scratch"
    >
      <Scratch />
    </NavAccordionItem>
    <NavAccordionItem
      Icon={MdLiveHelp}
      label="Ask a question"
      eventKey="askq"
    >
      TODO
    </NavAccordionItem>
  </Accordion>
);

const ExamNavbar: React.FC<{}> = () => {
  const { railsUser } = useContext(RailsContext);
  return (
    <div className="bg-dark text-white float-left position-sticky d-flex flex-column p-3 vh-100 t-0">
      <h1 className="d-flex align-items-center">
        <span className="exam-navbar-collapse collapse show flex-fill">Hourglass</span>
        <button
          className="navbar-toggler ml-auto mr-n4 btn btn-secondary"
          type="button"
          data-toggle="collapse"
          data-target=".exam-navbar-collapse"
          aria-controls="navbarToggleExternalContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <FaAngleDoubleLeft className="to-collapse" />
          <FaAngleDoubleRight className="to-show" />
        </button>
      </h1>
      <div className="exam-navbar-collapse collapse show m-0 p-0">
        <div className="d-flex align-items-center">
          <h6 className="d-inline my-0 mr-auto">{railsUser.username}</h6>
          <span className="ml-2">
            <LockdownInfo />
          </span>
          <span className="ml-2">
            <SnapshotInfo />
          </span>
        </div>
      </div>
      <div className="exam-navbar-collapse collapse show mt-4">
        <NavAccordion />
      </div>
      <div className="exam-navbar-collapse collapse show mb-2 mt-auto">
        <Accordion>
          <NavAccordionItem
            Icon={MdTimer}
            label="TODO: Time remaining"
            eventKey="time"
            direction="up"
          >
            <p>Exam began: TODO</p>
            <p className="m-0 p-0">Exam ends: TODO</p>
          </NavAccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ExamNavbar;
