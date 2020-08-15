import React, { useState, useContext } from 'react';
import DocumentTitle from '@hourglass/common/documentTitle';
import { Link } from 'react-router-dom';
import {
  useFragment,
  graphql,
  useQuery,
  useMutation,
} from 'relay-hooks';
import { RenderError } from '@hourglass/common/boundary';
import Select, { GroupedOptionsType } from 'react-select';
import {
  Button,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import LinkButton from '@hourglass/common/linkbutton';
import { SelectOption } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';

import { homeQuery } from './__generated__/homeQuery.graphql';
import { home_futureregs$key, home_futureregs as HFR } from './__generated__/home_futureregs.graphql';
import { home_studentregs$key, home_studentregs as HSR } from './__generated__/home_studentregs.graphql';
import { home_profregs$key } from './__generated__/home_profregs.graphql';
import { home_proctorregs$key } from './__generated__/home_proctorregs.graphql';
import { home_staffregs$key } from './__generated__/home_staffregs.graphql';
import { homeAdminQuery } from './__generated__/homeAdminQuery.graphql';
import { ImpersonateUserInput } from './__generated__/homeImpersonateMutation.graphql';

const ShowUpcomingRegistrations: React.FC<{
  registrations: home_futureregs$key;
}> = (props) => {
  const { registrations } = props;
  const res = useFragment<home_futureregs$key>(
    graphql`
    fragment home_futureregs on Registration @relay(plural: true) {
      id
      examName
      accommodatedStartTime
      courseTitle
    }
    `,
    registrations,
  );
  if (res.length === 0) return null;
  const regsByCourse: Record<string, HFR[number][]> = {};
  res.forEach((reg : HFR[number]) => {
    if (regsByCourse[reg.courseTitle] === undefined) {
      regsByCourse[reg.courseTitle] = [];
    }
    regsByCourse[reg.courseTitle].push(reg);
  });
  Object.values(regsByCourse).forEach((regs) => {
    regs.sort((r1, r2) => r2.accommodatedStartTime.localeCompare(r1.accommodatedStartTime));
  });
  return (
    <>
      <h1>Upcoming exams</h1>
      <ul>
        {Object.keys(regsByCourse).map((courseTitle) => {
          const regs = regsByCourse[courseTitle];
          return (
            <li key={regs[0].id}>
              <h2>{courseTitle}</h2>
              <ul>
                {regs.map((reg) => {
                  const {
                    id,
                    examName,
                    accommodatedStartTime,
                  } = reg;
                  const startTime = DateTime.fromISO(accommodatedStartTime).toLocal();
                  const start = startTime.toLocaleString(DateTime.DATETIME_FULL);
                  return (
                    <li key={id}>
                      {`${examName} at ${start}`}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </>
  );
};

const ShowRegistrations: React.FC<{
  name: string;
  registrations: home_studentregs$key;
}> = (props) => {
  const {
    name,
    registrations,
  } = props;
  const res = useFragment(
    graphql`
    fragment home_studentregs on Registration @relay(plural: true) {
      id
      accommodatedStartTime
      exam {
        id
        name
      }
      courseTitle
    }
    `,
    registrations,
  );
  if (res.length === 0) return null;
  const regsByCourse: Record<string, HSR[number][]> = {};
  res.forEach((reg : HSR[number]) => {
    if (regsByCourse[reg.courseTitle] === undefined) {
      regsByCourse[reg.courseTitle] = [];
    }
    regsByCourse[reg.courseTitle].push(reg);
  });
  Object.values(regsByCourse).forEach((regs) => {
    regs.sort((r1, r2) => r2.accommodatedStartTime.localeCompare(r1.accommodatedStartTime));
  });
  return (
    <>
      <h1>{name}</h1>
      <ul>
        {Object.keys(regsByCourse).map((courseTitle) => {
          const regs = regsByCourse[courseTitle];
          return (
            <li key={regs[0].id}>
              <h2>{courseTitle}</h2>
              <ul>
                {res.map((reg) => (
                  <li key={reg.id}>
                    <Link to={`/exams/${reg.exam.id}`}>
                      {reg.exam.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
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

const ShowStaffRegs: React.FC<{
  staffRegistrations: home_staffregs$key;
}> = (props) => {
  const {
    staffRegistrations,
  } = props;
  const regs = useFragment(
    graphql`
    fragment home_staffregs on StaffRegistration @relay(plural: true) {
      id
      course {
        exams {
          id
          name
        }
      }
    }
    `,
    staffRegistrations,
  );
  if (regs.length === 0) return null;
  return (
    <>
      <h1>Exams to Grade</h1>
      <ul>
        {regs.map((r) => (
          <React.Fragment key={r.id}>
            {r.course.exams.map((exam) => (
              <li
                key={exam.id}
              >
                <h2>{exam.name}</h2>
                <LinkButton to={`/exams/${exam.id}/grading`} variant="success">
                  Start Grading
                </LinkButton>
                <Button className="ml-2" disabled>
                  Re-grade
                </Button>
              </li>
            ))}
          </React.Fragment>
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

export type ImpersonateVal = SelectOption<string>

export const ImpersonateUser: React.FC<{
  userOptions: ImpersonateVal[] | GroupedOptionsType<ImpersonateVal>;
  courseId?: ImpersonateUserInput['courseId'];
}> = (props) => {
  const { userOptions, courseId } = props;
  const { alert } = useContext(AlertContext);
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
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error impersonating user',
          message: err.message,
        });
      },
    },
  );
  const [selectedUser, setSelectedUser] = useState<string>(undefined);
  return (
    <>
      <Row>
        <Col className="w-100">
          <h1>Impersonation</h1>
          <Select
            placeholder="Select a user to impersonate..."
            isDisabled={loading}
            options={userOptions}
            onChange={(val: ImpersonateVal) => {
              setSelectedUser(val.value);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col className="d-flex">
          <Button
            className="mx-auto"
            variant="danger"
            disabled={selectedUser === undefined}
            onClick={() => {
              impersonate({
                variables: {
                  input: {
                    userId: selectedUser,
                    courseId,
                  },
                },
              });
            }}
          >
            Impersonate user
          </Button>
        </Col>
      </Row>
    </>
  );
};

const Admin: React.FC = () => {
  const res = useQuery<homeAdminQuery>(
    graphql`
    query homeAdminQuery {
      users {
        id
        displayName
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
  const userOptions: ImpersonateVal[] = res.props.users.map((user) => ({
    label: user.displayName,
    value: user.id,
  }));
  return <ImpersonateUser userOptions={userOptions} />;
};

const Home: React.FC = () => {
  const res = useQuery<homeQuery>(
    graphql`
    query homeQuery {
      me {
        admin
        futureRegistrations {
          ...home_futureregs
        }
        currentRegistrations {
          ...home_studentregs
        }
        priorRegistrations {
          ...home_studentregs
        }
        staffRegistrations {
          nodes {
            ...home_staffregs
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
    res.props.me.futureRegistrations.length === 0
    && res.props.me.currentRegistrations.length === 0
    && res.props.me.priorRegistrations.length === 0
    && res.props.me.professorCourseRegistrations.nodes.length === 0
    && res.props.me.proctorRegistrations.nodes.length === 0
    && res.props.me.staffRegistrations.nodes.length === 0
  );
  return (
    <Container>
      <DocumentTitle title="My Exams">
        {allEmpty && (
          <DocumentTitle title="Hourglass">
            <p>You have no registrations.</p>
          </DocumentTitle>
        )}
        <ShowUpcomingRegistrations
          registrations={res.props.me.futureRegistrations}
        />
        <ShowRegistrations
          name="Active exams"
          registrations={res.props.me.currentRegistrations}
        />
        <ShowRegistrations
          name="Prior exams"
          registrations={res.props.me.priorRegistrations}
        />
        <ShowProctorRegs
          proctorRegistrations={res.props.me.proctorRegistrations.nodes}
        />
        <ShowStaffRegs
          staffRegistrations={res.props.me.staffRegistrations.nodes}
        />
        <ShowProfRegs
          professorCourseRegistrations={res.props.me.professorCourseRegistrations.nodes}
        />
        {res.props.me.admin && (
          <Admin />
        )}
      </DocumentTitle>
    </Container>
  );
};

export default Home;
