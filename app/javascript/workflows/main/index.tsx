import React from 'react';
import Routes from '@hourglass/routes';
import { ExhaustiveSwitchError } from '../student/exams/show/helpers';

interface Exam {
  id: number;
  name: string;
  role: Role;
  courseId: number;
}

interface Course {
  id: number;
  name: string;
}

interface ExamProps {
  exam: Exam;
}

const Exam: React.FC<ExamProps> = (props) => {
  const {
    exam,
  } = props;
  const {
    role,
    id,
    name,
  } = exam;
  let route;
  switch (role) {
    case 'student':
      route = Routes.student_exam_path;
      break;
    case 'proctor':
      route = Routes.proctor_exam_path;
      break;
    case 'professor':
      route = Routes.professor_exam_path;
      break;
    default:
      throw new ExhaustiveSwitchError(role);
  }
  const url = route(id);
  return (
    <li>
      <a
        href={url}
      >
        {`${name} (${role})`}
      </a>
    </li>
  );
};

interface CourseProps {
  course: Course;
  exams: Exam[];
}

const Course: React.FC<CourseProps> = (props) => {
  const {
    course,
    exams,
  } = props;
  return (
    <div>
      <h2>{course.name}</h2>
      <ul>
        {exams.map((e) => (
          <Exam key={e.id} exam={e} />
        ))}
      </ul>
    </div>
  );
};

export type Role = 'student' | 'proctor' | 'professor';

interface OverviewProps {
  exams: {
    [courseId: number]: Exam[];
  };
  courses: Course[];
}

const Overview: React.FC<OverviewProps> = (props) => {
  const {
    exams,
    courses,
  } = props;
  return (
    <div>
      <h1>My Exams</h1>
      {courses.map((c) => (
        <Course
          key={c.id}
          course={c}
          exams={exams[c.id]}
        />
      ))}
    </div>
  );
};

export default Overview;
