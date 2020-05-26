import React from 'react';
import Routes from '@hourglass/routes';

const TakeExamLink: React.FC<{
  course: Course;
  exam: Exam;
}> = (props) => {
  const {
    course,
    exam,
  } = props;
  const url = Routes.take_exam_path(course.id, exam.id);
  return (
    <a
      href={url}
    >
      {exam.name}
    </a>
  );
};

interface StudentRegsProps {
  regs: Reg[];
  regInfo: RegInfo;
}

const StudentRegs: React.FC<StudentRegsProps> = (props) => {
  const {
    regs,
    regInfo,
  } = props;
  return (
    <>
      <h1>Take an Exam</h1>
      <ul>
        {regs.map((reg) => {
          const info = regInfo[reg.id];
          return (
            <li
              key={reg.id}
            >
              <TakeExamLink
                exam={info.exam}
                course={info.course}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
};

interface ProctorRegsProps {
  regs: Reg[];
  regInfo: RegInfo;
}

const ProctorRegs: React.FC<ProctorRegsProps> = (props) => {
  const {
    regs,
  } = props;
  return (
    <>
      <h1>Proctor an Exam</h1>
      <p>{JSON.stringify(regs)}</p>
    </>
  );
};

interface Reg {
  id: number;
}

interface Exam {
  id: number;
  name: string;
}

interface Course {
  id: number;
}

interface RegInfo {
  [regId: number]: {
    exam: Exam;
    course: Course;
  };
}

interface OverviewProps {
  regs: {
    student: Reg[];
    proctor: Reg[];
  };
  regInfo: RegInfo;
}

const Overview: React.FC<OverviewProps> = (props) => {
  const {
    regs: {
      student,
      proctor,
    },
    regInfo,
  } = props;
  const hasStudentExams = student.length !== 0;
  const hasProctorExams = proctor.length !== 0;
  return (
    <div>
      {hasStudentExams && <StudentRegs regs={student} regInfo={regInfo} />}
      {hasProctorExams && <ProctorRegs regs={proctor} regInfo={regInfo} />}
    </div>
  );
};

export default Overview;
