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
  useResponse as useStaffRegs,
  Student,
  Room,
  Section,
} from '@hourglass/common/api/professor/rooms/staffRegs';
import { updateAll } from '@hourglass/common/api/professor/rooms/updateAllStaff';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { useHistory, useParams, Switch, Route } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { useTabRefresher, TabEditButton } from '../admin';
import LinkButton from '@hourglass/common/linkbutton';
import { BsPencilSquare } from 'react-icons/bs';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';

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
        Drop staff here!
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
                id={`staff-dnd-add-section-${room.id}`}
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
                name="proctors"
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
        const filtered = room.proctors.filter((roomStudent) => (
          !section.students.find((student) => student.id === roomStudent.id)
        ));
        if (room.id === roomId) {
          return {
            ...room,
            proctors: filtered.concat(section.students),
          };
        }
        return {
          ...room,
          proctors: filtered,
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
          rooms[room.id] = room.proctors.map((s) => s.id);
        });
        const body = {
          unassigned: all.unassigned.map((s) => s.id),
          proctors: all.proctors.map((s) => s.id),
          rooms,
        };
        updateAll(examId, body).then((result) => {
          if (result.created === false) throw new Error(result.reason);
          history.push(`/exams/${examId}/admin/staff`);
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
        <Form.Group>
          <h2>Unassigned Staff</h2>
          <FieldArray name="unassigned" component={Students} />
        </Form.Group>
        <Form.Group>
          <h2>Proctors Without Rooms</h2>
          <FieldArray name="proctors" component={Students} />
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
    proctors: Student[];
    rooms: Room[];
  };
}

const DNDForm = reduxForm({
  form: 'staff-dnd',
})(StudentDNDForm);

interface StaffAssignmentProps {
  sections: Section[];
  unassigned: Student[];
  proctors: Student[];
  rooms: Room[];
}

const Editable: React.FC<StaffAssignmentProps> = (props) => {
  const {
    sections,
    unassigned,
    proctors,
    rooms,
  } = props;
  return (
    <Provider store={store}>
      <FormContext.Provider value={{ sections }}>
        <DNDForm
          initialValues={{
            all: {
              unassigned,
              proctors,
              rooms,
            },
          }}
        />
      </FormContext.Provider>
    </Provider>
  );
};

const Readonly: React.FC<StaffAssignmentProps> = (props) => {
  const {
    sections,
    unassigned,
    proctors,
    rooms,
  } = props;
  return (
    <>
      <h1>
        Staff Registration
        <TabEditButton />
      </h1>
      <Form.Group>
        <h2>Unassigned Staff</h2>
        <ul>
          {unassigned.map((s) => (
            <li key={s.id}>
              {s.displayName}
            </li>
          ))}
        </ul>
      </Form.Group>
      <Form.Group>
        <h2>Proctors Without Rooms</h2>
        <ul>
          {proctors.map((s) => (
            <li key={s.id}>
              {s.displayName}
            </li>
          ))}
        </ul>
      </Form.Group>
      <Form.Group>
        <Row>
          {rooms.map((r) => (
            <Col key={r.id}>
              <h2>{r.name}</h2>
              <ul>
                {r.proctors.map((p) => (
                  <li key={p.id}>
                    {p.displayName}
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>
      </Form.Group>
    </>
  );
};

const Loaded: React.FC<StaffAssignmentProps> = (props) => {
  const {
    sections,
    unassigned,
    proctors,
    rooms,
  } = props;
  return (
    <Row>
      <Col>
        <Switch>
          <Route path="/exams/:examId/admin/staff/edit">
            <Editable
              sections={sections}
              unassigned={unassigned}
              proctors={proctors}
              rooms={rooms}
            />
          </Route>
          <Route>
            <Readonly
              sections={sections}
              unassigned={unassigned}
              proctors={proctors}
              rooms={rooms}
            />
          </Route>
        </Switch>
      </Col>
    </Row>
  );
};

const DND: React.FC = () => {
  const { examId } = useParams();
  const [refresher] = useTabRefresher('staff');
  const response = useStaffRegs(examId, [refresher]);
  switch (response.type) {
    case 'ERROR':
      return <p className="text-danger">{`${response.text} (${response.status})`}</p>;
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <Loaded
          sections={response.response.sections}
          unassigned={response.response.unassigned}
          proctors={response.response.proctors}
          rooms={response.response.rooms}
        />
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

export default DND;
