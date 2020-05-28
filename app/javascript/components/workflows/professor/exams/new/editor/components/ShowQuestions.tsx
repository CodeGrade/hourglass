import React from 'react';
import {
  Row,
  Col,
} from 'react-bootstrap';
import { QuestionInfo } from '@student/exams/show/types';
import Question from '@professor/exams/new/editor/containers/Question';

interface QuestionsProps {
  questions: QuestionInfo[];
}

const ShowQuestions: React.FC<QuestionsProps> = (props) => {
  const { questions } = props;
  return (
    <Row className="py-3">
      <Col>
        {questions.map((_q, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Question key={i} qnum={i} numQuestions={questions.length} />
        ))}
      </Col>
    </Row>
  );
};

export default ShowQuestions;
