import React, { useContext, useState } from 'react';
import {
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import { graphql, useFragment } from 'react-relay';
import { DateTime } from 'luxon';
import { BsPencilSquare } from 'react-icons/bs';
import Icon from '@student/exams/show/components/Icon';
import { AlertContext } from '@hourglass/common/alerts';
import { useMutationWithDefaults } from '@hourglass/common/helpers';
import { ExamTimesViewer, ExamTimesEditor } from './editors';

import { versionTiming$key, versionTiming } from './__generated__/versionTiming.graphql';
import { versionTimingUpdateMutation } from './__generated__/versionTimingUpdateMutation.graphql';

const EditExamVersionTiming: React.FC<{
  examKey: versionTiming$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment versionTiming on Exam {
      id
      startTime
      endTime
      duration
      examVersions(first: 100) @connection(key: "Exam_examVersions", filters: []) {
        edges {
          node {
            id
            name
            startTime
            endTime
            duration
          }
        }
      }
    }
    `,
    examKey,
  );
  const {
    startTime,
    endTime,
    duration,
    examVersions,
  } = res;
  return (
    <>
      {examVersions.edges.map((n) => (
        <ExamVersionInfoEditor
          key={n.node.id}
          examVersionId={n.node.id}
          examStart={DateTime.fromISO(startTime)}
          examEnd={DateTime.fromISO(endTime)}
          examDuration={duration}
          version={n.node}
        />
      ))}
    </>
  );
};
export default EditExamVersionTiming;

const ExamVersionInfoEditor: React.FC<{
  examVersionId: string,
  examStart: DateTime,
  examEnd: DateTime,
  /** duration in seconds */
  examDuration: number,
  version: versionTiming['examVersions']['edges'][number]['node']
}> = (props) => {
  const {
    examVersionId,
    examStart,
    examEnd,
    examDuration,
    version,
  } = props;
  const { alert } = useContext(AlertContext);
  const versionStartTime = version.startTime && DateTime.fromISO(version.startTime);
  const versionEndTime = version.endTime && DateTime.fromISO(version.endTime);
  const versionDuration = version.duration;
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [startTime, setStartTime] = useState(versionStartTime || examStart);
  const [endTime, setEndTime] = useState(versionEndTime || examEnd);
  const [duration, setDuration] = useState<string | number>((versionDuration ?? examDuration) / 60.0);
  const [mutate, loading] = useMutationWithDefaults<versionTimingUpdateMutation>(
    graphql`
    mutation versionTimingUpdateMutation($input: UpdateVersionTimingInput!, $withRubric: Boolean!) {
      updateVersionTiming(input: $input) {
        exam {
          ...admin_checklist
        }
      }
    }
    `,
    {
      onCompleted: () => {
        setShowEditor(false);
        alert({
          variant: 'success',
          autohide: true,
          message: 'Version timing successfully allocated.',
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Version timing not set.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Row className="mb-2">
      <Col>
        <h3 className="clearfix">
          {version.name}
          {showEditor
            ? (
              <span className="float-right">
                <Button
                  variant="danger"
                  disabled={loading}
                  onClick={() => {
                    mutate({
                      variables: {
                        input: {
                          examVersionId,
                          duration: null,
                          startTime: null,
                          endTime: null,
                        },
                        withRubric: true,
                      },
                    });
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="secondary"
                  disabled={loading}
                  className="ml-2"
                  onClick={() => {
                    setStartTime(versionStartTime || examStart);
                    setEndTime(versionEndTime || examEnd);
                    setDuration(versionDuration ?? examDuration);
                    setShowEditor(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={loading}
                  className="ml-2"
                  onClick={() => {
                    mutate({
                      variables: {
                        input: {
                          examVersionId,
                          duration: Number(duration) * 60.0,
                          startTime: startTime.toISO(),
                          endTime: endTime.toISO(),
                        },
                        withRubric: true,
                      },
                    });
                  }}
                >
                  Save
                </Button>
              </span>
            )
            : (
              <span className="float-right">
                <Button onClick={() => setShowEditor(true)}>
                  <Icon I={BsPencilSquare} />
                  <span className="ml-2">
                    Edit
                  </span>
                </Button>
              </span>
            )}
        </h3>
        {showEditor
          ? (
            <ExamTimesEditor
              start={startTime}
              setStart={setStartTime}
              end={endTime}
              setEnd={setEndTime}
              duration={duration}
              setDuration={setDuration}
              unsetPlaceholder="Same as exam"
            />
          )
          : (
            <ExamTimesViewer
              startTime={versionStartTime}
              endTime={versionEndTime}
              duration={versionDuration}
              placeholder="Same as exam"
            />
          )}
      </Col>
    </Row>
  );
};
