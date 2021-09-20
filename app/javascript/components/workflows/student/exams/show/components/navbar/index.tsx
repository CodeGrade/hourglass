import React, { useState } from 'react';
import SnapshotInfo from '@student/exams/show/containers/SnapshotInfo';
import LockdownInfo from '@student/exams/show/containers/LockdownInfo';
import './index.css';
import {
  Accordion,
  Button,
  Collapse,
} from 'react-bootstrap';
import {
  MdNoteAdd,
  MdLiveHelp,
  MdMenu,
} from 'react-icons/md';
import { GiOpenBook } from 'react-icons/gi';
import JumpTo from '@student/exams/show/containers/navbar/JumpTo';
import Scratch from '@student/exams/show/containers/navbar/Scratch';
import ExamMessages from '@student/exams/show/components/navbar/ExamMessages';
import AskQuestion from '@student/exams/show/components/navbar/AskQuestion';
import RenderIcon from '@student/exams/show/components/Icon';
import { TimeInfo } from '@student/exams/show/types';
import TimeRemaining from '@student/exams/show/components/navbar/TimeRemaining';
import NavAccordionItem from '@student/exams/show/components/navbar/NavAccordionItem';
import { useFragment, graphql } from 'relay-hooks';
import Tooltip from '@student/exams/show/components/Tooltip';
// eslint-disable-next-line no-restricted-imports
import NavbarLogo from '../../../../../../../images/hourglass.svg';

import { navbar$key } from './__generated__/navbar.graphql';
import { navbar_accordion$key } from './__generated__/navbar_accordion.graphql';

interface NavAccordionProps {
  examKey: navbar_accordion$key;
  expanded: boolean;
  onSectionClick: (eventKey: string) => void;
  openSection: string;
}

const NavAccordion: React.FC<NavAccordionProps> = (props) => {
  const {
    examKey,
    expanded,
    onSectionClick,
    openSection,
  } = props;
  const res = useFragment(
    graphql`
    fragment navbar_accordion on Exam {
      ...AskQuestion
      ...ExamMessages_navbar
    }
    `,
    examKey,
  );
  const showTooltip = (expanded ? 'never' : 'onHover');
  return (
    <Accordion
      className="overflow-visible"
      activeKey={openSection}
    >
      <NavAccordionItem
        expanded={expanded}
        Icon={GiOpenBook}
        label="Jump to"
        onSectionClick={onSectionClick}
        eventKey="jump"
        tooltipMessage="Jump to"
        tooltipPlacement="right"
        showTooltip={showTooltip}
      >
        <JumpTo />
      </NavAccordionItem>
      <ExamMessages
        examKey={res}
        expanded={expanded}
        onSectionClick={onSectionClick}
      />
      <NavAccordionItem
        expanded={expanded}
        Icon={MdNoteAdd}
        label="Scratch space"
        onSectionClick={onSectionClick}
        eventKey="scratch"
        tooltipMessage="Scratch space"
        tooltipPlacement="right"
        showTooltip={showTooltip}
      >
        <Scratch />
      </NavAccordionItem>
      <NavAccordionItem
        expanded={expanded}
        Icon={MdLiveHelp}
        label="Ask a question"
        onSectionClick={onSectionClick}
        eventKey="askq"
        tooltipMessage="Ask a question"
        tooltipPlacement="right"
        showTooltip={showTooltip}
      >
        <AskQuestion examKey={res} />
      </NavAccordionItem>
    </Accordion>
  );
};

const ExamNavbar: React.FC<{
  examKey: navbar$key;
  time: TimeInfo;
}> = (props) => {
  const {
    examKey,
    time,
  } = props;
  const res = useFragment(
    graphql`
    fragment navbar on Exam {
      ...navbar_accordion
      myRegistration {
        user {
          displayName
        }
      }
    }
    `,
    examKey,
  );
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
      <div className="d-flex align-items-center mb-2">
        <Collapse
          in={expanded}
          dimension="width"
        >
          <h1 className="w-100 pb-0 mb-0">
            Hourglass
          </h1>
        </Collapse>
        <img src={NavbarLogo} alt="Hourglass" className="blue-glow d-inline-block float-right" style={{ height: 48, width: 66 }} />
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
                  {res.myRegistration.user.displayName}
                </h6>
                <span className="flex-fill" />
              </span>
            </span>
          </Collapse>
          <span className="mb-2">
            <Tooltip
              message={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              placement="right"
            >
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
                <RenderIcon I={MdMenu} />
              </Button>
            </Tooltip>
          </span>
        </div>
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
                  Status
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
      <div className="mt-4 flex-fill overflow-visible">
        <NavAccordion
          examKey={res}
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
