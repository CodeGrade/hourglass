import React, { useContext } from 'react';
import { QuestionInfo } from '@hourglass/types';
import ShowQuestion from '@hourglass/components/ShowQuestion';
import Pagination from '@hourglass/components/Pagination';
import SubmitButton from '@hourglass/containers/SubmitButton';
import { RailsContext } from '@hourglass/context';
import Body from '@hourglass/components/Body';
import { Row, Col } from 'react-bootstrap';

interface QuestionsProps {
  questions: QuestionInfo[];
  paginated: boolean;
  selectedQuestion: number;
}

const Questions: React.FC<QuestionsProps> = (props) => {
  const {
    questions,
    paginated,
    selectedQuestion,
  } = props;
  const { railsExam } = useContext(RailsContext);
  const { id } = railsExam;
  return (
    <Row>
      <Col>
        <Pagination
          current={selectedQuestion}
          paginated={paginated}
          max={questions.length}
          endItem={(
            <div className="text-center">
              <SubmitButton examID={id} />
            </div>
          )}
        >
          {questions.map((q, i) => (
            <ShowQuestion
              // Question numbers are STATIC.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              question={q}
              qnum={i}
              BodyRenderer={Body}
            />
          ))}
        </Pagination>
      </Col>
    </Row>
  );
};
export default Questions;
