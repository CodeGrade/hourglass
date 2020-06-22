import React from 'react';
import { Room, useResponse as indexRooms } from '@hourglass/common/api/professor/rooms/index';
import { useParams } from 'react-router-dom';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Button, Form, FormControl, InputGroup } from 'react-bootstrap';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import { FaTrash, FaTrashRestore, FaPlus } from 'react-icons/fa';

const EditExamRooms: React.FC = () => {
  const { examId } = useParams();
  const response = indexRooms(examId);
  switch (response.type) {
    case 'ERROR':
      return <p className="text-danger">{response.status}</p>;
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return <Loaded rooms={response.response.rooms} />;
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

export default EditExamRooms;

const Loaded: React.FC<{
  rooms: Room[];
}> = (props) => {
  const {
    rooms,
  } = props;
  return (
    <>
      <h1>Edit rooms</h1>
      <ul>
        {rooms.map((r) => (
          <li key={r.id}>
            <Form.Group>
              <InputGroup>
                <FormControl
                  size="lg"
                  placeholder="Room name"
                  defaultValue={r.name}
                />
                <InputGroup.Append>
                  <Button
                    variant="danger"
                    disabled={r.students.length !== 0}
                  >
                    <Icon I={FaTrash} />
                    <span className="ml-1">
                      Delete
                    </span>
                  </Button>
                </InputGroup.Append>
                <InputGroup.Append>
                  <Button
                    variant="success"
                    disabled={r.students.length !== 0}
                  >
                    <Icon I={FaTrashRestore} />
                    <span className="ml-1">
                      Restore
                    </span>
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
          </li>
        ))}
      </ul>
      <Form.Group>
        <InputGroup>
          <FormControl
            size="lg"
            placeholder="Room name"
          />
          <InputGroup.Append>
            <Button
              variant="success"
            >
              <Icon I={FaPlus} />
              <span className="ml-1">
                Add room
              </span>
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
      <Form.Group>
        <Button
          size="lg"
          variant="success"
        >
          Submit
        </Button>
      </Form.Group>
    </>
  );
};
