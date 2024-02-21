import React, { Suspense, useMemo } from 'react';
import { useParams, Link, Route } from 'react-router-dom';
import {
  Container,
  Button,
  Col,
  Row,
} from 'react-bootstrap';
import NewExam from '@professor/exams/new';
import SyncCourse from '@professor/courses/sync';
import DocumentTitle from '@hourglass/common/documentTitle';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import ErrorBoundary from '@hourglass/common/boundary';
import { GroupBase } from 'react-select';
import { ImpersonateVal, ImpersonateUser } from '@hourglass/workflows/home';
import { NavbarBreadcrumbs, NavbarItem } from '@hourglass/common/navbar';

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
            <Row>
              <Col>
                <Link to={`/exams/${exam.id}/admin`}>
                  {exam.name}
                </Link>
              </Col>
              {/* <Col sm={2}>
                Export...
              </Col>
              <Col sm={2}>
                Merge...
              </Col> */}
            </Row>
          </li>
        ))}
      </ul>
    </>
  );
};

const ShowCourse: React.FC = () => (
  <Container>
    <ErrorBoundary>
      <Suspense
        fallback={(
          <p>Loading...</p>
        )}
      >
        <ShowCourseQuery />
      </Suspense>
    </ErrorBoundary>
  </Container>
);

const ShowCourseQuery: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const data = useLazyLoadQuery<showCourseQuery>(
    graphql`
    query showCourseQuery($courseId: ID!) {
      course(id: $courseId) {
        title
        id
        students {
          id
          imageUrl
          displayName
          username
        }
        staff {
          id
          imageUrl
          displayName
          username
        }
        professors {
          id
          imageUrl
          displayName
          username
        }
        exams {
          ...show_courseExams
        }
      }
    }
    `,
    { courseId },
  );
  const userIdToImageMap = {};
  const allUsers = data.course.students
    .concat(data.course.staff)
    .concat(data.course.professors);
  allUsers.forEach((user) => {
    if (user.imageUrl) {
      userIdToImageMap[user.id] = user.imageUrl;
    }
  });
  const userOptions: GroupBase<ImpersonateVal>[] = [
    {
      label: 'Students',
      options: data.course.students.map((user) => ({
        label: `${user.displayName} (${user.username})`,
        value: user.id,
      })),
    },
    {
      label: 'Staff',
      options: data.course.staff.map((user) => ({
        label: `${user.displayName} (${user.username})`,
        value: user.id,
      })),
    },
    {
      label: 'Professors',
      options: data.course.professors.map((user) => ({
        label: `${user.displayName} (${user.username})`,
        value: user.id,
      })),
    },
  ];
  const courseItems: NavbarItem[] = useMemo(() => [
    [undefined, data.course.title],
  ], [data.course.title]);
  const syncItems: NavbarItem[] = useMemo(() => [
    [`/courses/${courseId}`, data.course.title],
    [undefined, 'Sync'],
  ], [data.course.title]);
  const newExamItems: NavbarItem[] = useMemo(() => [
    [`/courses/${courseId}`, data.course.title],
    [undefined, 'New exam'],
  ], [data.course.title]);
  return (
    <Container>
      <div className="d-flex align-items-center justify-content-between">
        <h1>
          {data.course.title}
        </h1>
        <div className="text-nowrap">
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
        <NavbarBreadcrumbs items={courseItems} />
        <DocumentTitle title={data.course.title}>
          <CourseExams courseExams={data.course.exams} />
          <ImpersonateUser
            userIdToImageMap={userIdToImageMap}
            userOptions={userOptions}
            courseId={data.course.id}
          />
        </DocumentTitle>
      </Route>
      <Route path="/courses/:courseId/sync" exact>
        <NavbarBreadcrumbs items={syncItems} />
        <DocumentTitle title={`Sync - ${data.course.title}`}>
          <SyncCourse courseId={data.course.id} />
        </DocumentTitle>
      </Route>
      <Route path="/courses/:courseId/new" exact>
        <NavbarBreadcrumbs items={newExamItems} />
        <DocumentTitle title={`New Exam - ${data.course.title}`}>
          <NewExam courseId={data.course.id} />
        </DocumentTitle>
      </Route>
    </Container>
  );
};

export default ShowCourse;
