import React from 'react';
import { useParams, Link, Route } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import NewExam from '@professor/exams/new';
import SyncCourse from '@professor/courses/sync';
import DocumentTitle from '@hourglass/common/documentTitle';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '@hourglass/relay/environment';
import { useFragment } from 'relay-hooks';
import { showCourseQuery } from './__generated__/showCourseQuery.graphql';
import { show_courseExams$key } from './__generated__/show_courseExams.graphql';

const CourseExams: React.FC<{
  courseExams: show_courseExams$key;
}> = (props) => {
  const {
    courseExams,
  } = props;
  const res = useFragment(
    graphql`
    fragment show_courseExams on Exam @relay(plural: true) {
      id
      name
    }
    `,
    courseExams,
  );
  return (
    <>
      <h2>Exams</h2>
      <ul>
        {res.map((exam) => (
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
};

const ShowCourse: React.FC = () => {
  const { courseId } = useParams();
  return (
    <QueryRenderer<showCourseQuery>
      environment={environment}
      query={graphql`
        query showCourseQuery($courseId: ID!) {
          course(id: $courseId) {
            title
            id
            exams {
              ...show_courseExams
            }
          }
        }
        `}
      variables={{
        courseId,
      }}
      render={({ error, props }) => {
        if (error) {
          return <p>Error</p>;
        }
        if (!props) {
          return <p>Loading...</p>;
        }
        return (
          <>
            <div className="d-flex align-items-center justify-content-between">
              <h1>
                {props.course.title}
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
              <DocumentTitle title={props.course.title}>
                <CourseExams courseExams={props.course.exams} />
              </DocumentTitle>
            </Route>
            <Route path="/courses/:courseId/sync" exact>
              <DocumentTitle title={`Sync - ${props.course.title}`}>
                <SyncCourse courseId={props.course.id} />
              </DocumentTitle>
            </Route>
            <Route path="/courses/:courseId/new" exact>
              <DocumentTitle title={`New Exam - ${props.course.title}`}>
                <NewExam courseId={props.course.id} />
              </DocumentTitle>
            </Route>
          </>
        );
      }}
    />
  );
};

export default ShowCourse;
