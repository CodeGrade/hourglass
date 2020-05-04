import React from 'react';
import {
  Navbar,
  Button,
} from 'react-bootstrap';
import { getCSRFToken, logOut } from '@hourglass/helpers';
import Routes from '@hourglass/routes';
import {
  User,
} from '@hourglass/types';
import SnapshotInfo from '@hourglass/containers/SnapshotInfo';
import PaginationDropdown from '@hourglass/containers/PaginationDropdown';

interface ExamNavbarProps {
  user?: User;
  preview: boolean;
  locked: boolean;
}

export const ExamNavbar: React.FC<ExamNavbarProps> = (props) => {
  const {
    preview,
    locked,
  } = props;
  const doSnapshots = locked && !preview;
  const title = 'Hourglass' + (locked ? ' (locked)' : '');
  const bg = locked ? 'dark' : 'light';
  return (
    <Navbar
      bg={bg}
      variant={bg}
      expand="lg"
      fixed="top"
    >
      <Navbar.Brand>
        {title}
      </Navbar.Brand>
      <span className="ml-auto">
        <span className="mr-2">
          <SnapshotInfo />
        </span>
        <PaginationDropdown />
      </span>
    </Navbar>
  );
}
