import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useResponse as showCourse } from '@hourglass/common/api/professor/courses/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { useResponse as examsIndex } from '@hourglass/common/api/professor/exams';

interface CourseExamsProps {
  courseId: number;
}

const CourseExams: React.FC<CourseExamsProps> = (props) => {
  const {
    courseId,
  } = props;
  const res = examsIndex(courseId);
  switch (res.type) {
    case 'ERROR':
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <>
          <h2>Exams</h2>
          <ul>
            {res.response.exams.map((exam) => (
              <li key={exam.id}>
                <Link
                  to={`/exams/${exam.id}/admin`}
                >
                  {exam.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

const ShowCourse: React.FC<{}> = () => {
  const { courseId } = useParams();
  const res = showCourse(courseId);
  switch (res.type) {
    case 'ERROR':
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <>
          <div className="d-flex align-items-center justify-content-between">
            <h1>
              {res.response.course.title}
            </h1>
            <Link to={`/courses/${courseId}/exams/new`}>
              <Button
                variant="success"
              >
                New Exam
              </Button>
            </Link>
          </div>
          <CourseExams courseId={courseId} />
        </>
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

export default ShowCourse;
