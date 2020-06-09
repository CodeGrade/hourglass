import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { Version, versionUpdate } from '@hourglass/common/api/professor/exams/versions/update';
import { useParams, useHistory } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';

interface SubmitProps {
  version: Version;
}

const Submit: React.FC<SubmitProps> = (props) => {
  const {
    version,
  } = props;
  const history = useHistory();
  const { examId, versionId } = useParams();
  const { alert } = useContext(AlertContext);
  return (
    <>
      <Button
        variant="danger"
        onClick={(): void => {
          history.goBack();
        }}
      >
        Cancel
      </Button>
      <Button
        variant="success"
        onClick={(): void => {
          versionUpdate(versionId, { version }).then((res) => {
            if (res.updated === false) {
              alert({
                variant: 'danger',
                title: 'Exam not updated',
                message: <pre>{res.reason}</pre>,
              });
            } else {
              history.push(`/exams/${examId}/admin`);
              alert({
                variant: 'danger',
                message: 'Exam updated successfully.',
              });
            }
          });
        }}
      >
        Submit
      </Button>
    </>
  );
};

export default Submit;
