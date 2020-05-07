import React from 'react';
import SnapshotInfo from '@hourglass/containers/SnapshotInfo';
import PaginationDropdown from '@hourglass/containers/PaginationDropdown';
import LockdownInfo from '@hourglass/containers/LockdownInfo';

const ExamNavbar: React.FC<{}> = () => (
  <div className="position-fixed">
    <div>
      <h1>Hourglass</h1>
      <LockdownInfo />
      <SnapshotInfo />
    </div>
    <PaginationDropdown />
  </div>
);

export default ExamNavbar;
