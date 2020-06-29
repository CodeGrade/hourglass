import React, { useCallback, useState, useContext } from 'react';
import {
  Row,
  Col,
  InputGroup,
  Button,
  Form,
  Table,
} from 'react-bootstrap';
import {
  useParams,
} from 'react-router-dom';
import { useTabRefresher } from '@hourglass/workflows/professor/exams/admin';
import DateTimePicker from '@professor/exams/new/DateTimePicker';
import Icon from '@student/exams/show/components/Icon';
import { Accommodation, useAccommodationsIndex } from '@hourglass/common/api/professor/accommodations';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import ReadableDate from '@hourglass/common/ReadableDate';
import { BsPencilSquare } from 'react-icons/bs';
import { updateAccommodation } from '@hourglass/common/api/professor/accommodations/update';
import { AlertContext } from '@hourglass/common/alerts';
import { FaTrash } from 'react-icons/fa';
import destroyAccommodation from '@hourglass/common/api/professor/accommodations/destroy';
import Select from 'react-select';
import { useRegistrationsIndex } from '@hourglass/common/api/professor/registrations';
import Loading from '@hourglass/common/loading';
import { createAccommodation } from '@hourglass/common/api/professor/accommodations/create';

const SingleAccommodation: React.FC<{
  refresh: () => void;
  accommodation: Accommodation;
}> = (props) => {
  const {
    refresh,
    accommodation,
  } = props;
  const [editing, setEditing] = useState(false);
  const edit = useCallback(() => setEditing(true), []);
  const stopEdit = useCallback(() => setEditing(false), []);
  const [startTime, setStartTime] = useState(accommodation.startTime);
  const [extraTime, setExtraTime] = useState(accommodation.extraTime);
  const { alert } = useContext(AlertContext);
  const destroy = () => {
    destroyAccommodation(accommodation.id).then((_res) => {
      refresh();
      alert({
        variant: 'success',
        title: 'Successfully deleted accommodation',
        autohide: true,
        message: `Accommodation for '${accommodation.reg.user.displayName}' deleted.`,
      });
    }).catch((err) => {
      alert({
        variant: 'danger',
        title: 'Error deleting accommodation',
        message: err.message,
      });
    });
  };
  const submit = () => {
    updateAccommodation(accommodation.id, {
      startTime,
      extraTime,
    }).then((res) => {
      if (res.success !== true) {
        throw new Error(res.reason);
      }
      setEditing(false);
      refresh();
      alert({
        variant: 'success',
        title: 'Successfully updated accommodation',
        message: `Accommodation for '${accommodation.reg.user.displayName}' updated.`,
      });
    }).catch((err) => {
      setEditing(false);
      alert({
        variant: 'danger',
        title: 'Error updating accommodation',
        message: err.message,
      });
    });
  };
  if (editing) {
    return (
      <tr>
        <td>
          {accommodation.reg.user.displayName}
        </td>
        <td>
          <DateTimePicker
            onChange={setStartTime}
            value={startTime}
            nullable
          />
        </td>
        <td>
          <Form.Control
            type="number"
            min={0}
            value={extraTime}
            onChange={(e) => setExtraTime(Number(e.target.value))}
          />
        </td>
        <td align="right">
          <Button
            variant="success"
            className={editing ? '' : 'd-none'}
            onClick={submit}
          >
            Save
          </Button>
          <Button
            variant="danger"
            onClick={stopEdit}
            className={editing ? 'ml-2' : 'd-none'}
          >
            Cancel
          </Button>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td>
        {accommodation.reg.user.displayName}
      </td>
      <td>
        {accommodation.startTime ? (
          <ReadableDate showTime value={accommodation.startTime} />
        ) : (
          <i>Not set.</i>
        )}
      </td>
      <td>{accommodation.extraTime}</td>
      <td align="right">
        <Button
          variant="danger"
          onClick={destroy}
        >
          <Icon I={FaTrash} />
          <span className="ml-2">
            Delete
          </span>
        </Button>
        <Button
          variant="primary"
          className="ml-2"
          onClick={edit}
        >
          <Icon I={BsPencilSquare} />
          <span className="ml-2">
            Edit
          </span>
        </Button>
      </td>
    </tr>
  );
};

interface Selection {
  label: string;
  value: number;
}

const NewAccommodation: React.FC<{
  refresh: () => void;
}> = (props) => {
  const {
    refresh,
  } = props;
  const { examId } = useParams();
  const res = useRegistrationsIndex(examId);
  const [selected, setSelected] = useState<Selection>(undefined);
  const { alert } = useContext(AlertContext);
  const options = res.type === 'RESULT' ? res.response.registrations.map((r) => ({
    label: r.displayName,
    value: r.id,
  })) : [];
  const submit = () => {
    if (!selected) return;
    createAccommodation(examId, selected.value).then((result) => {
      if (result.success !== true) {
        throw new Error(res.reason);
      }
      refresh();
      alert({
        variant: 'success',
        title: 'Successfully created accommodation',
        autohide: true,
        message: `Accommodation for '${selected.label}' created.`,
      });
    }).catch((err) => {
      refresh();
      alert({
        variant: 'danger',
        title: 'Error creating accommodation',
        message: err.message,
      });
    });
  };
  if (res.type === 'ERROR') {
    return (
      <span className="text-danger">
        <p>
          Something went wrong.
        </p>
        <small>
          {res.text}
        </small>
      </span>
    );
  }
  return (
    <Loading loading={res.type === 'LOADING'}>
      <InputGroup>
        <Select
          value={selected}
          onChange={setSelected}
          className="flex-grow-1"
          options={options}
        />
        <InputGroup.Append>
          <Button
            onClick={submit}
            variant="success"
            disabled={!selected}
          >
            Create accommodation
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Loading>
  );
};

const Loaded: React.FC<{
  refresh: () => void;
  accommodations: Accommodation[];
}> = (props) => {
  const {
    refresh,
    accommodations,
  } = props;
  return (
    <>
      <Form.Group>
        <h2>Accommodations</h2>
        <Table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Start Time</th>
              <th>% Extra Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accommodations.map((acc) => (
              <SingleAccommodation refresh={refresh} key={acc.id} accommodation={acc} />
            ))}
          </tbody>
        </Table>
      </Form.Group>
      <Form.Group as={Row}>
        <Col>
          <NewAccommodation refresh={refresh} />
        </Col>
      </Form.Group>
    </>
  );
};

const ManageAccommodations: React.FC = () => {
  const { examId } = useParams();
  const [refresher, refresh] = useTabRefresher('accommodations');
  const response = useAccommodationsIndex(examId, [refresher]);
  switch (response.type) {
    case 'ERROR':
      return (
        <span className="text-danger">
          <p>{response.text}</p>
          <small>{response.status}</small>
        </span>
      );
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return <Loaded refresh={refresh} accommodations={response.response.accommodations} />;
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

export default ManageAccommodations;
