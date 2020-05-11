import React, { useContext, useState } from 'react';
import SnapshotInfo from '@hourglass/containers/SnapshotInfo';
import LockdownInfo from '@hourglass/containers/LockdownInfo';
import { RailsContext } from '@hourglass/context';
import './ExamNavbar.css';
import {
  Accordion,
  Card,
  Button,
} from 'react-bootstrap';
import {
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
import AskQuestion from '@hourglass/components/navbar/AskQuestion';

const displayClass = (expanded) => (expanded ? 'transition d-expanded' : 'transition d-collapsed');

interface NavAccordionItemProps {
  onSectionClick: (eventKey: string) => void;
  expanded: boolean;
  Icon: IconType;
  label: string;
  className?: string;
  eventKey: string;
  direction?: 'up' | 'down';
}

export const NavAccordionItem: React.FC<NavAccordionItemProps> = (props) => {
  const {
    onSectionClick,
    expanded,
    Icon,
    label,
    eventKey,
    children,
    className = 'bg-secondary text-light',
    direction = 'down',
  } = props;
  const dExpanded = displayClass(expanded);
  const iconSize = '1.5em';
  const toggle = (
    <Accordion.Toggle
      eventKey={eventKey}
      as={Card.Header}
      className={`${className} cursor-pointer`}
      onClick={(): void => onSectionClick(eventKey)}
    >
      <Icon size={iconSize} />
      <span className={`align-middle ml-3 d-inline-block ${dExpanded}`}>
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
    ? (
      <>
        {collapse}
        {toggle}
      </>
    )
    : (
      <>
        {toggle}
        {collapse}
      </>
    );
  return (
    <Card className="border-dark">
      {cardBody}
    </Card>
  );
};

interface NavAccordionProps {
  expanded: boolean;
  onSectionClick: (eventKey: string) => void;
  openSection: string;
}

const NavAccordion: React.FC<NavAccordionProps> = (props) => {
  const {
    expanded,
    onSectionClick,
    openSection,
  } = props;
  return (
    <Accordion
      activeKey={openSection}
    >
      <NavAccordionItem
        expanded={expanded}
        Icon={GiOpenBook}
        label="Jump to"
        onSectionClick={onSectionClick}
        eventKey="jump"
      >
        <JumpTo />
      </NavAccordionItem>
      <ExamMessages
        expanded={expanded}
        onSectionClick={onSectionClick}
      />
      <NavAccordionItem
        expanded={expanded}
        Icon={MdNoteAdd}
        label="Scratch space"
        onSectionClick={onSectionClick}
        eventKey="scratch"
      >
        <Scratch />
      </NavAccordionItem>
      <NavAccordionItem
        expanded={expanded}
        Icon={MdLiveHelp}
        label="Ask a question"
        onSectionClick={onSectionClick}
        eventKey="askq"
      >
        <AskQuestion />
      </NavAccordionItem>
    </Accordion>
  );
}

const ExamNavbar: React.FC<{}> = () => {
  const { railsUser } = useContext(RailsContext);
  const [expanded, setExpanded] = useState(false);
  const [openSection, setOpenSection] = useState('');
  const additionalClass = expanded ? 'sidebar-expanded' : 'sidebar-small';
  const dExpanded = displayClass(expanded);
  return (
    <div
      className={`
        transition
        bg-dark
        text-white
        float-left
        position-sticky
        d-flex
        flex-column
        p-3
        vh-100
        t-0
        ${additionalClass}
      `}
    >
      <h1 className="d-flex align-items-center">
        <span className={`flex-fill ${dExpanded}`}>
          Hourglass
        </span>
        <Button
          onClick={() => {
            if (expanded) {
              setOpenSection('');
              setExpanded(false);
            } else {
              setExpanded(true);
            }
          }}
        >
          {expanded ? '<<' : '>>'}
        </Button>
      </h1>
      <div className="m-0 p-0">
        <div className="d-flex align-items-center">
          <h6
            className={`my-0 mr-auto ${dExpanded}`}>
            {railsUser.username}
          </h6>
          <span className={`ml-2 ${dExpanded}`}>
            <LockdownInfo />
          </span>
          <span className="ml-2">
            <SnapshotInfo />
          </span>
        </div>
      </div>
      <div className="mt-4 flex-fill overflow-auto">
        <NavAccordion
          onSectionClick={(eventKey): void => {
            if (expanded) {
              if (openSection === eventKey) {
                setOpenSection('');
              } else {
                setOpenSection(eventKey);
              }
            } else {
              setExpanded(true);
              setOpenSection(eventKey);
            }
          }}
          openSection={openSection}
          expanded={expanded}
        />
      </div>
      <div className="mb-2 mt-auto">
        <Accordion className="mt-4">
          <NavAccordionItem
            expanded={expanded}
            Icon={MdTimer}
            label="TODO: Time remaining"
            eventKey="time"
            onSectionClick={() => console.log('TODO')}
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
