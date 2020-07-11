import React from 'react';
import DocumentTitle from '@hourglass/common/documentTitle';
import { Link } from 'react-router-dom';
import {
  useFragment,
  graphql,
  useQuery,
  useMutation,
} from 'relay-hooks';
import { RenderError } from '@hourglass/common/boundary';
import { ListGroup, Button } from 'react-bootstrap';

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
        id
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
            <Link to={`/exams/${reg.exam.id}`}>
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
              to={`/courses/${course.id}`}
            >
              {course.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

const Admin: React.FC = () => {
  const res = useQuery(
    graphql`
    query homeAdminQuery {
      users {
        id
        displayName
      }
    }
    `,
  );
  const [impersonate, { loading }] = useMutation(
    graphql`
    mutation homeImpersonateMutation($input: ImpersonateUserInput!) {
      impersonateUser(input: $input) {
        success
      }
    }
    `,
    {
      onCompleted: () => {
        window.location.href = '/';
      },
    },
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.props) {
    return <p>Loading...</p>;
  }
  return (
    <ListGroup>
      {res.props.users.map((user) => (
        <ListGroup.Item key={user.id}>
          <span className="text-center">
            {user.displayName}
          </span>
          <span className="float-right">
            <Button
              disabled={loading}
              variant="success"
              onClick={() => {
                impersonate({
                  variables: {
                    input: {
                      userId: user.id,
                    },
                  },
                });
              }}
            >
              Impersonate
            </Button>
          </span>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

const Home: React.FC = () => {
  const res = useQuery<homeQuery>(
    graphql`
    query homeQuery {
      me {
        admin
        registrations {
          nodes {
            ...home_studentregs
          }
        }
        professorCourseRegistrations {
          nodes {
            ...home_profregs
          }
        }
      }
    }
    `,
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.props) {
    return <p>Loading...</p>;
  }
  const allEmpty = (
    res.props.me.registrations.nodes.length === 0
    && res.props.me.professorCourseRegistrations.nodes.length === 0
  );
  if (res.props.me.admin) {
    return (
      <DocumentTitle title="Admin">
        <Admin />
      </DocumentTitle>
    );
  }
  if (allEmpty) {
    return (
      <DocumentTitle title="Hourglass">
        <p>You have no registrations.</p>
      </DocumentTitle>
    );
  }
  return (
    <DocumentTitle title="My Exams">
      <ShowRegistrations
        registrations={res.props.me.registrations.nodes}
      />
      <ShowProfRegs
        professorCourseRegistrations={res.props.me.professorCourseRegistrations.nodes}
      />
    </DocumentTitle>
  );
};

export default Home;
