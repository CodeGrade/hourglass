import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Badge, Col, Row, Button, Form } from 'react-bootstrap';
import { FieldArray, reduxForm, InjectedFormProps } from 'redux-form';
import store from '@hourglass/common/student-dnd/store';
import { Provider } from 'react-redux';
import {
  useResponse as useRoomsIndex,
  Student,
} from '@hourglass/common/api/professor/rooms';

const ItemTypes = {
  STUDENT: 'student',
};

const DropTarget: React.FC<{
  onAdd: (student: Student) => void;
}> = (props) => {
  const {
    children,
    onAdd,
  } = props;
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.STUDENT,
    drop: ({ student }) => {
      onAdd(student);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  const bg = isOver ? 'bg-info' : 'bg-secondary';
  return (
    <div
      ref={drop}
      className={`${bg} rounded text-white px-2 text-center flex-fill`}
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
  const [{ isDragging }, drag] = useDrag({
    item: {
      type: ItemTypes.STUDENT,
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
  <Badge variant="primary">
    {student.displayName}
  </Badge>
);


const Students: React.FC<{}> = (props) => {
  const {
    fields,
  } = props;
  return (
    <DropTarget
      onAdd={(student) => fields.push(student)}
    >
      <p
        className={fields.length === 0 ? 'm-0' : 'd-none'}
      >
        Drop students here!
      </p>
      <div className="d-flex justify-content-around rounded mb-2 flex-wrap">
        {fields.map((member, index) => {
          const student = fields.get(index);
          return (
            <span
              className="mx-1"
              key={`${member}-${student.id}`}
            >
              <DraggableStudent
                student={student}
                onRemove={() => fields.remove(index)}
              />
            </span>
          );
        })}
      </div>
    </DropTarget>
  );
}

const Rooms: React.FC<{}> = (props) => {
  const {
    fields,
  } = props;
  return (
    <Row>
      {fields.map((member, index) => {
        const room = fields.get(index);
        return (
          <Col key={room.id}>
            <h2>{room.name}</h2>
            <FieldArray name={`${member}.students`} component={Students} />
          </Col>
        );
      })}
    </Row>
  );
}

const StudentDNDForm: React.FC<InjectedFormProps> = (props) => {
  const {
    handleSubmit,
    reset,
    pristine,
  } = props;
  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log(data);
      })}
    >
      <div>
        <h2>Unassigned Students</h2>
        <FieldArray name="students" component={Students} />
      </div>
      <FieldArray name="rooms" component={Rooms} />
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
    </form>
  );
};

const DNDForm = reduxForm({
  form: 'student-dnd',
})(StudentDNDForm);

export default () => {
  const response = useRoomsIndex(400167349);
  if (response.type === 'ERROR' || response.type === 'LOADING') {
    return <p>Loading...</p>;
  }
  return (
    <Provider store={store}>
      <DNDForm
        initialValues={{
          students: response.response.unassigned,
          rooms: response.response.rooms,
        }}
      />
    </Provider>
  );
};
