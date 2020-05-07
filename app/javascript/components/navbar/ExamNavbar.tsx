import React from 'react';
import SnapshotInfo from '@hourglass/containers/SnapshotInfo';
import PaginationDropdown from '@hourglass/containers/PaginationDropdown';
import LockdownInfo from '@hourglass/containers/LockdownInfo';

const ExamNavbar: React.FC<{}> = () => (
  <div className="sticky-top px-2">
    <div>
      <h1 className="d-inline align-middle">Hourglass</h1>
      <span className="ml-2">
        <LockdownInfo />
      </span>
      <span className="ml-2">
        <SnapshotInfo />
      </span>
    </div>
    <PaginationDropdown />
  </div>
);

export default ExamNavbar;
