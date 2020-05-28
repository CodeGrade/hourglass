import React, { useState } from 'react';
import {
  Form,
  Button,
  Card,
  CardDeck,
} from 'react-bootstrap';
import { Course, useResponse as showCourse } from '@hourglass/common/api/professor/courses/show';
import { useParams, useHistory } from 'react-router-dom';
import { getCSRFToken } from '@hourglass/workflows/student/exams/show/helpers';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';

interface NewExamProps {
  courseId: number;
}

const NewExam: React.FC<NewExamProps> = (props) => {
  const {
    courseId,
  } = props;
  const res = showCourse(courseId);
  switch (res.type) {
    case 'ERROR':
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <div>
          <h2>New Exam</h2>
          <NewExamForm
            course={res.response.course}
          />
        </div>
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};
export default NewExam;

interface NewExamFormProps {
  course: Course;
}

const NewExamForm: React.FC<NewExamFormProps> = () => {
  const [name, setName] = useState('');
  const [file, setFile] = useState(undefined);
  const { courseId } = useParams();
  const history = useHistory();
  return (
    <Form
      onSubmit={(e): void => {
        e.preventDefault();
        if (!file) {
          // Form validated with no file.
          return;
        }
        const data = new FormData();
        data.append('file', file);
        data.append('name', name);
        fetch(`/api/professor/courses/${courseId}/exams`, {
          method: 'POST',
          headers: {
            // 'Content-Type': 'multipart/form-data',
            'X-CSRF-Token': getCSRFToken(),
          },
          credentials: 'same-origin',
          body: data,
        })
          .then((res) => {
            if (res.status !== 201) {
              throw new Error('Not created');
            }
            return res;
          })
          .then((res) => res.json() as Promise<{ id: number }>)
          .then(({ id }) => history.push(`/exams/${id}/admin`));
      }}
    >
      <Form.Group>
        <Form.Label>Exam Name</Form.Label>
        <Form.Control
          required
          value={name}
          onChange={(e): void => setName(e.target.value)}
          placeholder="Enter a name"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Exam upload (editor WIP)</Form.Label>
        <Form.File
          required
          onChange={(e): void => {
            const { files } = e.target;
            const upload = files[0];
            if (upload) setFile(upload);
          }}
          label={file?.name ?? 'Choose a file'}
          accept="application/zip,.yaml,.yml"
          custom
        />
      </Form.Group>
      <AssocRooms />
      <Button
        variant="success"
        type="submit"
      >
        Submit
      </Button>
    </Form>
  );
};

const AssocRooms: React.FC<{}> = () => {
  const [rooms, setRooms] = useState([{
    name: '',
  }]);
  const addRoom = (): void => setRooms((old) => [...old, {
    name: '',
  }]);
  return (
    <div>
      <h2>Rooms</h2>
      <Form.Group>
        <Button
          variant="primary"
          onClick={(): void => {
            addRoom();
          }}
        >
          Add exam room
        </Button>
      </Form.Group>
      <Form.Group>
        <CardDeck>
          {rooms.map((room, index) => (
            <Card
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            >
              <Card.Body>
                <NewRoom room={room} />
              </Card.Body>
            </Card>
          ))}
        </CardDeck>
      </Form.Group>
    </div>
  );
};

interface Room {
  name: string;
}

interface NewRoomProps {
  room: Room;
}

const NewRoom: React.FC<NewRoomProps> = (props) => {
  const {
    room,
  } = props;
  return (
    <>
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control
          required
          // value={room.name}
          // onChange={(e): void => setName(e.target.value)}
          placeholder="Enter a name"
        />
      </Form.Group>
      <Button
        variant="danger"
      >
        Remove room
      </Button>
    </>
  );
};

/*
// import Editor from '@professor/exams/new/editor';
      <Editor />

<%= bootstrap_form_for Exam.new, url: professor_course_exams_path do |f| %>
  <%= f.submit %>
<% end %>
 */
