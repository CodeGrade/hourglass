import React, { useCallback, useMemo, useContext } from 'react';
import { Room, useResponse as indexRooms } from '@hourglass/common/api/professor/rooms/index';
import { updateAll, Body } from '@hourglass/common/api/professor/rooms/updateAllRooms';
import { useParams, useHistory } from 'react-router-dom';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  Button,
  Form,
  FormControl,
  InputGroup,
  Row,
  Col,
} from 'react-bootstrap';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import { FaTrash, FaPlus } from 'react-icons/fa';
import {
  reduxForm,
  FormSection,
  FieldArray,
  WrappedFieldProps,
  FieldArrayFieldsProps,
  WrappedFieldArrayProps,
  Field,
  InjectedFormProps,
} from 'redux-form';
import { Provider } from 'react-redux';
import store from '@professor/exams/rooms/store';
import { AlertContext } from '@hourglass/common/alerts';

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

function createInitialValues(rooms: Room[]): FormValues {
  return {
    rooms: rooms.map(({ name, id }) => ({ name, id })),
  };
}

const Loaded: React.FC<{
  rooms: Room[];
}> = (props) => {
  const {
    rooms,
  } = props;
  const initialValues = useMemo(() => createInitialValues(rooms), [rooms]);
  return (
    <Row>
      <Col>
        <h1>Edit rooms</h1>
        <Provider store={store}>
          <EditExamRoomsForm
            initialValues={initialValues}
          />
        </Provider>
      </Col>
    </Row>
  );
};

const EditRoomName: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <FormControl
      size="lg"
      placeholder="Room name"
      value={value}
      onChange={onChange}
    />
  );
};

const renderRoom = (member: string, index: number, fields: FieldArrayFieldsProps<FormRoom>) => (
  <FormSection
    name={member}
    key={index}
  >
    <li className="list-unstyled">
      <Form.Group>
        <InputGroup>
          <Field name="name" component={EditRoomName} />
          <InputGroup.Append>
            <Button
              variant="danger"
              onClick={() => fields.remove(index)}
              // TODO: disabled={r.students.length !== 0}
            >
              <Icon I={FaTrash} />
              <span className="ml-1">
                Delete
              </span>
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </li>
  </FormSection>
);

const ShowRooms: React.FC<WrappedFieldArrayProps<FormRoom>> = (props) => {
  const {
    fields,
  } = props;
  const addRoom = useCallback(() => {
    fields.push({
      name: '',
    });
  }, [fields]);
  return (
    <>
      {fields.map(renderRoom)}
      <Form.Group className="text-center">
        <Button
          size="lg"
          variant="success"
          onClick={addRoom}
        >
          <Icon I={FaPlus} />
          <span className="ml-1">
            Add room
          </span>
        </Button>
      </Form.Group>
    </>
  );
};

function transformForSubmit(initValues: FormValues, values: FormValues): Body {
  const { rooms } = values;
  const { rooms: initRooms } = initValues;
  const updatedRooms: {
    id: number;
    name: string;
  } = rooms.filter((r) => r.id !== undefined);
  const newRooms = rooms.filter((r) => !('id' in r));
  const deletedRooms = initRooms.filter((ir) => rooms.find((r) => r.id === ir.id));
  return {
    updatedRooms,
    newRooms: newRooms.map((r) => r.name),
    deletedRooms: deletedRooms.map((r) => r.id),
  };
}

const ExamRoomsForm: React.FC<InjectedFormProps<FormValues>> = (props) => {
  const {
    pristine,
    reset,
    handleSubmit,
    initialValues,
  } = props;
  const { examId } = useParams();
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  return (
    <form
      onSubmit={handleSubmit((values) => {
        // TODO: transform values to be acceptable for updateAll (three fields)
        // TODO: try submitting, show an error but don't redirect until successful
        const body = transformForSubmit(initialValues, values);
        updateAll(examId, body).then((res) => {
          alert({
            variant: 'success',
            message: 'Rooms saved successfully.',
          });
          history.push(`/exams/${examId}/admin`);
        }).catch((err) => {
          alert({
            autohide: true,
            variant: 'danger',
            title: 'Failed saving rooms.',
            message: err.message,
          });
        });
      })}
    >
      <FieldArray name="rooms" component={ShowRooms} />
      <Form.Group className="float-right">
        <Button
          className={pristine ? 'd-none' : ''}
          size="lg"
          variant="danger"
          onClick={reset}
        >
          Reset
        </Button>
        <Button
          size="lg"
          className="ml-2"
          variant="success"
          type="submit"
        >
          Submit
        </Button>
      </Form.Group>
    </form>
  );
};

interface FormRoom {
  id?: number;
  name: string;
}

interface FormValues {
  rooms: FormRoom[];
}

const EditExamRoomsForm = reduxForm({
  form: 'room-editor',
})(ExamRoomsForm);
