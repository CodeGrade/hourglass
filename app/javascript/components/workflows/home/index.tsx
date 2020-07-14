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
import Select from 'react-select';

import { homeQuery } from './__generated__/homeQuery.graphql';
import { home_studentregs$key } from './__generated__/home_studentregs.graphql';
import { home_profregs$key } from './__generated__/home_profregs.graphql';
import { home_proctorregs$key } from './__generated__/home_proctorregs.graphql';

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

const ShowProctorRegs: React.FC<{
  proctorRegistrations: home_proctorregs$key;
}> = (props) => {
  const {
    proctorRegistrations,
  } = props;
  const res = useFragment(
    graphql`
    fragment home_proctorregs on ProctorRegistration @relay(plural: true) {
      id
      exam {
        id
        name
      }
    }
    `,
    proctorRegistrations,
  );
  if (res.length === 0) return null;
  return (
    <>
      <h1>Proctor an Exam</h1>
      <ul>
        {res.map((reg) => (
          <li key={reg.id}>
            <Link to={`/exams/${reg.exam.id}/proctoring`}>
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

interface ImpersonateVal {
  label: string;
  value: string;
}

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
  const userOptions: ImpersonateVal[] = res.props.users.map((user) => ({
    label: user.displayName,
    value: user.id,
  }));
  return (
    <>
      <h1>Impersonation</h1>
      <Select
        isDisabled={loading}
        options={userOptions}
        onChange={(val: ImpersonateVal) => {
          impersonate({
            variables: {
              input: {
                userId: val.value,
              },
            },
          });
        }}
      />
    </>
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
        proctorRegistrations {
          nodes {
            ...home_proctorregs
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
    && res.props.me.proctorRegistrations.nodes.length === 0
  );
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
      <ShowProctorRegs
        proctorRegistrations={res.props.me.proctorRegistrations.nodes}
      />
      <ShowProfRegs
        professorCourseRegistrations={res.props.me.professorCourseRegistrations.nodes}
      />
      {res.props.me.admin && (
        <Admin />
      )}
    </DocumentTitle>
  );
};

export default Home;
