import React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
// import {
//   Row,
//   Col,
//   Button,
// } from 'react-bootstrap';
// import { QuestionInfo } from '@student/exams/show/types';
// import Question from '@professor/exams/new/editor/containers/Question';

const ShowQuestions: React.FC<WrappedFieldArrayProps> = (props) => {
  console.log(props);
  return (
    <p>Questions</p>
  );
};

// interface QuestionsProps {
//   numQuestions: number;
//   questions: QuestionInfo[];
//   addQuestion: (qnum: number, question: QuestionInfo) => void;
// }
//
// const ShowQuestions: React.FC<QuestionsProps> = (props) => {
//   const {
//     numQuestions,
//     questions,
//     addQuestion,
//   } = props;
//   return (
//     <>
//       <Row className="py-3">
//         <Col>
//           {questions.map((_q, i) => (
//             // eslint-disable-next-line react/no-array-index-key
//             <Question key={i} qnum={i} numQuestions={questions.length} />
//           ))}
//         </Col>
//       </Row>
//       <Row className="text-center">
//         <Col>
//           <Button
//             variant="primary"
//             onClick={(): void => {
//               addQuestion(numQuestions, {
//                 name: {
//                   type: 'HTML',
//                   value: '',
//                 },
//                 description: {
//                   type: 'HTML',
//                   value: '',
//                 },
//                 parts: [],
//                 separateSubparts: false,
//               });
//             }}
//           >
//             Add question
//           </Button>
//         </Col>
//       </Row>
//     </>
//   );
// };

export default ShowQuestions;
