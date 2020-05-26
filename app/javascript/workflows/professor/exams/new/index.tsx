import React, {useState, useRef} from 'react';
import { Bottlenose } from '@hourglass/common/types';
import { Form, Button, Card, CardDeck } from 'react-bootstrap';

interface NewExamProps {
  course: Bottlenose.Course;
}

const NewExam: React.FC<NewExamProps> = (props) => {
  const {
    course,
  } = props;
  return (
    <div>
      <h1>{`${course.name} - New Exam`}</h1>
      <NewExamForm
        course={course}
      />
    </div>
  );
};
export default NewExam;

interface NewExamFormProps {
  course: Bottlenose.Course;
}

async function readFile(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = (_e): void => {
      resolve(fr.result);
    };
    fr.readAsText(file);
  });
}

const NewExamForm: React.FC<NewExamFormProps> = (props) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState(undefined);
  return (
    <Form
      onSubmit={(e): void => {
        e.preventDefault();
        if (!file) {
          // Form validated with no file.
          return;
        }
        readFile(file).then(console.log);
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
    <Form>
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control
          required
          value={room.name}
          //onChange={(e): void => setName(e.target.value)}
          placeholder="Enter a name"
        />
      </Form.Group>
      <Button
        variant="danger"
      >
        Remove room
      </Button>
    </Form>
  );
};

/*
// import Editor from '@professor/exams/new/editor';
      <Editor />

<%= bootstrap_form_for Exam.new, url: professor_course_exams_path do |f| %>
  <%= f.submit %>
<% end %>
 */
