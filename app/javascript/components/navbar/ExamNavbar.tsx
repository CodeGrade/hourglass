import React from 'react';
import SnapshotInfo from '@hourglass/containers/SnapshotInfo';
import LockdownInfo from '@hourglass/containers/LockdownInfo';
import './ExamNavbar.css';
import {
  Accordion,
  Card,
} from 'react-bootstrap';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { MdFeedback, MdNoteAdd, MdLiveHelp } from 'react-icons/md';


interface NavAccordionItemProps {
  icon: React.ReactNode;
  label: string;
  eventKey: string;
}

const NavAccordionItem: React.FC<NavAccordionItemProps> = (props) => {
  const {
    icon,
    label,
    eventKey,
    children,
  } = props;
  return (
    <Card className="border-info">
      <Accordion.Toggle eventKey={eventKey} as={Card.Header} className="bg-info cursor-pointer">
        {icon}
        <span className="align-middle ml-1">
          {label}
        </span>
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body className="bg-light text-dark">
          {children}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

const NavAccordion: React.FC<{}> = () => (
  <Accordion>
    <NavAccordionItem
      icon={<MenuBookIcon />}
      label="Jump to"
      eventKey="jump"
    >
      TODO
    </NavAccordionItem>
    <NavAccordionItem
      icon={<MdFeedback />}
      label="Professor Messages"
      eventKey="profmsg"
    >
      TODO
    </NavAccordionItem>
    <NavAccordionItem
      icon={<MdNoteAdd />}
      label="Scratch space"
      eventKey="scratch"
    >
      TODO
    </NavAccordionItem>
    <NavAccordionItem
      icon={<MdLiveHelp />}
      label="Ask a question"
      eventKey="askq"
    >
      TODO
    </NavAccordionItem>
  </Accordion>
);

const ExamNavbar: React.FC<{}> = () => (
  <div className="bg-dark text-white float-left position-sticky p-3 vh-100 t-0">
    <div>
      <h1 className="d-inline align-middle">Hourglass</h1>
      <span className="ml-2">
        <LockdownInfo />
      </span>
      <span className="ml-2">
        <SnapshotInfo />
      </span>
    </div>
    <div className="mt-2">
      <NavAccordion />
    </div>
    <div className="position-absolute b-0">
      TODO: Time Remaining
    </div>
  </div>
);

export default ExamNavbar;
