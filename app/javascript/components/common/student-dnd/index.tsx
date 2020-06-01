import React, { useContext } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  Col,
  Row,
  Button,
  Form,
  DropdownButton,
  Dropdown,
} from 'react-bootstrap';
import {
  FieldArray,
  reduxForm,
  InjectedFormProps,
  WrappedFieldArrayProps,
  FormSection,
} from 'redux-form';
import store from '@hourglass/common/student-dnd/store';
import { Provider } from 'react-redux';
import {
  useResponse as useRoomsIndex,
  Student,
  Room,
  Section,
} from '@hourglass/common/api/professor/rooms';
import { updateAll } from '../api/professor/rooms/updateAll';
import { ExhaustiveSwitchError } from '../helpers';
import { useHistory, useParams } from 'react-router-dom';
import { AlertContext } from '../alerts';

interface FormContextType {
  sections: Section[];
}

const FormContext = React.createContext<FormContextType>({
  sections: [],
});

type ItemTypes = DropStudent;

interface DropStudent {
  type: 'STUDENT';
  student: Student;
}

const DropTarget: React.FC<{
  onAdd: (student: Student) => void;
}> = (props) => {
  const {
    children,
    onAdd,
  } = props;
  const [{ isOver }, drop] = useDrop<ItemTypes, void, { isOver: boolean }>({
    accept: ['STUDENT', 'SECTION'],
    drop: (dropped) => {
      if (dropped.type === 'STUDENT') onAdd(dropped.student);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  const bg = isOver ? 'bg-secondary border-secondary text-white' : 'border-secondary';
  return (
    <div
      ref={drop}
      className={`${bg} border rounded px-2 text-center flex-fill`}
    >
      {children}
    </div>
  );
};

const DraggableStudent: React.FC<{
  onRemove: () => void;
  student: Student;
}> = (props) => {
  const {
    onRemove,
    student,
  } = props;
  const [{ isDragging }, drag] = useDrag<DropStudent, DropStudent, { isDragging: boolean }>({
    item: {
      type: 'STUDENT',
      student,
    },
    end: (_item, monitor) => {
      if (monitor.didDrop()) onRemove();
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  // Need to unmount while dragging to prevent duplicate keys.
  if (isDragging) return null;
  return (
    <span ref={drag}>
      <StudentBadge student={student} />
    </span>
  );
};

const StudentBadge: React.FC<{
  student: Student;
}> = ({ student }) => (
  <Button className="badge badge-primary badge-pill" size="sm">
    {student.displayName}
  </Button>
);

const Students: React.FC<WrappedFieldArrayProps<Student>> = (props) => {
  const {
    fields,
  } = props;
  return (
    <DropTarget
      onAdd={(student): void => fields.push(student)}
    >
      <p
        className={fields.length === 0 ? 'm-0' : 'd-none'}
      >
        Drop students here!
      </p>
      <div className="d-flex mx-n1 justify-content-around rounded mb-2 flex-wrap">
        {fields.map((member, index) => {
          const student = fields.get(index);
          return (
            <span
              className="mx-1"
              key={`${member}-${student.id}`}
            >
              <DraggableStudent
                student={student}
                onRemove={(): void => fields.remove(index)}
              />
            </span>
          );
        })}
      </div>
    </DropTarget>
  );
};

interface RoomsProps {
  addSectionToRoom: (section: Section, roomId: number) => void;
}

const Rooms: React.FC<WrappedFieldArrayProps<Room> & RoomsProps> = (props) => {
  const {
    fields,
    addSectionToRoom,
  } = props;
  const { sections } = useContext(FormContext);
  return (
    <Row>
      {fields.map((member, index) => {
        const room = fields.get(index);
        return (
          <Col key={room.id}>
            <FormSection name={member}>
              <h2>{room.name}</h2>
              <DropdownButton
                title="Add entire section"
                id={`add-section-${room.id}`}
                size="sm"
                className="mb-2"
              >
                {sections.map((s) => (
                  <Dropdown.Item
                    key={s.id}
                    onClick={(): void => {
                      addSectionToRoom(s, room.id);
                    }}
                  >
                    {s.title}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
              <FieldArray
                name="students"
                component={Students}
              />
            </FormSection>
          </Col>
        );
      })}
    </Row>
  );
};

const StudentDNDForm: React.FC<InjectedFormProps<FormValues>> = (props) => {
  const {
    handleSubmit,
    reset,
    pristine,
    change,
  } = props;
  const { examId } = useParams();
  const addSectionToRoom = (section: Section, roomId: number): void => {
    change('all', ({ unassigned, rooms }) => ({
      unassigned: unassigned.filter((unassignedStudent: Student) => (
        !section.students.find((student) => student.id === unassignedStudent.id)
      )),
      rooms: rooms.map((room: Room) => {
        const filtered = room.students.filter((roomStudent) => (
          !section.students.find((student) => student.id === roomStudent.id)
        ));
        if (room.id === roomId) {
          return {
            ...room,
            students: filtered.concat(section.students),
          };
        }
        return {
          ...room,
          students: filtered,
        };
      }),
    }));
  };
  const history = useHistory();
  const { alert } = useContext(AlertContext);
  return (
    <form
      onSubmit={handleSubmit(({ all }) => {
        const rooms = {};
        all.rooms.forEach((room) => {
          rooms[room.id] = room.students.map((s) => s.id);
        });
        const body = {
          unassigned: all.unassigned.map((s) => s.id),
          rooms,
        };
        updateAll(examId, body).then((result) => {
          if (!result.created) throw new Error('Server error.');
          alert({
            variant: 'success',
            message: 'Registrations successfully created.',
          });
          history.push(`/exams/${examId}/admin`);
        }).catch((e) => {
          alert({
            variant: 'danger',
            title: 'Registrations not created.',
            message: e.message,
          });
          history.push(`/exams/${examId}/admin`);
        });
      })}
    >
      <FormSection name="all">
        <Form.Group>
          <h2>Unassigned Students</h2>
          <FieldArray name="unassigned" component={Students} />
        </Form.Group>
        <Form.Group>
          <FieldArray
            name="rooms"
            component={Rooms}
            props={{
              addSectionToRoom,
            }}
          />
        </Form.Group>
        <Form.Group>
          <Button
            variant="danger"
            className={pristine && 'd-none'}
            onClick={reset}
          >
            Reset
          </Button>
        </Form.Group>
        <Form.Group>
          <Button
            variant="success"
            type="submit"
          >
            Submit
          </Button>
        </Form.Group>
      </FormSection>
    </form>
  );
};

interface FormValues {
  all: {
    unassigned: Student[];
    rooms: Room[];
  };
}

const DNDForm = reduxForm({
  form: 'student-dnd',
})(StudentDNDForm);

const DND: React.FC<{}> = () => {
  const { examId } = useParams();
  const response = useRoomsIndex(examId);
  switch (response.type) {
    case 'ERROR':
      return <p className="text-danger">{response.text}</p>;
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <Provider store={store}>
          <FormContext.Provider
            value={{
              sections: response.response.sections,
            }}
          >
            <DNDForm
              initialValues={{
                all: {
                  unassigned: response.response.unassigned,
                  rooms: response.response.rooms,
                },
              }}
            />
          </FormContext.Provider>
        </Provider>
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

export default DND;
