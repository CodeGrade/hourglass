import React from 'react';
import { useParams, Link, Route } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import NewExam from '@professor/exams/new';
import SyncCourse from '@professor/courses/sync';
import DocumentTitle from '@hourglass/common/documentTitle';
import Loading from '@hourglass/common/loading';
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
      railsId
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
          <li key={exam.railsId}>
            <Link
              to={`/exams/${exam.railsId}/admin`}
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
        query showCourseQuery($railsId: Int!) {
          course(railsId: $railsId) {
            title
            exams {
              ...show_courseExams
            }
          }
        }
        `}
      variables={{
        railsId: Number(courseId),
      }}
      render={({ error, props }) => {
        if (error) {
          return <p>Error</p>;
        }
        if (!props) {
          return <p>Loading...</p>;
        }
        return (
          <Loading loading={!props}>
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
                <SyncCourse />
              </DocumentTitle>
            </Route>
            <Route path="/courses/:courseId/new" exact>
              <DocumentTitle title={`New Exam - ${props.course.title}`}>
                <NewExam />
              </DocumentTitle>
            </Route>
          </Loading>
        );
      }}
    />
  );
};

export default ShowCourse;
