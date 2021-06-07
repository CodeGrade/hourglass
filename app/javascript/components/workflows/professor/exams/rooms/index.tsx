import React, { useCallback, useMemo, useContext } from 'react';
import {
  useHistory,
  Switch,
  Route,
} from 'react-router-dom';
import {
  Button,
  Form,
  FormControl,
  Row,
  Col,
} from 'react-bootstrap';
import Icon from '@student/exams/show/components/Icon';
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
import store from '@hourglass/common/student-dnd/store';
import { AlertContext } from '@hourglass/common/alerts';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import { TabEditButton } from '@professor/exams/admin';
import { useMutation, graphql, useFragment } from 'relay-hooks';

import { roomsIndex, roomsIndex$key } from './__generated__/roomsIndex.graphql';
import { roomsUpdateMutation } from './__generated__/roomsUpdateMutation.graphql';

const EditExamRooms: React.FC<{
  examKey: roomsIndex$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment roomsIndex on Exam {
      id
      rooms {
        id
        name
        registrations {
          id
        }
        proctorRegistrations {
          id
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
          <Route path="/exams/:examId/admin/rooms/edit">
            <Editable examId={res.id} rooms={res.rooms} />
          </Route>
          <Route>
            <Readonly rooms={res.rooms} />
          </Route>
        </Switch>
      </Col>
    </Row>
  );
};

export default EditExamRooms;

function createInitialValues(rooms: roomsIndex['rooms']): FormValues {
  return {
    rooms: rooms.map(({
      name,
      id,
      registrations,
      proctorRegistrations,
    }) => ({
      name,
      id,
      hasRegs: registrations.length + proctorRegistrations.length !== 0,
    })),
  };
}

const Editable: React.FC<{
  examId: string;
  rooms: roomsIndex['rooms'];
}> = (props) => {
  const {
    examId,
    rooms,
  } = props;
  const initialValues = useMemo(() => createInitialValues(rooms), [rooms]);
  return (
    <Provider store={store}>
      <EditExamRoomsForm
        examId={examId}
        initialValues={initialValues}
      />
    </Provider>
  );
};

const Readonly: React.FC<{
  rooms: roomsIndex['rooms'];
}> = (props) => {
  const {
    rooms,
  } = props;
  return (
    <>
      <h2>
        Rooms
        <span className="float-right">
          <TabEditButton />
        </span>
      </h2>
      {rooms.map((r) => (
        <Form.Group key={r.id}>
          <FormControl
            size="lg"
            value={r.name}
            disabled
          />
        </Form.Group>
      ))}
    </>
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

const renderRoom = (member: string, index: number, fields: FieldArrayFieldsProps<FormRoom>) => {
  const current = fields.get(index);
  const disabled = 'hasRegs' in current && current.hasRegs;
  return (
    <FormSection
      name={member}
      key={index}
    >
      <li className="list-unstyled">
        <Form.Group as={Row}>
          <Col className="d-flex">
            <Field name="name" component={EditRoomName} />
            <TooltipButton
              variant="danger"
              onClick={() => fields.remove(index)}
              disabled={disabled}
              disabledMessage="This room has registered users."
              size="lg"
              className="text-nowrap ml-2"
            >
              <Icon I={FaTrash} />
              <span className="ml-1">
                Delete
              </span>
            </TooltipButton>
          </Col>
        </Form.Group>
      </li>
    </FormSection>
  );
};

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

interface RoomUpdate {
  roomId: string;
  name: string;
}

interface Body {
  updatedRooms: RoomUpdate[];
  deletedRoomIds: string[];
  newRooms: string[];
}

function transformForSubmit(initValues: Partial<FormValues>, values: FormValues): Body {
  const { rooms } = values;
  const { rooms: initRooms } = initValues;
  const updatedRooms: RoomUpdate[] = rooms.reduce((acc, room) => {
    if ('id' in room) {
      return [
        ...acc,
        {
          roomId: room.id,
          name: room.name,
        },
      ];
    }
    return acc;
  }, []);
  const newRooms = rooms.filter((r) => !('id' in r));
  const deletedRooms = initRooms.filter<FormChangedRoom>((ir): ir is FormChangedRoom => {
    if (!('id' in ir)) {
      return false;
    }
    return !rooms.find((r) => {
      if (!('id' in r)) {
        return false;
      }
      return r.id === ir.id;
    });
  });
  return {
    updatedRooms,
    newRooms: newRooms.map((r) => r.name),
    deletedRoomIds: deletedRooms.map((r) => r.id),
  };
}

interface ExamRoomsFormExtraProps {
  examId: string;
}

const ExamRoomsForm: React.FC<
  InjectedFormProps<FormValues, ExamRoomsFormExtraProps> & ExamRoomsFormExtraProps
> = (props) => {
  const {
    examId,
    pristine,
    reset,
    handleSubmit,
    initialValues,
  } = props;
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const cancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const [mutate, { loading }] = useMutation<roomsUpdateMutation>(
    graphql`
    mutation roomsUpdateMutation($input: UpdateExamRoomsInput!, $withRubric: Boolean!) {
      updateExamRooms(input: $input) {
        exam {
          ...admin_checklist
        }
      }
    }
    `,
    {
      onCompleted: () => {
        history.push(`/exams/${examId}/admin/rooms`);
        alert({
          variant: 'success',
          autohide: true,
          message: 'Rooms saved successfully.',
        });
      },
      onError: (err) => {
        alert({
          autohide: true,
          variant: 'danger',
          title: 'Failed saving rooms.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <form
      onSubmit={handleSubmit((values) => {
        const {
          updatedRooms,
          newRooms,
          deletedRoomIds,
        } = transformForSubmit(initialValues, values);
        mutate({
          variables: {
            input: {
              examId,
              updatedRooms,
              newRooms,
              deletedRoomIds,
            },
            withRubric: true,
          },
        });
      })}
    >
      <h2>
        Edit Rooms
        <span className="float-right">
          <Button
            disabled={loading}
            className={pristine ? 'd-none' : ''}
            variant="danger"
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            disabled={loading}
            className="ml-2"
            variant="secondary"
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            className="ml-2"
            variant="primary"
            type="submit"
          >
            Save
          </Button>
        </span>
      </h2>
      <FieldArray name="rooms" component={ShowRooms} props={{ }} />
    </form>
  );
};

interface FormNewRoom {
  name: string;
}

interface FormChangedRoom {
  name: string;
  id: string;
  hasRegs: boolean;
}

type FormRoom = FormChangedRoom | FormNewRoom;

interface FormValues {
  rooms: FormRoom[];
}

const EditExamRoomsForm = reduxForm<FormValues, ExamRoomsFormExtraProps>({
  form: 'room-editor',
})(ExamRoomsForm);
