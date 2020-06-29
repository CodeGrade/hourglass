import React, { useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { ExamInfoEditor } from '@professor/exams/admin';
import createExam from '@hourglass/common/api/professor/exams/create';

const NewExam: React.FC = () => (
  <div>
    <h2>New Exam</h2>
    <NewExamForm />
  </div>
);

export default NewExam;

const NewExamForm: React.FC = () => {
  const { courseId } = useParams();
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  return (
    <ExamInfoEditor
      onCancel={(): void => {
        history.push(`/courses/${courseId}`);
      }}
      onSubmit={(info): void => {
        createExam(courseId, info)
          .then((res) => {
            if (res.created === false) {
              throw new Error(res.reason);
            }
            return res;
          })
          .then(({ id }) => {
            history.push(`/exams/${id}/admin`);
            alert({
              variant: 'success',
              autohide: true,
              message: 'Exam created successfully.',
            });
          })
          .catch((err) => {
            alert({
              variant: 'danger',
              title: 'Error creating exam.',
              message: err.message,
            });
          });
      }}
    />
  );
};
