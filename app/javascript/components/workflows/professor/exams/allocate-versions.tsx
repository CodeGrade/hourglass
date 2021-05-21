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

import { TabEditButton } from './admin';
import { allocateVersions$key, allocateVersions } from './__generated__/allocateVersions.graphql';
import { allocateVersionsMutation } from './__generated__/allocateVersionsMutation.graphql';

type Section = allocateVersions['course']['sections'][number];
type Student = allocateVersions['unassignedStudents'][number];
type Version = allocateVersions['examVersions']['edges'][number]['node'];

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

interface VersionsProps {
  addSectionToVersion: (section: Section, roomId: string) => void;
}

const Versions: React.FC<WrappedFieldArrayProps<Version> & VersionsProps> = (props) => {
  const {
    fields,
    addSectionToVersion,
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
                    id={`version-dnd-add-section-${room.id}`}
                    size="sm"
                    className="mb-2"
                  >
                    {sections.map((s) => (
                      <Dropdown.Item
                        key={s.id}
                        onClick={(): void => {
                          addSectionToVersion(s, room.id);
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
  const addSectionToVersion = (section: Section, versionId: string): void => {
    change('all', ({ unassigned, versions }) => ({
      unassigned: unassigned.filter((unassignedStudent: Student) => (
        !section.students.find((student) => student.id === unassignedStudent.id)
      )),
      versions: versions.map((version: Version) => {
        const filtered = version.students.filter((versionStudent) => (
          !section.students.find((student) => student.id === versionStudent.id)
        ));
        if (version.id === versionId) {
          return {
            ...version,
            students: filtered.concat(section.students),
          };
        }
        return {
          ...version,
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
  const [mutate, { loading }] = useMutation<allocateVersionsMutation>(
    graphql`
    mutation allocateVersionsMutation($input: UpdateVersionRegistrationsInput!, $withRubric: Boolean!) {
      updateVersionRegistrations(input: $input) {
        exam {
          ...admin_checklist
        }
      }
    }
    `,
    {
      onCompleted: () => {
        history.push(`/exams/${examId}/admin/versions`);
        alert({
          variant: 'success',
          autohide: true,
          message: 'Versions successfully allocated.',
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Allocations not created.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <form
      onSubmit={handleSubmit(({ all }) => {
        const versions = [];
        all.versions.forEach((version) => {
          versions.push({
            versionId: version.id,
            studentIds: version.students.map((s) => s.id),
          });
        });
        mutate({
          variables: {
            input: {
              examId,
              unassigned: all.unassigned.map((s) => s.id),
              versions,
            },
            withRubric: true,
          },
        });
      })}
    >
      <FormSection name="all">
        <h2>
          Edit Version Allocations
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
            name="versions"
            component={Versions}
            addSectionToVersion={addSectionToVersion}
          />
        </Form.Group>
      </FormSection>
    </form>
  );
};

interface VersionAssignmentProps {
  examId: string;
  sections: readonly Section[];
  unassigned: readonly Student[];
  versions: readonly Version[];
}

const Editable: React.FC<VersionAssignmentProps> = (props) => {
  const {
    examId,
    sections,
    unassigned,
    versions,
  } = props;
  const contextVal = useMemo(() => ({
    sections,
  }), [sections]);
  const initialValues = useMemo(() => ({
    all: {
      unassigned,
      versions,
    },
  }), [unassigned, versions]);
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

const Readonly: React.FC<VersionAssignmentProps> = (props) => {
  const {
    unassigned,
    versions,
  } = props;
  return (
    <>
      <h2>
        Version Allocations
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
      {versions.map((v) => (
        <Form.Group key={v.id}>
          <h3>{v.name}</h3>
          <div className="border px-2 flex-fill rounded">
            {v.students.length === 0 ? (
              <p>No students</p>
            ) : (
              <ul className="list-unstyled column-count-4">
                {v.students.map((s) => (
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

const Loaded: React.FC<VersionAssignmentProps> = (props) => {
  const {
    examId,
    sections,
    unassigned,
    versions,
  } = props;
  return (
    <Row>
      <Col>
        <Switch>
          <Route path="/exams/:examId/admin/versions/edit">
            <Editable
              examId={examId}
              sections={sections}
              unassigned={unassigned}
              versions={versions}
            />
          </Route>
          <Route>
            <Readonly
              examId={examId}
              unassigned={unassigned}
              versions={versions}
              sections={sections}
            />
          </Route>
        </Switch>
      </Col>
    </Row>
  );
};

interface FormValues {
  all: {
    unassigned: readonly Student[];
    versions: readonly Version[];
  };
}

const DNDForm = reduxForm<FormValues, { examId: string }>({
  form: 'version-dnd',
})(StudentDNDForm);

const DND: React.FC<{
  examKey: allocateVersions$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment allocateVersions on Exam {
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
      unassignedStudents {
        id
        nuid
        username
        displayName
      }
      examVersions(first: 100) @connection(key: "Exam_examVersions", filters: []) {
        edges {
          node {
            id
            name
            students {
              id
              nuid
              username
              displayName
            }
          }
        }
      }
    }
    `,
    examKey,
  );
  return (
    <Loaded
      examId={res.id}
      sections={res.course.sections}
      unassigned={res.unassignedStudents}
      versions={res.examVersions.edges.map((e) => e.node)}
    />
  );
};

export default DND;
