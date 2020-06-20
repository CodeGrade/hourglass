import React from 'react';
import {
  Accordion,
  Card,
  Collapse,
} from 'react-bootstrap';
import RenderIcon from '@student/exams/show/components/Icon';
import { IconType } from 'react-icons';

export interface NavAccordionItemProps {
  onSectionClick: (eventKey: string) => void;
  expanded: boolean;
  Icon: IconType;
  label: string;
  className?: string;
  eventKey: string;
  direction?: 'up' | 'down';
}

const spacer = <span aria-hidden="true" className="width-0">&nbsp;</span>;
const NavAccordionItem: React.FC<NavAccordionItemProps> = (props) => {
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
      {spacer}
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
NavAccordionItem.displayName = 'NavAccordionItem';

export default NavAccordionItem;
