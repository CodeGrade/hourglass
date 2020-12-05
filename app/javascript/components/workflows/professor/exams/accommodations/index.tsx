import React, { useCallback, useState, useContext } from 'react';
import {
  Row,
  Col,
  InputGroup,
  Button,
  Form,
  Table,
} from 'react-bootstrap';
import DateTimePicker from '@professor/exams/new/DateTimePicker';
import Icon from '@student/exams/show/components/Icon';
import ReadableDate from '@hourglass/common/ReadableDate';
import { NumericInput } from '@hourglass/common/NumericInput';
import { BsPencilSquare } from 'react-icons/bs';
import { AlertContext } from '@hourglass/common/alerts';
import { SelectOption, SelectOptions } from '@hourglass/common/helpers';
import { FaTrash } from 'react-icons/fa';
import Select from 'react-select';
import { DateTime } from 'luxon';
import { useMutation, graphql, useFragment } from 'relay-hooks';

import { accommodations_all$key } from './__generated__/accommodations_all.graphql';
import { accommodations_accommodation$key } from './__generated__/accommodations_accommodation.graphql';
import { accommodations_regsWithout$key } from './__generated__/accommodations_regsWithout.graphql';
import { accommodationsCreateMutation } from './__generated__/accommodationsCreateMutation.graphql';
import { accommodationsUpdateMutation } from './__generated__/accommodationsUpdateMutation.graphql';
import { accommodationsDestroyMutation } from './__generated__/accommodationsDestroyMutation.graphql';

const AccommodationEditor: React.FC<{
  disabled?: boolean;
  submit: (startTime: DateTime, extraTime: number) => void;
  cancel: () => void;
  newStartTime: DateTime;
  percentTimeExpansion: number;
  displayName: string;
}> = (props) => {
  const {
    disabled = false,
    submit,
    cancel,
    displayName,
    newStartTime,
    percentTimeExpansion,
  } = props;
  const [startTime, setStartTime] = useState(newStartTime);
  const [extraTime, setExtraTime] = useState<number | string>(`${percentTimeExpansion}`);
  return (
    <tr>
      <td className="align-middle">
        {displayName}
      </td>
      <td>
        <DateTimePicker
          disabled={disabled}
          onChange={setStartTime}
          value={startTime}
          nullable
        />
      </td>
      <td>
        <NumericInput
          disabled={disabled}
          min={0}
          value={extraTime}
          onChange={setExtraTime}
        />
      </td>
      <td align="right" className="text-nowrap">
        <Button
          disabled={disabled}
          variant="secondary"
          onClick={cancel}
        >
          Cancel
        </Button>
        <Button
          disabled={disabled}
          variant="primary"
          className="ml-2"
          onClick={() => submit(startTime, Number(extraTime))}
        >
          Save
        </Button>
      </td>
    </tr>
  );
};

const SingleAccommodation: React.FC<{
  examId: string;
  accommodationKey: accommodations_accommodation$key;
}> = (props) => {
  const {
    examId,
    accommodationKey,
  } = props;
  const accommodation = useFragment(
    graphql`
    fragment accommodations_accommodation on Accommodation {
      id
      newStartTime
      percentTimeExpansion
      registration {
        id
        user {
          displayName
        }
      }
    }
    `,
    accommodationKey,
  );
  const [editing, setEditing] = useState(false);
  const edit = useCallback(() => setEditing(true), []);
  const stopEdit = useCallback(() => setEditing(false), []);
  const { alert } = useContext(AlertContext);
  const [destroy, { loading: destroyLoading }] = useMutation<accommodationsDestroyMutation>(
    graphql`
    mutation accommodationsDestroyMutation($input: DestroyAccommodationInput!) {
      destroyAccommodation(input: $input) {
        registrationEdge {
          node {
            id
            user {
              displayName
            }
          }
        }
        deletedId
      }
    }
    `,
    {
      onCompleted: () => {
        alert({
          variant: 'success',
          title: 'Successfully deleted accommodation',
          autohide: true,
          message: `Accommodation for '${accommodation.registration.user.displayName}' deleted.`,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error deleting accommodation',
          message: err.message,
          copyButton: true,
        });
      },
      configs: [
        {
          type: 'RANGE_ADD',
          parentID: examId,
          connectionInfo: [{
            key: 'Exam_registrationsWithoutAccommodation',
            rangeBehavior: 'append',
          }],
          edgeName: 'registrationEdge',
        },
        {
          type: 'RANGE_DELETE',
          parentID: examId,
          connectionKeys: [{
            key: 'Exam_accommodations',
          }],
          pathToConnection: ['exam', 'accommodations'],
          deletedIDFieldName: 'deletedId',
        },
      ],
    },
  );
  const [update, { loading: updateLoading }] = useMutation<accommodationsUpdateMutation>(
    graphql`
    mutation accommodationsUpdateMutation($input: UpdateAccommodationInput!) {
      updateAccommodation(input: $input) {
        accommodation {
          id
          newStartTime
          percentTimeExpansion
        }
      }
    }
    `,
    {
      onCompleted: () => {
        setEditing(false);
        alert({
          variant: 'success',
          title: 'Successfully updated accommodation',
          autohide: true,
          message: `Accommodation for '${accommodation.registration.user.displayName}' updated.`,
        });
      },
      onError: (err) => {
        setEditing(false);
        alert({
          variant: 'danger',
          title: 'Error updating accommodation',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const submit = (newStartTime: DateTime, percentTimeExpansion: number) => {
    update({
      variables: {
        input: {
          accommodationId: accommodation.id,
          newStartTime: newStartTime?.toISO(),
          percentTimeExpansion,
        },
      },
    });
  };
  const loading = destroyLoading || updateLoading;
  if (editing) {
    return (
      <AccommodationEditor
        disabled={loading}
        displayName={accommodation.registration.user.displayName}
        newStartTime={accommodation.newStartTime ? (
          DateTime.fromISO(accommodation.newStartTime)
        ) : undefined}
        percentTimeExpansion={accommodation.percentTimeExpansion}
        cancel={stopEdit}
        submit={submit}
      />
    );
  }
  return (
    <tr>
      <td className="align-middle">
        {accommodation.registration.user.displayName}
      </td>
      <td className="align-middle">
        {accommodation.newStartTime ? (
          <ReadableDate showTime value={DateTime.fromISO(accommodation.newStartTime)} />
        ) : (
          <i>Not set.</i>
        )}
      </td>
      <td className="align-middle">{accommodation.percentTimeExpansion}</td>
      <td align="right" className="text-nowrap">
        <Button
          disabled={loading}
          variant="danger"
          onClick={() => {
            destroy({
              variables: {
                input: {
                  accommodationId: accommodation.id,
                },
              },
            });
          }}
        >
          <Icon I={FaTrash} size="1.25em" />
          <span className="ml-2">
            Delete
          </span>
        </Button>
        <Button
          disabled={loading}
          variant="primary"
          className="ml-2"
          onClick={edit}
        >
          <Icon I={BsPencilSquare} size="1.25em" />
          <span className="ml-2">
            Edit
          </span>
        </Button>
      </td>
    </tr>
  );
};

type Selection = SelectOption<string>;

const NewAccommodation: React.FC<{
  exam: accommodations_regsWithout$key;
}> = (props) => {
  const {
    exam,
  } = props;
  const [selected, setSelected] = useState<Selection>(null);
  const { alert } = useContext(AlertContext);
  const regsNoAccommodation = useFragment(
    graphql`
    fragment accommodations_regsWithout on Exam {
      id
      registrationsWithoutAccommodation(first: 100000) @connection(key: "Exam_registrationsWithoutAccommodation", filters: []) {
        edges {
          node {
            id
            user {
              displayName
            }
          }
        }
      }
    }
    `,
    exam,
  );
  const sorted: SelectOptions<string> = [
    ...regsNoAccommodation.registrationsWithoutAccommodation.edges,
  ].sort(
    (a, b) => a.node.user.displayName.localeCompare(b.node.user.displayName),
  ).map(({ node }) => ({
    label: node.user.displayName,
    value: node.id,
  }));
  const [create, { loading }] = useMutation<accommodationsCreateMutation>(
    graphql`
    mutation accommodationsCreateMutation($input: CreateAccommodationInput!) {
      createAccommodation(input: $input) {
        accommodation {
          ...accommodations_accommodation
        }
        accommodationEdge {
          node {
            id
          }
        }
        registrationId
      }
    }
    `,
    {
      onCompleted: () => {
        setSelected(null);
        alert({
          variant: 'success',
          title: 'Successfully created accommodation',
          autohide: true,
          message: `Accommodation for '${selected.label}' created.`,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating accommodation',
          message: err.message,
          copyButton: true,
        });
      },
      configs: [
        {
          type: 'RANGE_ADD',
          parentID: regsNoAccommodation.id,
          connectionInfo: [{
            key: 'Exam_accommodations',
            rangeBehavior: 'append',
          }],
          edgeName: 'accommodationEdge',
        },
        {
          type: 'RANGE_DELETE',
          parentID: regsNoAccommodation.id,
          connectionKeys: [{
            key: 'Exam_registrationsWithoutAccommodation',
          }],
          pathToConnection: ['exam', 'registrationsWithoutAccommodation'],
          deletedIDFieldName: 'registrationId',
        },
      ],
    },
  );
  const submit = () => {
    if (!selected) return;
    create({
      variables: {
        input: {
          registrationId: selected.value,
        },
      },
    });
  };

  return (
    <InputGroup>
      <Select
        disabled={loading}
        isClearable
        value={selected}
        onChange={setSelected}
        className="flex-grow-1"
        options={sorted}
      />
      <InputGroup.Append>
        <Button
          onClick={submit}
          variant="success"
          disabled={!selected || loading}
        >
          Create accommodation
        </Button>
      </InputGroup.Append>
    </InputGroup>
  );
};

const ManageAccommodations: React.FC<{
  exam: accommodations_all$key;
}> = (props) => {
  const {
    exam,
  } = props;
  const res = useFragment(
    graphql`
    fragment accommodations_all on Exam {
      id
      ...accommodations_regsWithout
      accommodations(first: 100000) @connection(key: "Exam_accommodations", filters: []) {
        edges {
          node {
            id
            registration {
              user {
                displayName
              }
            }
            ...accommodations_accommodation
          }
        }
      }
    }
    `,
    exam,
  );
  const { accommodations } = res;
  const sorted = [...accommodations.edges].sort(
    (a, b) => a.node.registration.user.displayName.localeCompare(
      b.node.registration.user.displayName,
    ),
  );
  return (
    <>
      <Form.Group>
        <h2>Accommodations</h2>
        <Table>
          <thead>
            <tr>
              <Col as="th" sm="auto">Student</Col>
              <Col as="th">Start Time</Col>
              <Col as="th" sm="auto" className="text-nowrap">% Extra Time</Col>
              <Col as="th" sm="auto">Actions</Col>
            </tr>
          </thead>
          <tbody>
            {sorted.map((edge) => (
              <SingleAccommodation
                examId={res.id}
                key={edge.node.id}
                accommodationKey={edge.node}
              />
            ))}
          </tbody>
        </Table>
      </Form.Group>
      <Form.Group as={Row}>
        <Col>
          <NewAccommodation exam={res} />
        </Col>
      </Form.Group>
    </>
  );
};

export default ManageAccommodations;
