import React from 'react';
import { useParams, Link, Route } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useResponse as showCourse } from '@hourglass/common/api/professor/courses/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { useResponse as examsIndex } from '@hourglass/common/api/professor/exams';
import NewExam from '@professor/exams/new';
import SyncCourse from '@professor/courses/sync';
import DocumentTitle from '@hourglass/common/documentTitle';
import Loading from '@hourglass/common/loading';

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

const ShowCourse: React.FC = () => {
  const { courseId } = useParams();
  const res = showCourse(courseId);
  let course;
  switch (res.type) {
    case 'ERROR':
      return <p>Error</p>;
    case 'LOADING':
      course = { id: courseId, title: 'Course' };
      break;
    case 'RESULT':
      course = res.response.course;
      break;
    default:
      throw new ExhaustiveSwitchError(res);
  }
  return (
    <Loading loading={res.type === 'LOADING'}>
      <div className="d-flex align-items-center justify-content-between">
        <h1>
          {course.title}
        </h1>
        <div>
          <Link to={`/courses/${courseId}/sync`}>
            <Button
              variant="danger"
            >
              Sync
            </Button>
          </Link>
          <Link to={`/courses/${courseId}/new`} className="ml-1">
            <Button
              variant="success"
            >
              New Exam
            </Button>
          </Link>
        </div>
      </div>
      <Route path="/courses/:courseId" exact>
        <DocumentTitle title={course.title}>
          <CourseExams courseId={courseId} />
        </DocumentTitle>
      </Route>
      <Route path="/courses/:courseId/sync" exact>
        <DocumentTitle title={`Sync - ${course.title}`}>
          <SyncCourse />
        </DocumentTitle>
      </Route>
      <Route path="/courses/:courseId/new" exact>
        <DocumentTitle title={`New Exam - ${course.title}`}>
          <NewExam />
        </DocumentTitle>
      </Route>
    </Loading>
  );
};

export default ShowCourse;
