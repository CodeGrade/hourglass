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
import LockdownInfo from '@hourglass/containers/LockdownInfo';

interface ExamNavbarProps {
  user?: User;
  preview: boolean;
}

export const ExamNavbar: React.FC<ExamNavbarProps> = (props) => {
  const {
    preview,
  } = props;
  const doSnapshots = !preview;
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      fixed="top"
    >
      <Navbar.Brand>
        Hourglass
      </Navbar.Brand>
      <span className="ml-2">
        <LockdownInfo />
      </span>
      <span className="ml-auto">
        <span className="mr-2">
          <SnapshotInfo />
        </span>
        <PaginationDropdown />
      </span>
    </Navbar>
  );
};
