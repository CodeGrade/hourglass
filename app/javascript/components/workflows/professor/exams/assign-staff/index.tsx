import React, { useContext, useCallback, useMemo } from 'react';
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
  Switch,
  Route,
} from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { useFragment, graphql, useMutation } from 'relay-hooks';
import { TabEditButton } from '@professor/exams/admin';

import { assignStaff, assignStaff$key } from './__generated__/assignStaff.graphql';
import { assignStaffUpdateMutation } from './__generated__/assignStaffUpdateMutation.graphql';

interface FormContextType {
  sections: assignStaff['course']['sections'];
}

const FormContext = React.createContext<FormContextType>({
  sections: [],
});

type ItemTypes = DropStudent;

interface Student {
  id: string;
  nuid: number;
  username: string;
  displayName: string;
}

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
        Drop staff here!
      </p>
      <ul className="list-unstyled column-count-4">
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

type Section = assignStaff['course']['sections'][number];

interface FormRoom {
  id: string;
  name: string;
  proctors: Student[];
}

interface RoomsProps {
  addSectionToRoom: (section: Section, roomId: string) => void;
}

const Rooms: React.FC<WrappedFieldArrayProps<FormRoom> & RoomsProps> = (props) => {
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
                </span>
              </h3>
              <FieldArray
                name="proctors"
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

interface StaffSeatingFormExtraProps {
  examId: string;
}

const StaffSeatingForm: React.FC<
  InjectedFormProps<FormValues, StaffSeatingFormExtraProps> & StaffSeatingFormExtraProps
> = (props) => {
  const {
    examId,
    handleSubmit,
    reset,
    pristine,
    change,
  } = props;
  const addSectionToRoom = useCallback((section: Section, roomId: string): void => {
    change('all', ({ unassigned, rooms }) => ({
      unassigned: unassigned.filter((unassignedStudent: Student) => (
        !section.staff.find((student) => student.id === unassignedStudent.id)
      )),
      rooms: rooms.map((room: FormRoom) => {
        const filtered = room.proctors.filter((user) => (
          !section.staff.find((student) => student.id === user.id)
        ));
        if (room.id === roomId) {
          return {
            ...room,
            proctors: filtered.concat(section.staff),
          };
        }
        return {
          ...room,
          proctors: filtered,
        };
      }),
    }));
  }, [change]);
  const history = useHistory();
  const { alert } = useContext(AlertContext);
  const cancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const [mutate, { loading }] = useMutation<assignStaffUpdateMutation>(
    graphql`
    mutation assignStaffUpdateMutation($input: UpdateStaffSeatingInput!, $withRubric: Boolean!) {
      updateStaffSeating(input: $input) {
        exam {
          ...admin_checklist
        }
      }
    }
    `,
    {
      onCompleted: () => {
        history.push(`/exams/${examId}/admin/staff`);
        alert({
          autohide: true,
          variant: 'success',
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
          proctorIds: string[];
        }[] = [];
        all.rooms.forEach((room) => {
          rooms.push({
            roomId: room.id,
            proctorIds: room.proctors.map((u) => u.id),
          });
        });
        mutate({
          variables: {
            input: {
              examId,
              unassignedProctorIds: (all.unassigned ?? []).map((s) => s.id),
              proctorsWithoutRoomIds: (all.proctors ?? []).map((s) => s.id),
              proctorRegistrationUpdates: rooms,
            },
            withRubric: true,
          },
        });
      })}
    >
      <FormSection name="all">
        <h2>
          Edit Staff Registrations
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
          <h3>Unassigned Staff</h3>
          <FieldArray name="unassigned" component={Students} props={{ }} />
        </Form.Group>
        <Form.Group>
          <h3>Proctors Without Rooms</h3>
          <FieldArray name="proctors" component={Students} props={{ }} />
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

interface FormValues {
  all: {
    unassigned: readonly Student[];
    proctors: readonly Student[];
    rooms: FormRoom[];
  };
}

const DNDForm = reduxForm<FormValues, StaffSeatingFormExtraProps>({
  form: 'staff-dnd',
})(StaffSeatingForm);

interface StaffAssignmentProps {
  examId: string;
  sections: assignStaff['course']['sections'];
  unassigned: assignStaff['unassignedStaff'];
  proctors: assignStaff['proctorRegistrationsWithoutRooms'];
  rooms: assignStaff['rooms'];
}

const Editable: React.FC<StaffAssignmentProps> = (props) => {
  const {
    examId,
    sections,
    unassigned,
    proctors,
    rooms,
  } = props;
  const contextVal = useMemo(() => ({ sections }), [sections]);
  const initialValues = useMemo(() => ({
    all: {
      unassigned,
      proctors: proctors.map((p) => p.user),
      rooms: rooms.map((r) => ({
        id: r.id,
        name: r.name,
        proctors: r.proctorRegistrations.map((p) => p.user),
      })),
    },
  }), [unassigned, proctors, rooms]);
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

const Readonly: React.FC<StaffAssignmentProps> = (props) => {
  const {
    unassigned,
    proctors,
    rooms,
  } = props;
  return (
    <>
      <h2>
        Staff Registrations
        <span className="float-right">
          <TabEditButton />
        </span>
      </h2>
      <Form.Group>
        <h3>Unassigned Staff</h3>
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
      <Form.Group>
        <h3>Proctors Without Rooms</h3>
        <div className="border px-2 flex-fill rounded">
          {proctors.length === 0 ? (
            <p>No proctors</p>
          ) : (
            <ul className="list-unstyled column-count-4">
              {proctors.map((s) => (
                <li key={s.user.id} className="fixed-col-width">
                  <span title={`${s.user.username} (${s.user.nuid})`}>{s.user.displayName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Form.Group>
      {rooms.map((r) => (
        <Form.Group key={r.id}>
          <h3>{r.name}</h3>
          <div className="border px-2 flex-fill rounded">
            {r.proctorRegistrations.length === 0 ? (
              <p>No proctors</p>
            ) : (
              <ul className="list-unstyled column-count-4">
                {r.proctorRegistrations.map((p) => (
                  <li key={p.user.id} className="fixed-col-width">
                    <span title={`${p.user.username} (${p.user.nuid})`}>{p.user.displayName}</span>
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

const DND: React.FC<{
  examKey: assignStaff$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment assignStaff on Exam {
      id
      unassignedStaff {
        id
        nuid
        username
        displayName
      }
      rooms {
        id
        name
        proctorRegistrations {
          id
          user {
            id
            nuid
            username
            displayName
          }
        }
      }
      course {
        sections {
          id
          title
          staff {
            id
            nuid
            username
            displayName
          }
        }
      }
      proctorRegistrationsWithoutRooms {
        user {
          id
          nuid
          username
          displayName
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
          <Route path="/exams/:examId/admin/staff/edit">
            <Editable
              examId={res.id}
              sections={res.course.sections}
              unassigned={res.unassignedStaff}
              proctors={res.proctorRegistrationsWithoutRooms}
              rooms={res.rooms}
            />
          </Route>
          <Route>
            <Readonly
              examId={res.id}
              sections={res.course.sections}
              unassigned={res.unassignedStaff}
              proctors={res.proctorRegistrationsWithoutRooms}
              rooms={res.rooms}
            />
          </Route>
        </Switch>
      </Col>
    </Row>
  );
  // switch (response.type) {
  //   case 'ERROR':
  //     return <p className="text-danger">{`${response.text} (${response.status})`}</p>;
  //   case 'LOADING':
  //   case 'RESULT':
  //     return (
  //       <Loading loading={response.type === 'LOADING'}>
  //         <Loaded
  //           sections={response.type === 'LOADING' ? [] : response.response.sections}
  //           unassigned={response.type === 'LOADING' ? [] : response.response.unassigned}
  //           proctors={response.type === 'LOADING' ? [] : response.response.proctors}
  //           rooms={response.type === 'LOADING' ? [] : response.response.rooms}
  //         />
  //       </Loading>
  //     );
  //   default:
  //     throw new ExhaustiveSwitchError(response);
  // }
};

export default DND;
