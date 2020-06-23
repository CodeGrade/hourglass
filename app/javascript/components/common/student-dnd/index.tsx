import React, { useCallback, useContext } from 'react';
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
import { updateAll } from '@hourglass/common/api/professor/rooms/updateAll';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { useHistory, useParams, Route, Switch } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { useTabRefresher, TabEditButton } from '@hourglass/workflows/professor/exams/admin';

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
      className={`${bg} border rounded px-2 flex-fill`}
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
      <ul className="list-unstyled column-count-4">
        {fields.map((member, index) => {
          const student = fields.get(index);
          return (
            <li
              className="mx-1"
              key={`${member}-${student.id}`}
            >
              <DraggableStudent
                student={student}
                onRemove={(): void => fields.remove(index)}
              />
            </li>
          );
        })}
      </ul>
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
    <>
      {fields.map((member, index) => {
        const room = fields.get(index);
        return (
          <Form.Group key={room.id}>
            <FormSection name={member}>
              <h2>
                {room.name}
                <span className="float-right">
                  <DropdownButton
                    title="Add entire section"
                    id={`student-dnd-add-section-${room.id}`}
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
                </span>
              </h2>
              <FieldArray
                name="students"
                component={Students}
              />
            </FormSection>
          </Form.Group>
        );
      })}
    </>
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
  const cancel = useCallback(() => {
    history.goBack();
  }, [history]);
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
          if (result.created === false) throw new Error(result.reason);
          history.push(`/exams/${examId}/admin/seating`);
          alert({
            variant: 'success',
            message: 'Room assignments successfully created.',
          });
        }).catch((e) => {
          alert({
            variant: 'danger',
            title: 'Room assignments not created.',
            message: e.message,
          });
        });
      })}
    >
      <FormSection name="all">
        <h1>
          Edit Seating Assignments
          <span className="float-right">
            <Button
              variant="danger"
              className={pristine && 'd-none'}
              onClick={reset}
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              className="ml-2"
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="ml-2"
              type="submit"
            >
              Save
            </Button>
          </span>
        </h1>
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
      </FormSection>
    </form>
  );
};

interface RoomAssignmentProps {
  sections: Section[];
  unassigned: Student[];
  rooms: Room[];
}

const Editable: React.FC<RoomAssignmentProps> = (props) => {
  const {
    sections,
    unassigned,
    rooms,
  } = props;
  return (
    <Provider store={store}>
      <FormContext.Provider value={{ sections }}>
        <DNDForm
          initialValues={{
            all: {
              unassigned,
              rooms,
          },
          }}
        />
      </FormContext.Provider>
    </Provider>
  );
};

const Readonly: React.FC<RoomAssignmentProps> = (props) => {
  const {
    unassigned,
    rooms,
  } = props;
  return (
    <>
      <h1>
        Seating Assignments
        <span className="float-right">
          <TabEditButton />
        </span>
      </h1>
      <Form.Group>
        <h2>Unassigned Students</h2>
        <ul className="list-unstyled column-count-4">
          {unassigned.map((s) => (
            <li key={s.id}>
              {s.displayName}
            </li>
          ))}
        </ul>
      </Form.Group>
      {rooms.map((r) => (
        <Form.Group key={r.id}>
          <h2>{r.name}</h2>
          {r.students.length === 0 && <p>No students.</p>}
          <ul className="list-unstyled column-count-4">
            {r.students.map((s) => (
              <li key={s.id}>
                {s.displayName}
              </li>
            ))}
          </ul>
        </Form.Group>
      ))}
    </>
  );
};

const Loaded: React.FC<RoomAssignmentProps> = (props) => {
  const {
    sections,
    unassigned,
    rooms,
  } = props;
  return (
    <Row>
      <Col>
        <Switch>
          <Route path="/exams/:examId/admin/seating/edit">
            <Editable
              sections={sections}
              unassigned={unassigned}
              rooms={rooms}
            />
          </Route>
          <Route>
            <Readonly
              sections={sections}
              unassigned={unassigned}
              rooms={rooms}
            />
          </Route>
        </Switch>
      </Col>
    </Row>
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

const AssignSeating: React.FC = () => {
  const { examId } = useParams();
  const [refresher] = useTabRefresher('seating');
  const response = useRoomsIndex(examId, [refresher]);
  switch (response.type) {
    case 'ERROR':
      return <p className="text-danger">{response.text}</p>;
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <Loaded
          sections={response.response.sections}
          unassigned={response.response.unassigned}
          rooms={response.response.rooms}
        />
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

export default AssignSeating;
