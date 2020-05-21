import React from 'react';
import Routes from '@hourglass/routes';
import { ExhaustiveSwitchError } from '../student/helpers';

interface Exam {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

interface CourseProps {
  course: Course;
  exams: Exam[];
  role: Role;
}

const Course: React.FC<CourseProps> = (props) => {
  const {
    course,
    exams,
    role,
  } = props;
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
  return (
    <div>
      <h2>{course.name}</h2>
      <ul>
        {exams.map((e) => {
          const url = route(e.id);
          return (
            <li key={e.id}>
              <a
                href={url}
              >
                {e.name}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export type Role = 'student' | 'proctor' | 'professor';

interface OverviewProps {
  exams: {
    [id: number]: Exam[];
  };
  courses: Course[];
  role: Role;
}

const Overview: React.FC<OverviewProps> = (props) => {
  const {
    exams,
    courses,
    role,
  } = props;
  return (
    <div>
      <h1>My Exams</h1>
      {courses.map((c) => (
        <Course
          key={c.id}
          course={c}
          exams={exams[c.id]}
          role={role}
        />
      ))}
    </div>
  );
};

export default Overview;
