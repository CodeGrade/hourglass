import React from 'react';
import { useResponse as indexRooms } from '@hourglass/common/api/professor/rooms/index';
import { useParams } from 'react-router-dom';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';

const EditExamRooms: React.FC = () => {
  const { examId } = useParams();
  const response = indexRooms(examId);
  switch (response.type) {
    case 'ERROR':
      return <p className="text-danger">{response.status}</p>;
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <>
          <p><h1>TODO: Edit/Add rooms</h1></p>
          {JSON.stringify(response.response)}
        </>
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

export default EditExamRooms;
