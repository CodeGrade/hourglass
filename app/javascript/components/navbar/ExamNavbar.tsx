import React from 'react';
import {
  Navbar,
} from 'react-bootstrap';
import SnapshotInfo from '@hourglass/containers/SnapshotInfo';
import PaginationDropdown from '@hourglass/containers/PaginationDropdown';
import LockdownInfo from '@hourglass/containers/LockdownInfo';

const ExamNavbar: React.FC<{}> = () => (
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

export default ExamNavbar;
