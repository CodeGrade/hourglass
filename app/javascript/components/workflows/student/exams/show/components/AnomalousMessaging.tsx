import React, { useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import AskQuestion from '@student/exams/show/containers/navbar/AskQuestion';
import { ExamMessagesStandalone } from '@student/exams/show/containers/navbar/ExamMessages';

const AnomalousMessaging: React.FC<{
  examQuestionsUrl: string;
  disabled: boolean;
  refreshMessages: () => void;
  loadQuestions: () => void;
}> = (props) => {
  const {
    examQuestionsUrl,
    disabled,
    refreshMessages,
    loadQuestions,
  } = props;
  useEffect(() => {
    loadQuestions();
    refreshMessages();
    const timer = setInterval(refreshMessages, 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <Row>
      <Col>
        <Card>
          <Card.Body>
            <Card.Title>
              <h2>Ask a question</h2>
            </Card.Title>
            <AskQuestion
              disabled={disabled}
              examQuestionsUrl={examQuestionsUrl}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card>
          <Card.Body>
            <Card.Title>
              <h2>Received Messages</h2>
            </Card.Title>
            <ExamMessagesStandalone disabled={disabled} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AnomalousMessaging;
