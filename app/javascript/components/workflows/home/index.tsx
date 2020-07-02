import React from 'react';
import DocumentTitle from '@hourglass/common/documentTitle';
import { Link } from 'react-router-dom';
import environment from '@hourglass/relay/environment';
import { useFragment, graphql } from 'relay-hooks';
import { QueryRenderer } from 'react-relay';
import { homeQuery } from './__generated__/homeQuery.graphql';
import { home_studentregs$key } from './__generated__/home_studentregs.graphql';
import { home_profregs$key } from './__generated__/home_profregs.graphql';

const ShowRegistrations: React.FC<{
  registrations: home_studentregs$key;
}> = (props) => {
  const {
    registrations,
  } = props;
  const res = useFragment(
    graphql`
    fragment home_studentregs on Registration @relay(plural: true) {
      id
      exam {
        railsId
        name
      }
    }
    `,
    registrations,
  );
  if (res.length === 0) return null;
  return (
    <>
      <h1>Take an Exam</h1>
      <ul>
        {res.map((reg) => (
          <li key={reg.id}>
            <Link to={`/exams/${reg.exam.railsId}`}>
              {reg.exam.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

const ShowProfRegs: React.FC<{
  professorCourseRegistrations: home_profregs$key;
}> = (props) => {
  const {
    professorCourseRegistrations,
  } = props;
  const res = useFragment(
    graphql`
    fragment home_profregs on ProfessorCourseRegistration @relay(plural: true) {
      course {
        id
        railsId
        title
      }
    }
    `,
    professorCourseRegistrations,
  );
  if (res.length === 0) return null;
  return (
    <>
      <h1>Courses</h1>
      <ul>
        {res.map(({ course }) => (
          <li
            key={course.id}
          >
            <Link
              to={`/courses/${course.railsId}`}
            >
              {course.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

const Home: React.FC = () => (
  <DocumentTitle title="My Exams">
    <QueryRenderer<homeQuery>
      environment={environment}
      query={graphql`
        query homeQuery {
          me {
            registrations {
              ...home_studentregs
            }
            professorCourseRegistrations {
              ...home_profregs
            }
          }
        }
        `}
      variables={{}}
      render={({ error, props }) => {
        if (error) {
          return <p>Error</p>;
        }
        if (!props) {
          return <p>Loading...</p>;
        }
        const allEmpty = (
          props.me.registrations.length === 0
          && props.me.professorCourseRegistrations.length === 0
        );
        if (allEmpty) {
          return <p>You have no registrations.</p>;
        }
        return (
          <>
            <ShowRegistrations registrations={props.me.registrations} />
            <ShowProfRegs professorCourseRegistrations={props.me.professorCourseRegistrations} />
          </>
        );
      }}
    />
  </DocumentTitle>
);
export default Home;
