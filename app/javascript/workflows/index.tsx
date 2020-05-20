import React from 'react';
import Routes from '@hourglass/routes';

interface Exam {
  id: number;
  name: string;
  course_id: number;
}

interface Course {
  id: number;
  name: string;
}

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
        {exams.map((e) => {
          const url = Routes.exam_path(e.id);
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

interface OverviewProps {
  exams: {
    [id: number]: Exam[];
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
