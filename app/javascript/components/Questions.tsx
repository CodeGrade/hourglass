import React, { useContext } from 'react';
import { QuestionInfo } from '@hourglass/types';
import ShowQuestion from '@hourglass/containers/ShowQuestion';
import SubmitButton from '@hourglass/containers/SubmitButton';
import { RailsContext } from '@hourglass/context';
import Body from '@hourglass/components/Body';
import { Row, Col } from 'react-bootstrap';

interface QuestionsProps {
  questions: QuestionInfo[];
}

const Questions: React.FC<QuestionsProps> = (props) => {
  const {
    questions,
  } = props;
  const { railsExam } = useContext(RailsContext);
  const { id } = railsExam;
  const showEnd = true; // !paginated || onLastPage;
  const submitClass = showEnd ? 'text-center' : 'd-none';
  return (
    <Row>
      <Col>
        <div>
          <div>
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
          </div>
          <div className={submitClass}>
            <SubmitButton examID={id} />
          </div>
        </div>
      </Col>
    </Row>
  );
};
export default Questions;
