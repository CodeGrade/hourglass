import React, { useCallback, useState, useContext } from 'react';
import {
  Row,
  Col,
  InputGroup,
  Button,
  Form,
  Table,
  DropdownButton,
  Dropdown,
} from 'react-bootstrap';
import DateTimePicker from '@professor/exams/new/DateTimePicker';
import Icon from '@student/exams/show/components/Icon';
import ReadableDate from '@hourglass/common/ReadableDate';
import { NumericInput } from '@hourglass/common/NumericInput';
import { BsCheck2Square, BsPencilSquare } from 'react-icons/bs';
import { FaTrash } from 'react-icons/fa';
import { LuUndo2 } from 'react-icons/lu';
import { AlertContext } from '@hourglass/common/alerts';
import {
  pluralize,
  SelectOption,
  SelectOptions,
  useMutationWithDefaults,
} from '@hourglass/common/helpers';
import Select from 'react-select';
import { DateTime } from 'luxon';
import { graphql, useFragment } from 'react-relay';

import { PolicyExemption } from '@hourglass/workflows/student/exams/show/types';
import { accommodations_all$key } from './__generated__/accommodations_all.graphql';
import { accommodations_accommodation$key } from './__generated__/accommodations_accommodation.graphql';
import { accommodations_regsWithout$key } from './__generated__/accommodations_regsWithout.graphql';
import { accommodationsCopyMutation } from './__generated__/accommodationsCopyMutation.graphql';
import { accommodationsCreateMutation } from './__generated__/accommodationsCreateMutation.graphql';
import { accommodationsUpdateMutation } from './__generated__/accommodationsUpdateMutation.graphql';
import { accommodationsDestroyMutation } from './__generated__/accommodationsDestroyMutation.graphql';

export interface PolicyExemptionsProps {
  value: readonly PolicyExemption[];
  disabled?: boolean;
  onChange: (newPolicies: PolicyExemption[]) => void;
  className?: string;
}

export const policyToString: Record<PolicyExemption, string> = {
  IGNORE_LOCKDOWN: 'Ignore lockdown',
  TOLERATE_WINDOWED: 'Tolerate windowed mode',
  IGNORE_PIN: 'Bypass student PIN for login',
};

const allPolicies: PolicyExemption[] = Object.keys(policyToString) as PolicyExemption[];

type PolicyExemptionOption = SelectOption<PolicyExemption>;
type PolicyExemptionOptions = SelectOptions<PolicyExemption>;

const policyValues: PolicyExemptionOptions = allPolicies.map((policy) => ({
  value: policy,
  label: policyToString[policy],
}));

const Policies: React.FC<PolicyExemptionsProps> = (props) => {
  const {
    value,
    disabled = false,
    onChange,
    className,
  } = props;
  const curPolicyValues = value.map((p) => policyValues.find((pv) => pv.value === p));
  return (
    <Form.Group as={Row} className={className} controlId="examPolicies">
      <Col>
        <Select
          className="basic-multi-select z-1000"
          isMulti
          isDisabled={disabled}
          placeholder="Choose policies exemptions..."
          options={policyValues}
          value={curPolicyValues}
          onChange={(options: PolicyExemptionOption[]): void => (
            onChange((options ?? []).map((o) => o.value))
          )}
        />
      </Col>
    </Form.Group>
  );
};

const AccommodationEditor: React.FC<{
  disabled?: boolean;
  submit: (startTime: DateTime, extraTime: number, policies: readonly PolicyExemption[]) => void;
  cancel: () => void;
  newStartTime: DateTime;
  percentTimeExpansion: number;
  policyExemptions: readonly PolicyExemption[];
  displayName: string;
}> = (props) => {
  const {
    disabled = false,
    submit,
    cancel,
    displayName,
    newStartTime,
    percentTimeExpansion,
    policyExemptions,
  } = props;
  const [startTime, setStartTime] = useState(newStartTime);
  const [extraTime, setExtraTime] = useState<number | string>(`${percentTimeExpansion}`);
  const [policies, setPolicies] = useState(policyExemptions);
  return (
    <>
      <tr>
        <td className="align-middle" rowSpan={2}>
          {displayName}
        </td>
        <td className="border-bottom-0">
          <DateTimePicker
            disabled={disabled}
            onChange={setStartTime}
            value={startTime}
            nullable
          />
        </td>
        <td className="border-bottom-0">
          <NumericInput
            disabled={disabled}
            min={0}
            value={extraTime}
            onChange={setExtraTime}
          />
        </td>
        <td align="right" rowSpan={2} className="align-middle text-nowrap">
          <Button
            disabled={disabled}
            variant="secondary"
            onClick={cancel}
          >
            <Icon I={LuUndo2} size="1.25em" />
            <span className="ml-2">
              Cancel
            </span>
          </Button>
          <Button
            disabled={disabled}
            variant="primary"
            className="ml-2"
            onClick={() => submit(startTime, Number(extraTime), policies)}
          >
            <Icon I={BsCheck2Square} size="1.25em" />
            <span className="ml-2">
              Save
            </span>
          </Button>
        </td>
      </tr>
      <tr>
        <td className="border-top-0 pt-0" colSpan={2}>
          <Policies className="mb-0 py-0" value={policies} onChange={setPolicies} />
        </td>
      </tr>
    </>
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
      policyExemptions
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
  const [destroy, destroyLoading] = useMutationWithDefaults<accommodationsDestroyMutation>(
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
  const [update, updateLoading] = useMutationWithDefaults<accommodationsUpdateMutation>(
    graphql`
    mutation accommodationsUpdateMutation($input: UpdateAccommodationInput!) {
      updateAccommodation(input: $input) {
        accommodation {
          id
          newStartTime
          percentTimeExpansion
          policyExemptions
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
  const submit = (
    newStartTime: DateTime,
    percentTimeExpansion: number,
    policyExemptions: PolicyExemption[],
  ) => {
    update({
      variables: {
        input: {
          accommodationId: accommodation.id,
          newStartTime: newStartTime?.toISO(),
          percentTimeExpansion,
          policyExemptions,
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
        policyExemptions={accommodation.policyExemptions}
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
      <td className="py-2 w-100 pl-0" colSpan={2}>
        <table className="w-100">
          <tbody className="border-0">
            <tr>
              <td className="align-middle border-top-0">
                {accommodation.newStartTime ? (
                  <ReadableDate showTime value={DateTime.fromISO(accommodation.newStartTime)} />
                ) : (
                  <i>Not set.</i>
                )}
              </td>
              <td className="align-middle border-top-0" width="5%">
                {accommodation.percentTimeExpansion}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="border-top-0">
                {accommodation.policyExemptions.map((l) => policyToString[l]).join(', ') || (<i>No exemptions</i>)}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
      <td align="right" className="align-middle text-nowrap" width={20}>
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
          <span className="ml-2 mr-1">
            Delete
          </span>
        </Button>
        <Button
          disabled={loading}
          variant="primary"
          className="ml-2"
          onClick={edit}
          style={{ minWidth: '5.5em' }}
        >
          <Icon I={BsPencilSquare} size="1.25em" className="float-left" />
          <span className="float-right">
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
  const [create, loading] = useMutationWithDefaults<accommodationsCreateMutation>(
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
        isDisabled={loading}
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
  const { alert } = useContext(AlertContext);
  const res = useFragment(
    graphql`
    fragment accommodations_all on Exam {
      id
      course {
        exams {
          id
          name
        }
      }
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
  const { accommodations, course: { exams } } = res;
  const sorted = [...accommodations.edges].sort(
    (a, b) => a.node.registration.user.displayName.localeCompare(
      b.node.registration.user.displayName,
    ),
  );
  const [copy, loading] = useMutationWithDefaults<accommodationsCopyMutation>(
    graphql`
    mutation accommodationsCopyMutation($input: CopyAccommodationsInput!) {
      copyAccommodation(input: $input) {
        sourceExam { 
          name
        }
        duplicateCount
        exam {
          name
          accommodations(first: 100000) @connection(key: "Exam_accommodations", filters: []) {
            edges {
              node {
                ...accommodations_accommodation
              }
            }
          }
        }
      }
    }
    `,
    {
      onCompleted: (response) => {
        const {
          sourceExam: { name: sourceName },
          exam: { name: destName },
          duplicateCount,
        } = response.copyAccommodation;
        const duplicates = pluralize(duplicateCount, 'duplicate', 'duplicates');
        const title = 'Successfully copied accommodations';
        const message = `Accommodations copied from ${sourceName} to ${destName}; ${duplicates} ignored.`;
        alert({
          variant: 'success',
          title,
          autohide: true,
          message,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error copying accommodations',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const copyAccommodationsFrom = (sourceExamId) => {
    copy({
      variables: {
        input: {
          sourceExamId,
          destExamId: res.id,
        },
      },
    });
  };
  return (
    <>
      <Form.Group>
        <h2>Accommodations</h2>
        <Table>
          <thead>
            <tr>
              <Col className="border-bottom-0" as="th" sm="auto">Student</Col>
              <Col className="border-bottom-0" as="th">Start Time</Col>
              <Col className="border-bottom-0 text-nowrap" as="th" sm="auto">% Extra Time</Col>
              <Col className="border-bottom-0" as="th" sm="auto">Actions</Col>
            </tr>
            <tr>
              <Col className="border-top-0" as="th" sm="auto" />
              <Col className="border-top-0" as="th" sm="auto" colSpan={2}>Policy Exemptions</Col>
              <Col className="border-top-0" as="th" sm="auto" />
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
      <Form.Group as={Row}>
        <Col className="text-center">
          <DropdownButton
            title="Copy accommodations from other exam:"
            disabled={loading}
            className="mb-2"
          >
            {exams.map((e) => (e.id === res.id ? undefined : (
              <Dropdown.Item
                key={e.id}
                onClick={(): void => {
                  copyAccommodationsFrom(e.id);
                }}
              >
                {e.name}
              </Dropdown.Item>
            )))}
          </DropdownButton>
        </Col>
      </Form.Group>
    </>
  );
};

export default ManageAccommodations;
