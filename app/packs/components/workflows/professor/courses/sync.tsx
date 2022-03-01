import React, { useContext } from 'react';
import { graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import { AlertContext } from '@hourglass/common/alerts';
import { useMutationWithDefaults } from '@hourglass/common/helpers';

import { syncMutation } from './__generated__/syncMutation.graphql';

const SyncCourse: React.FC<{
  courseId: string;
}> = (props) => {
  const { courseId } = props;
  return (
    <>
      <h2>Sync with Bottlenose</h2>
      <DoSync courseId={courseId} />
    </>
  );
};

export default SyncCourse;

const DoSync: React.FC<{
  courseId: string;
}> = (props) => {
  const { courseId } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, loading] = useMutationWithDefaults<syncMutation>(
    graphql`
    mutation syncMutation($input: SyncCourseToBottlenoseInput!) {
      syncCourseToBottlenose(input: $input) {
        course {
          title
        }
      }
    }
    `,
    {
      onCompleted: ({ syncCourseToBottlenose }) => {
        alert({
          variant: 'success',
          title: 'Course synced',
          message: `${syncCourseToBottlenose.course.title} was synced successfully.`,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error syncing course',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Button
      disabled={loading}
      variant="danger"
      onClick={() => {
        mutate({
          variables: {
            input: {
              courseId,
            },
          },
        });
      }}
    >
      Really sync
    </Button>
  );
};
