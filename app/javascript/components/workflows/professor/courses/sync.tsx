import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponse as useCourseSync } from '@hourglass/common/api/professor/courses/sync';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';

const SyncCourse: React.FC = () => (
  <>
    <h2>Sync with Bottlenose</h2>
    <DoSync />
  </>
);

export default SyncCourse;

const DoSync: React.FC = () => {
  const { courseId } = useParams();
  const res = useCourseSync(courseId);
  switch (res.type) {
    case 'ERROR':
      return <p>Hourglass error.</p>;
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      if (res.response.synced === false) {
        return <p className="text-danger">{res.response.reason}</p>;
      }
      return <p>Synced.</p>;
    default:
      throw new ExhaustiveSwitchError(res);
  }
};
