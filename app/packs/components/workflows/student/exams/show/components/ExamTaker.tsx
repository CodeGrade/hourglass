import React, { useMemo, useState } from 'react';
import ExamNavbar from '@student/exams/show/containers/navbar';
import RegularNavbar from '@hourglass/common/navbar';
import { Row, Col, Container } from 'react-bootstrap';
import ExamShowContents from '@student/exams/show/containers/ExamShowContents';
import PreStart from '@student/exams/show/containers/PreStart';
import './ExamTaker.scss';
import { useFragment, graphql } from 'react-relay';

import { ExamTaker$key } from './__generated__/ExamTaker.graphql';

interface ExamTakerProps {
  examKey: ExamTaker$key;
  ready: boolean;
}

const ExamTaker: React.FC<ExamTakerProps> = (props) => {
  const {
    examKey,
    ready,
  } = props;
  const res = useFragment(
    graphql`
    fragment ExamTaker on Exam {
      ...PreStart
      ...ExamShowContents
      ...navbar
      id
      takeUrl
      myRegistration {
        examVersion {
          policies
        }
        policyExemptions
      }
    }
    `,
    examKey,
  );
  const [baseSize, setBaseSize] = useState(100);
  const baseFontStyle = useMemo(() => ({
    fontSize: `${baseSize / 100}em`,
  }), [baseSize]);
  const body = ready ? (
    <div id="exam-taker" className="d-flex" style={baseFontStyle}>
      <ExamNavbar examKey={res} setBaseSize={setBaseSize} />
      <Container fluid className="flex-fill transition">
        <Row
          id="exam-body"
          className="py-3"
        >
          <Col>
            <ExamShowContents
              examKey={res}
              examTakeUrl={res.takeUrl}
            />
          </Col>
        </Row>
      </Container>
    </div>
  ) : (
    <>
      <RegularNavbar />
      <Container>
        <PreStart
          examKey={res}
          policies={res.myRegistration.examVersion.policies}
          policyExemptions={res.myRegistration.policyExemptions}
          examTakeUrl={res.takeUrl}
        />
      </Container>
    </>
  );
  return body;
};
export default ExamTaker;
