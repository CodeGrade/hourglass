import React, { useContext, useEffect, useState } from 'react';
import { RailsContext } from '@student/exams/show/context';
import RegularNavbar from '@hourglass/common/navbar';
import { RailsUser } from '@student/exams/show/types';
import { Container } from 'react-bootstrap';
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useParams,
} from 'react-router-dom';
import { getCSRFToken } from '@student/exams/show/helpers';
import * as ApiMe from '@hourglass/common/api/me';
import * as ApiStudentExamsShow from '@hourglass/common/api/student/exams/show';
import * as ApiStudentReg from '@hourglass/common/api/student/registrations';
import * as ApiProfessorCourses from '@hourglass/common/api/professor/courses';
import ShowExam from '@student/exams/show';

interface StudentRegsProps {
  regs: ApiStudentReg.Reg[];
  regInfo: ApiStudentReg.RegInfo;
}

const StudentRegs: React.FC<StudentRegsProps> = (props) => {
  const {
    regs,
    regInfo,
  } = props;
  if (regs.length === 0) return null;
  return (
    <>
      <h1>Take an Exam</h1>
      <ul>
        {regs.map((reg) => {
          const { exam } = regInfo[reg.id];
          return (
            <li
              key={reg.id}
            >
              <Link
                to={`/exams/${exam.id}/take`}
              >
                {exam.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

interface ProfessorCoursesProps {
  courses: ApiProfessorCourses.Course[];
}

const ProfessorRegs: React.FC<ProfessorCoursesProps> = (props) => {
  const {
    courses,
  } = props;
  if (courses.length === 0) return null;
  return (
    <>
      <h1>Create an Exam</h1>
      <ul>
        {courses.map((c) => (
          <li
            key={c.id}
          >
            <Link
              to={`/courses/${c.id}/exams/new`}
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

const Exams: React.FC<{}> = () => {
  const studentResponse = ApiStudentReg.useResponse();
  const profResponse = ApiProfessorCourses.useResponse();
  return (
    <div>
      {studentResponse.response && (
        <StudentRegs
          regs={studentResponse.response.regs}
          regInfo={studentResponse.response.regInfo}
        />
      )}
      {profResponse.response && (
        <ProfessorRegs
          courses={profResponse.response.courses}
        />
      )}
    </div>
  );
};

const Home: React.FC<{}> = () => {
  return (
    <>
      <RegularNavbar />
      <Container>
        <Exams />
      </Container>
    </>
  );
};

const Exam = () => {
  const { examId } = useParams();
  const { railsUser } = useContext(RailsContext);
  const showRes = ApiStudentExamsShow.useResponse(examId);
  if (!showRes.response) {
    return <p>Loading...</p>;
  }
  const { response } = showRes;
  return (
    <ShowExam
      railsUser={railsUser}
      railsExam={response.railsExam}
      railsCourse={response.railsCourse}
      railsRegistration={response.railsRegistration}
      final={response.final}
    />
  );
};

const Entry: React.FC<{}> = () => {
  const res = ApiMe.useResponse();
  return (
    <RailsContext.Provider
      value={{
        railsUser: res.response?.user,
      }}
    >
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/exams/:examId">
            <Exam />
          </Route>
          <Route path="*">
            <RegularNavbar />
            <Container>
              TODO
            </Container>
          </Route>
        </Switch>
      </BrowserRouter>
    </RailsContext.Provider>
  );
};

export default Entry;
