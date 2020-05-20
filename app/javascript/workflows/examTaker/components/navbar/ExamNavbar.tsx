import React, { useContext, useState } from 'react';
import SnapshotInfo from '@examTaker/containers/SnapshotInfo';
import LockdownInfo from '@examTaker/containers/LockdownInfo';
import { RailsContext } from '@examTaker/context';
import './ExamNavbar.css';
import {
  Accordion,
  Card,
  Button,
  Collapse,
} from 'react-bootstrap';
import {
  MdNoteAdd,
  MdLiveHelp,
  MdTimer,
} from 'react-icons/md';
import { GiOpenBook } from 'react-icons/gi';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { IconType } from 'react-icons';
import JumpTo from '@examTaker/containers/navbar/JumpTo';
import Scratch from '@examTaker/containers/navbar/Scratch';
import ExamMessages from '@examTaker/containers/navbar/ExamMessages';
import AskQuestion from '@examTaker/containers/navbar/AskQuestion';
import RenderIcon from '@examTaker/components/Icon';

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
  const toggle = (
    <Accordion.Toggle
      eventKey={eventKey}
      as={Card.Header}
      className={`${className} d-flex cursor-pointer`}
      onClick={(): void => onSectionClick(eventKey)}
    >
      <RenderIcon I={Icon} className="" />
      <span aria-hidden="true" className="width-0">&nbsp;</span>
      <Collapse
        in={expanded}
        dimension="width"
      >
        <span className="align-self-center flex-fill">
          <span className="mr-3" />
          <span className="flex-fill">{label}</span>
        </span>
      </Collapse>
    </Accordion.Toggle>
  );
  const collapse = (
    <Accordion.Collapse eventKey={eventKey}>
      <Card.Body className="bg-light text-dark">
        <Collapse
          in={expanded}
          dimension="width"
        >
          <div className="w-100">{children}</div>
        </Collapse>
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
};

const ExamNavbar: React.FC<{}> = () => {
  const { railsUser } = useContext(RailsContext);
  const [expanded, setExpanded] = useState(false);
  const [openSection, setOpenSection] = useState('');
  const [openTimer, setOpenTimer] = useState('');
  const additionalClass = expanded ? 'sidebar-expanded' : 'sidebar-small';
  return (
    <div
      id="sidebar"
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
      <div className="d-flex align-items-center">
        <Collapse
          in={expanded}
          dimension="width"
        >
          <h1 className="flex-fill">
            Hourglass
          </h1>
        </Collapse>
        <h1 aria-hidden="true" className="width-0">&nbsp;</h1>
        <Button
          className="ml-2"
          onClick={(): void => {
            if (expanded) {
              setOpenSection('');
              setOpenTimer('');
              setExpanded(false);
            } else {
              setExpanded(true);
            }
          }}
        >
          {expanded
            ? <RenderIcon I={FaAngleDoubleLeft} />
            : <RenderIcon I={FaAngleDoubleRight} />}
        </Button>
      </div>
      <div className="m-0 p-0">
        <div className="d-flex align-items-center">
          <Collapse
            in={expanded}
            dimension="width"
          >
            <span className="flex-fill">
              <span className="d-flex w-100 align-items-center">
                <h6 className="my-0">
                  {railsUser.displayName}
                </h6>
                <span className="flex-fill" />
                <span className="ml-2">
                  <LockdownInfo />
                </span>
              </span>
            </span>
          </Collapse>
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
        <Accordion
          className="mt-4"
          activeKey={openTimer}
        >
          <NavAccordionItem
            expanded={expanded}
            Icon={MdTimer}
            label="TODO: Time remaining"
            eventKey="time"
            onSectionClick={(eventKey): void => {
              if (expanded) {
                if (openTimer === eventKey) {
                  setOpenTimer('');
                } else {
                  setOpenTimer(eventKey);
                }
              } else {
                setExpanded(true);
                setOpenTimer(eventKey);
              }
            }}
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
