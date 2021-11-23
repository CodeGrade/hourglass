import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { useMutation, graphql } from 'relay-hooks';
import { DateTime } from 'luxon';
import { ExamInfoEditor } from '@professor/exams/admin';
import { newExamMutation } from './__generated__/newExamMutation.graphql';

const NewExamForm: React.FC<{
  courseId: string;
}> = (props) => {
  const { courseId } = props;
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const [mutate, { loading }] = useMutation<newExamMutation>(
    graphql`
    mutation newExamMutation($input: CreateExamInput!) {
      createExam(input: $input) {
        exam {
          id
        }
      }
    }
    `,
    {
      onCompleted: ({ createExam }) => {
        const { exam } = createExam;
        history.push(`/exams/${exam.id}/admin`);
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating exam.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const today = DateTime.local().startOf('day');
  const todayEnd = today.endOf('day');

  return (
    <>
      <h2>New Exam</h2>
      <ExamInfoEditor
        disabled={loading}
        onSubmit={(examUpdateInfo) => {
          const {
            // eslint-disable-next-line no-shadow
            name, duration, start, end,
          } = examUpdateInfo;
          mutate({
            variables: {
              input: {
                courseId,
                name,
                duration,
                startTime: start,
                endTime: end,
              },
            },
          });
        }}
        onCancel={() => history.push(`/courses/${courseId}`)}
        name=""
        startTime={today}
        endTime={todayEnd}
        duration={5 * 60}
      />
    </>
  );
};

export default NewExamForm;
