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
  Alert,
  Card,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import LinkButton from '@hourglass/common/linkbutton';
import { SelectOption } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import Icon from '@student/exams/show/components/Icon';
import { MdPerson } from 'react-icons/md';

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
    fragment home_futureregs on FutureRegistration @relay(plural: true) {
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
      <h3>{name}</h3>
      <ul>
        {Object.keys(regsByCourse).map((courseTitle) => {
          const regs = regsByCourse[courseTitle];
          return (
            <li key={regs[0].id}>
              <h4>{courseTitle}</h4>
              <ul>
                {regs.map((reg) => (
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
        id
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
  const courses = {};
  regs.forEach((r) => {
    courses[r.course.id] = r.course;
  });
  return (
    <>
      <h3>Exams to Grade</h3>
      <ul>
        {Object.keys(courses).map((cId) => (
          <React.Fragment key={cId}>
            {courses[cId].exams.map((exam) => (
              <li
                key={exam.id}
              >
                <h4>{exam.name}</h4>
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
      <h3>Courses</h3>
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
  userIdToImageMap: { [key: string]: string; };
  courseId?: ImpersonateUserInput['courseId'];
}> = (props) => {
  const {
    userOptions,
    courseId,
    userIdToImageMap,
  } = props;
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
            formatOptionLabel={(option) => {
              const userHasImage = option.value in userIdToImageMap;
              return (
                <OverlayTrigger
                  placement="right"
                  overlay={(overlayProps) => (
                    <Tooltip
                      id={`impersonation-tooltip-${option.value}`}
                      // This is needed per react-bootstrap for the overlay to work
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...overlayProps}
                    >
                      {userHasImage ? (
                        <img className="profile-photo" src={userIdToImageMap[option.value]} alt={option.label} />
                      ) : (
                        <span>No image for that user.</span>
                      )}
                    </Tooltip>
                  )}
                >
                  <span>
                    {userHasImage ? (
                      <img className="profile-photo-thumb pr-2" src={userIdToImageMap[option.value]} alt={option.label} />
                    ) : (
                      <Icon className="pr-2" I={MdPerson} />
                    )}
                    {option.label}
                  </span>
                </OverlayTrigger>
              );
            }}
            onChange={(val: ImpersonateVal) => {
              setSelectedUser(val.value);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col className="d-flex">
          <Button
            className="mx-auto mt-2"
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
        imageUrl
        displayName
        username
      }
    }
    `,
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.data) {
    return <p>Loading...</p>;
  }
  const userIdToImageMap = {};
  res.data.users.forEach((user) => {
    if (user.imageUrl) {
      userIdToImageMap[user.id] = user.imageUrl;
    }
  });
  const userOptions: ImpersonateVal[] = res.data.users.map((user) => ({
    label: `${user.displayName} (${user.username})`,
    value: user.id,
  }));
  return (
    <ImpersonateUser
      userOptions={userOptions}
      userIdToImageMap={userIdToImageMap}
    />
  );
};

const Home: React.FC = () => {
  const res = useQuery<homeQuery>(
    graphql`
    query homeQuery {
      activeTerms {
        name
        id
        myRegistrations {
          ...home_studentregs
        }
        myFutureRegistrations {
          ...home_futureregs
        }
        myPriorRegistrations {
          ...home_studentregs
        }
        myStaffRegistrations {
          nodes {
            ...home_staffregs
          }
        }
        myProctorRegistrations {
          nodes {
            ...home_proctorregs
          }
        }
        myProfessorCourseRegistrations {
          nodes {
            ...home_profregs
          }
        }
      }
      me {
        admin
      }
    }
    `,
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.data) {
    return <p>Loading...</p>;
  }
  const anyRegistrations = res.data.activeTerms.reduce((prev, cur) => {
    const anyInTerm = cur.myRegistrations.length > 0;
    return prev || anyInTerm;
  }, false);
  if (res.data.activeTerms.length === 0) {
    return (
      <Container>
        <DocumentTitle title="My Exams">
          <h1>There are no courses with exams here yet.</h1>
        </DocumentTitle>
      </Container>
    );
  }
  return (
    <Container>
      <DocumentTitle title="My Exams">
        {anyRegistrations && (
          <Alert variant="warning">
            <div className="text-center"><b><i>Make sure that you are using Chrome or Firefox right now!</i></b></div>
          </Alert>
        )}
        <div>
          {res.data.activeTerms.map((term) => {
            const allEmpty = (
              term.myFutureRegistrations.length === 0
              && term.myRegistrations.length === 0
              && term.myPriorRegistrations.length === 0
              && term.myStaffRegistrations.nodes.length === 0
              && term.myProctorRegistrations.nodes.length === 0
              && term.myProfessorCourseRegistrations.nodes.length === 0
            );
            return (
              <Card className="my-3" key={`home-term-${term.id}`}>
                <Card.Body>
                  <Card.Title>
                    <h1>{term.name}</h1>
                  </Card.Title>
                  {allEmpty && (
                    <p>You have no registrations for this term.</p>
                  )}
                  <ShowUpcomingRegistrations
                    registrations={term.myFutureRegistrations}
                  />
                  <ShowRegistrations
                    name="Active exams"
                    registrations={term.myRegistrations}
                  />
                  <ShowRegistrations
                    name="Prior exams"
                    registrations={term.myPriorRegistrations}
                  />
                  <ShowProctorRegs
                    proctorRegistrations={term.myProctorRegistrations.nodes}
                  />
                  <ShowStaffRegs
                    staffRegistrations={term.myStaffRegistrations.nodes}
                  />
                  <ShowProfRegs
                    professorCourseRegistrations={term.myProfessorCourseRegistrations.nodes}
                  />
                </Card.Body>
              </Card>
            );
          })}
        </div>
        {res.data.me.admin && (
          <Admin />
        )}
      </DocumentTitle>
    </Container>
  );
};

export default Home;
