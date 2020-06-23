import React, { useContext, useCallback } from 'react';
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
  useResponse as useVersionsIndex,
  Version,
  Section,
  Student,
} from '@hourglass/common/api/professor/exams/versions';
import { updateAll } from '@hourglass/common/api/professor/exams/versions/updateAll';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  useHistory,
  useParams,
  Switch,
  Route,
} from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { useTabRefresher, TabEditButton } from './admin';
import './list-columns.scss';

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
  addSectionToVersion: (section: Section, roomId: number) => void;
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
  const addSectionToVersion = (section: Section, versionId: number): void => {
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
  return (
    <form
      onSubmit={handleSubmit(({ all }) => {
        const versions = {};
        all.versions.forEach((version) => {
          versions[version.id] = version.students.map((s) => s.id);
        });
        const body = {
          unassigned: all.unassigned.map((s) => s.id),
          versions,
        };
        updateAll(examId, body).then((result) => {
          if (result.created === false) throw new Error(result.reason);
          history.push(`/exams/${examId}/admin/versions`);
          alert({
            variant: 'success',
            message: 'Versions successfully allocated.',
          });
        }).catch((e) => {
          alert({
            variant: 'danger',
            title: 'Allocations not created.',
            message: e.message,
          });
        });
      })}
    >
      <FormSection name="all">
        <h2>
          Edit Version Allocations
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
        </h2>
        <Form.Group>
          <h3>Unassigned Students</h3>
          <FieldArray name="unassigned" component={Students} />
        </Form.Group>
        <Form.Group>
          <FieldArray
            name="versions"
            component={Versions}
            props={{
              addSectionToVersion,
            }}
          />
        </Form.Group>
      </FormSection>
    </form>
  );
};

interface VersionAssignmentProps {
  sections: Section[];
  unassigned: Student[];
  versions: Version[];
}

const Editable: React.FC<VersionAssignmentProps> = (props) => {
  const {
    sections,
    unassigned,
    versions,
  } = props;
  return (
    <Provider store={store}>
      <FormContext.Provider value={{ sections }}>
        <DNDForm
          initialValues={{
            all: {
              unassigned,
              versions,
            },
          }}
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
            {unassigned.map((s) => (
              <li key={s.id} className="fixed-col-width">
                <span>{s.displayName}</span>
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
                    <span>{s.displayName}</span>
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
              sections={sections}
              unassigned={unassigned}
              versions={versions}
            />
          </Route>
          <Route>
            <Readonly
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
    unassigned: Student[];
    versions: Version[];
  };
}

const DNDForm = reduxForm({
  form: 'version-dnd',
})(StudentDNDForm);

const DND: React.FC = () => {
  const { examId } = useParams();
  const [refresher] = useTabRefresher('versions');
  const response = useVersionsIndex(examId, [refresher]);
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
          versions={response.response.versions}
        />
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

export default DND;
