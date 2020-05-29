import React from 'react';
import { useDrag, useDrop } from 'react-dnd'
import { Badge } from 'react-bootstrap';

interface Student {
  username: string;
  name: string;
}

interface Room {
  id: number;
  name: string;
}

const ItemTypes = {
  STUDENT: 'student',
};

const students: Student[] = Array(20).fill(undefined).map((_, i) => ({
  username: `student${i + 1}`,
  name: `Student ${i + 1}`,
}));

const rooms: Room[] = Array(3).fill(undefined).map((_, i) => ({
  id: i + 1,
  name: `Room ${i + 1}`,
}));

const StudentDND: React.FC<{}> = () => (
  <>
    <p>student dnd</p>
    <div className="d-flex justify-content-around bg-secondary rounded mb-2 flex-wrap">
      {students.map((s) => <DraggableStudent key={s.username} student={s} />)}
    </div>
    <div className="d-flex flex-wrap justify-content-between">
      {rooms.map((r) => (
        <div className="flex-fill mx-1" key={r.id}>
          <DropTarget room={r} />
        </div>
      ))}
    </div>
  </>
);

const DropTarget: React.FC<{
  room: Room;
}> = ({ room }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.STUDENT,
    drop: ({ student }) => {
      // TODO: move student in state
      console.log('student', student.username, 'dropped in room', room.name);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  return (
    <div
      ref={drop}
      className="bg-secondary rounded text-white px-2 text-center"
    >
      <p>{room.name}</p>
      <p>{isOver ? 'drop here!' : 'waiting'}</p>
    </div>
  );
};

const DraggableStudent: React.FC<{
  student: Student;
}> = ({ student }) => {
  const [{ isDragging }, drag] = useDrag({
    item: {
      type: ItemTypes.STUDENT,
      student,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  const classes = isDragging ? 'd-none' : '';
  return (
    <span ref={drag} className={classes}>
      <StudentBadge student={student} />
    </span>
  );
};

const StudentBadge: React.FC<{
  student: Student;
}> = ({ student }) => (
  <Badge variant="primary">
    {student.name}
  </Badge>
);


export default StudentDND;
