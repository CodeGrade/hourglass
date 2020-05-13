import React, { useContext } from 'react';
import { QuestionInfo } from '@hourglass/types';
import ShowQuestion from '@hourglass/components/ShowQuestion';
import SubmitButton from '@hourglass/containers/SubmitButton';
import { RailsContext } from '@hourglass/context';
import Body from '@hourglass/components/Body';
import { Row, Col } from 'react-bootstrap';
import PaginationArrows from '@hourglass/containers/PaginationArrows';

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
  const onFirstPage = selectedQuestion === 0;
  const onLastPage = selectedQuestion === questions.length - 1;
  const showEnd = !paginated || onLastPage;
  const submitClass = showEnd ? 'text-center' : 'd-none';
  const arrowsClass = paginated ? '' : 'd-none';
  return (
    <Row>
      <Col>
        <div>
          <div>
            {questions.map((q, i) => {
              const isCurrent = selectedQuestion === i;
              const active = !paginated || isCurrent;
              const activeClass = active ? '' : 'd-none';
              return (
                // Page indices are STATIC.
                // eslint-disable-next-line react/no-array-index-key
                <div key={i} className={activeClass}>
                  <div>
                    <ShowQuestion
                      // Question numbers are STATIC.
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      question={q}
                      qnum={i}
                      BodyRenderer={Body}
                    />
                  </div>
                  <div className={arrowsClass}>
                    <PaginationArrows
                      showNext={!onLastPage}
                      showBack={!onFirstPage}
                    />
                  </div>
                </div>
              );
            })}
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
