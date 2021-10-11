import React, { useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import AskQuestion from '@student/exams/show/components/navbar/AskQuestion';
import { ShowExamMessages } from '@student/exams/show/components/navbar/ExamMessages';
import { DateTime } from 'luxon';
import { useFragment, graphql } from 'relay-hooks';

import { AnomalousMessaging$key } from './__generated__/AnomalousMessaging.graphql';

const AnomalousMessaging: React.FC<{
  examKey: AnomalousMessaging$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const [lastViewed, setLastViewed] = useState(DateTime.local());
  const res = useFragment(
    graphql`
    fragment AnomalousMessaging on Exam {
      ...AskQuestion
      ...ExamMessages_all
    }
    `,
    examKey,
  );
  return (
    <Row>
      <Col>
        <Card>
          <Card.Body>
            <Card.Title>
              <h2>Ask a question</h2>
            </Card.Title>
            <AskQuestion examKey={res} />
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card>
          <Card.Body>
            <Card.Title>
              <h2>Received Messages</h2>
            </Card.Title>
            <ShowExamMessages
              examKey={res}
              lastViewed={lastViewed}
              onMessagesOpened={() => {
                setLastViewed(DateTime.local());
              }}
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AnomalousMessaging;
