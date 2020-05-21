import React from 'react';
import Routes from '@hourglass/routes';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Button } from 'react-bootstrap';

interface Exam {
  id: number;
  name: string;
  courseId: number;
  role: ExamRole;
}

interface Course {
  id: number;
  name: string;
  createExams: boolean;
}

interface ExamProps {
  exam: Exam;
}

const Exam: React.FC<ExamProps> = (props) => {
  const {
    exam,
  } = props;
  const {
    id,
    name,
    role,
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
  const {
    createExams,
  } = course;
  return (
    <div>
      <h2>
        {course.name}
        {createExams && (
          <Button
            href={Routes.new_professor_exam_path()}
            variant="success"
            className="d-inline float-right"
          >
            New exam
          </Button>
        )}
      </h2>
      <ul>
        {exams.map((e) => (
          <Exam
            key={e.id}
            exam={e}
          />
        ))}
      </ul>
    </div>
  );
};

export type ExamRole = 'student' | 'proctor' | 'professor';
export type UserRole = 'unprivileged' | 'professor' | 'admin';

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
