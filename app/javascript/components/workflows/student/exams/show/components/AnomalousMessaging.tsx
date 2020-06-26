import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import AskQuestion from '@student/exams/show/containers/navbar/AskQuestion';
import { ExamMessagesStandalone } from '@student/exams/show/containers/navbar/ExamMessages';

const AnomalousMessaging: React.FC<{
  refreshMessages: () => void;
  loadQuestions: () => void;
}> = (props) => {
  const {
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
    <>
      <Card>
        <Card.Title>
          <h2>Ask a question</h2>
        </Card.Title>
        <Card.Body>
          <AskQuestion />
        </Card.Body>
      </Card>
      <Card>
        <Card.Title>
          <h2>Received Messages</h2>
        </Card.Title>
        <Card.Body>
          <ExamMessagesStandalone />
        </Card.Body>
      </Card>
    </>
  );
};

export default AnomalousMessaging;
