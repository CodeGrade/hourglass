import React, { useContext, useState, useCallback } from 'react';
import SnapshotInfo from '@student/exams/show/containers/SnapshotInfo';
import LockdownInfo from '@student/exams/show/containers/LockdownInfo';
import { RailsContext } from '@student/exams/show/context';
import './index.css';
import {
  Accordion,
  Button,
  Collapse,
} from 'react-bootstrap';
import {
  MdNoteAdd,
  MdLiveHelp,
} from 'react-icons/md';
import { GiOpenBook } from 'react-icons/gi';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import JumpTo from '@student/exams/show/containers/navbar/JumpTo';
import Scratch from '@student/exams/show/containers/navbar/Scratch';
import ExamMessages from '@student/exams/show/containers/navbar/ExamMessages';
import AskQuestion from '@student/exams/show/containers/navbar/AskQuestion';
import RenderIcon from '@student/exams/show/components/Icon';
import { TimeInfo } from '@student/exams/show/types';
import TimeRemaining from '@student/exams/show/components/navbar/TimeRemaining';
import NavAccordionItem from '@student/exams/show/components/navbar/NavAccordionItem';

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

const ExamNavbar: React.FC<{
  time: TimeInfo;
}> = (props) => {
  const {
    time,
  } = props;
  const { railsUser } = useContext(RailsContext);
  const [expanded, setExpanded] = useState(false);
  const [openSection, setOpenSection] = useState('');
  const [openTimer, setOpenTimer] = useState('');
  const additionalClass = expanded ? 'sidebar-expanded' : 'sidebar-small';
  const onSectionClick = useCallback((eventKey): void => {
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
  }, [expanded, openSection]);
  const onExpandClick = useCallback((): void => {
    if (expanded) {
      setOpenSection('');
      setOpenTimer('');
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  }, [expanded]);
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
          onClick={onExpandClick}
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
          onSectionClick={onSectionClick}
          openSection={openSection}
          expanded={expanded}
        />
      </div>
      <div className="mb-2 mt-auto">
        <TimeRemaining
          time={time}
          openTimer={openTimer}
          setOpenTimer={setOpenTimer}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      </div>
    </div>
  );
};

export default ExamNavbar;
