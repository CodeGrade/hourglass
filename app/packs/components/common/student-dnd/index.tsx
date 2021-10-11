import React, { useCallback, useContext, useMemo } from 'react';
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
  useHistory,
  Route,
  Switch,
} from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { TabEditButton } from '@professor/exams/admin';
import { useFragment, graphql, useMutation } from 'relay-hooks';
import { studentDnd$key } from './__generated__/studentDnd.graphql';
import { studentDndUpdateMutation } from './__generated__/studentDndUpdateMutation.graphql';

interface Section {
  id: string;
  title: string;
  students: readonly Student[];
}

interface Student {
  id: string;
  nuid: number;
  username: string;
  displayName: string;
}

interface Room {
  id: string;
  name: string;
  students: Student[];
}

interface FormContextType {
  sections: readonly Section[];
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
  <Button
    className="badge badge-primary badge-pill"
    size="sm"
    title={`${student.username} (${student.nuid})`}
  >
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
      <ul className="list-unstyled column-count-4 w-100">
        {fields.map((member, index) => {
          const student = fields.get(index);
          return (
            <li
              className="mx-1 fixed-col-width"
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
  addSectionToRoom: (section: Section, roomId: string) => void;
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
              <h3>
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
              </h3>
              <FieldArray
                name="students"
                component={Students}
                props={{ }}
              />
            </FormSection>
          </Form.Group>
        );
      })}
    </>
  );
};

interface StudentDNDFormExtraProps {
  examId: string;
}

const StudentDNDForm: React.FC<
  InjectedFormProps<FormValues, StudentDNDFormExtraProps> & StudentDNDFormExtraProps
> = (props) => {
  const {
    examId,
    handleSubmit,
    reset,
    pristine,
    change,
  } = props;
  const addSectionToRoom = (section: Section, roomId: string): void => {
    change('all', ({ unassigned, rooms } : {unassigned: Student[], rooms: Room[]}) => {
      const allRegisteredStudents = {};
      unassigned.forEach((unassignedStudent) => {
        allRegisteredStudents[unassignedStudent.id] = true;
      });
      rooms.forEach((room) => {
        room.students.forEach((student) => { allRegisteredStudents[student.id] = true; });
      });
      return {
        unassigned: unassigned.filter((unassignedStudent: Student) => (
          !section.students.find((student) => student.id === unassignedStudent.id)
        )),
        rooms: rooms.map((room: Room) => {
          const studentsAlreadyInRoomButNotInSection = room.students.filter((roomStudent) => (
            !section.students.find((student) => student.id === roomStudent.id)
          ));
          if (room.id === roomId) {
            const registeredStudentsInSection = section.students.filter(
              (student) => allRegisteredStudents[student.id],
            );
            return {
              ...room,
              students: studentsAlreadyInRoomButNotInSection.concat(registeredStudentsInSection),
            };
          }
          return {
            ...room,
            students: studentsAlreadyInRoomButNotInSection,
          };
        }),
      };
    });
  };
  const history = useHistory();
  const { alert } = useContext(AlertContext);
  const cancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const [mutate, { loading }] = useMutation<studentDndUpdateMutation>(
    graphql`
    mutation studentDndUpdateMutation($input: UpdateStudentSeatingInput!, $withRubric: Boolean!) {
      updateStudentSeating(input: $input) {
        exam {
          ...admin_checklist
        }
      }
    }
    `,
    {
      onCompleted: () => {
        history.push(`/exams/${examId}/admin/seating`);
        alert({
          variant: 'success',
          autohide: true,
          message: 'Room assignments successfully created.',
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Room assignments not created.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <form
      onSubmit={handleSubmit(({ all }) => {
        const rooms: {
          roomId: string;
          studentIds: string[];
        }[] = [];
        all.rooms.forEach((room) => {
          rooms.push({
            roomId: room.id,
            studentIds: room.students.map((s) => s.id),
          });
        });
        mutate({
          variables: {
            input: {
              examId,
              unassignedStudentIds: all.unassigned.map((s) => s.id),
              studentRoomUpdates: rooms,
            },
            withRubric: true,
          },
        });
      })}
    >
      <FormSection name="all">
        <h2>
          Edit Seating Assignments
          <span className="float-right">
            <Button
              disabled={loading}
              variant="danger"
              className={pristine && 'd-none'}
              onClick={reset}
            >
              Reset
            </Button>
            <Button
              disabled={loading}
              variant="secondary"
              className="ml-2"
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              variant="primary"
              className="ml-2"
              type="submit"
            >
              Save
            </Button>
          </span>
        </h2>
        <Form.Group>
          <h3>Unassigned Students</h3>
          <FieldArray name="unassigned" component={Students} props={{ }} />
        </Form.Group>
        <Form.Group>
          <FieldArray
            name="rooms"
            component={Rooms}
            addSectionToRoom={addSectionToRoom}
          />
        </Form.Group>
      </FormSection>
    </form>
  );
};

interface RoomAssignmentProps {
  examId: string;
  sections: readonly Section[];
  unassigned: readonly Student[];
  rooms: readonly Room[];
}

const Editable: React.FC<RoomAssignmentProps> = (props) => {
  const {
    examId,
    sections,
    unassigned,
    rooms,
  } = props;
  const contextVal = useMemo(() => ({ sections }), [sections]);
  const initialValues = useMemo(() => ({
    all: {
      unassigned,
      rooms,
    },
  }), [unassigned, rooms]);
  return (
    <Provider store={store}>
      <FormContext.Provider value={contextVal}>
        <DNDForm
          examId={examId}
          initialValues={initialValues}
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
      <h2>
        Seating Assignments
        <span className="float-right">
          <TabEditButton />
        </span>
      </h2>
      <Form.Group>
        <h3>Unassigned Students</h3>
        <div className="border px-2 flex-fill rounded">
          <ul className="list-unstyled column-count-4">
            {unassigned.length === 0 ? (
              <p>No students</p>
            ) : unassigned.map((s) => (
              <li key={s.id} className="fixed-col-width">
                <span title={`${s.username} (${s.nuid})`}>{s.displayName}</span>
              </li>
            ))}
          </ul>
        </div>
      </Form.Group>
      {rooms.map((r) => (
        <Form.Group key={r.id}>
          <h3>{r.name}</h3>
          <div className="border px-2 flex-fill rounded">
            {r.students.length === 0 ? (
              <p>No students</p>
            ) : (
              <ul className="list-unstyled column-count-4">
                {r.students.map((s) => (
                  <li key={s.id} className="fixed-col-width">
                    <span title={`${s.username} (${s.nuid})`}>{s.displayName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Form.Group>
      ))}
    </>
  );
};

interface FormValues {
  all: {
    unassigned: readonly Student[];
    rooms: readonly Room[];
  };
}

const DNDForm = reduxForm<FormValues, StudentDNDFormExtraProps>({
  form: 'student-dnd',
})(StudentDNDForm);

const AssignSeating: React.FC<{
  examKey: studentDnd$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment studentDnd on Exam {
      id
      course {
        sections {
          id
          title
          students {
            id
            nuid
            username
            displayName
          }
        }
      }
      registrationsWithoutRooms {
        user {
          id
          nuid
          username
          displayName
        }
      }
      rooms {
        id
        name
        registrations {
          user {
            id
            nuid
            username
            displayName
          }
        }
      }
    }
    `,
    examKey,
  );

  return (
    <Row>
      <Col>
        <Switch>
          <Route path="/exams/:examId/admin/seating/edit">
            <Editable
              examId={res.id}
              sections={res.course.sections}
              unassigned={res.registrationsWithoutRooms.map((reg) => reg.user)}
              rooms={res.rooms.map((r) => ({
                id: r.id,
                name: r.name,
                students: r.registrations.map((reg) => reg.user),
              }))}
            />
          </Route>
          <Route>
            <Readonly
              examId={res.id}
              sections={res.course.sections}
              unassigned={res.registrationsWithoutRooms.map((reg) => reg.user)}
              rooms={res.rooms.map((r) => ({
                id: r.id,
                name: r.name,
                students: r.registrations.map((reg) => reg.user),
              }))}
            />
          </Route>
        </Switch>
      </Col>
    </Row>
  );
};

export default AssignSeating;
