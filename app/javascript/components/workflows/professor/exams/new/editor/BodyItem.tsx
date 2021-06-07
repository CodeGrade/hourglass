import React, {
  useCallback,
  useContext,
} from 'react';
import {
  graphql,
  useMutation,
  useFragment,
} from 'relay-hooks';
import {
  Card,
  Col,
  Row,
} from 'react-bootstrap';
import { RearrangeableList } from '@hourglass/common/rearrangeable';
import { AlertContext } from '@hourglass/common/alerts';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';

import {
  BodyItemInfo,
  CodeState,
  AllThatApplyState,
  MultipleChoiceState,
  YesNoState,
  TextState,
  CodeTagState,
  MatchingState,
} from '@student/exams/show/types';

import Html from './body-items/Html';
import CodeTag from './body-items/CodeTag';
import Text from './body-items/Text';
import YesNo from './body-items/YesNo';
import Code from './body-items/Code';
import AllThatApply from './body-items/AllThatApply';
import MultipleChoice from './body-items/MultipleChoice';
import Matching from './body-items/Matching';

import { SingleRubricKeyEditor } from './Rubric';
import { DragHandle, DestroyButton } from './components/helpers';

import { PartEditor } from './__generated__/PartEditor.graphql';
import { BodyItemEditor$key } from './__generated__/BodyItemEditor.graphql';
import { BodyItemDestroyMutation } from './__generated__/BodyItemDestroyMutation.graphql';
import { BodyItemReorderMutation } from './__generated__/BodyItemReorderMutation.graphql';

export const ReorderableBodyItemsEditor: React.FC<{
  bodyItems: PartEditor['bodyItems'];
  partId: string;
  disabled?: boolean;
  showRubricEditors?: boolean;
}> = (props) => {
  const {
    bodyItems,
    partId,
    disabled: parentDisabled = false,
    showRubricEditors = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<BodyItemReorderMutation>(
    graphql`
    mutation BodyItemReorderMutation($input: ReorderBodyItemsInput!) {
      reorderBodyItems(input: $input) {
        part {
          id
          bodyItems {
            id
            index
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error reordering body items',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const rearrangeItems = useCallback((from, to) => {
    mutate({
      variables: {
        input: {
          partId,
          fromIndex: from,
          toIndex: to,
        },
      },
    });
  }, [partId, mutate]);
  const disabled = parentDisabled || loading;
  return (
    <RearrangeableList
      dbArray={bodyItems}
      className="mb-3"
      dropVariant="secondary"
      disabled={disabled}
      identifier={`BODYITEM-${partId}`}
      onRearrange={rearrangeItems}
    >
      {(bodyItem, bodyItemHandleRef, bodyItemIsDragging) => (
        <Row key={bodyItem.id}>
          <Col>
            <BodyItemEditor
              bodyItemKey={bodyItem}
              disabled={disabled}
              handleRef={bodyItemHandleRef}
              isDragging={bodyItemIsDragging}
              showRubricEditors={showRubricEditors}
            />
          </Col>
        </Row>
      )}
    </RearrangeableList>
  );
};

export const BodyItemEditor: React.FC<{
  bodyItemKey: BodyItemEditor$key;
  handleRef: React.Ref<HTMLElement>;
  isDragging?: boolean;
  disabled?: boolean;
  showRubricEditors?: boolean;
}> = (props) => {
  const {
    bodyItemKey,
    handleRef,
    disabled: parentDisabled = false,
    showRubricEditors = false,
  } = props;
  const { alert } = useContext(AlertContext);
  const bodyItem = useFragment(
    graphql`
    fragment BodyItemEditor on BodyItem {
      id
      info
      answer
      rootRubric { ...RubricSingle }
    }
    `,
    bodyItemKey,
  );
  const info = bodyItem.info as BodyItemInfo;
  const {
    id,
    answer,
  } = bodyItem;
  const [
    mutateDestroyBodyItem,
    { loading: loadingDestroyBodyItem },
  ] = useMutation<BodyItemDestroyMutation>(
    graphql`
    mutation BodyItemDestroyMutation($input: DestroyBodyItemInput!) {
      destroyBodyItem(input: $input) {
        part {
          id
          bodyItems {
            id
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error destroying body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const destroyItem = useCallback(() => {
    mutateDestroyBodyItem({
      variables: {
        input: {
          bodyItemId: bodyItem.id,
        },
      },
    });
  }, [mutateDestroyBodyItem, bodyItem.id]);
  const disabled = parentDisabled || loadingDestroyBodyItem;
  let editor;
  let showRubric = showRubricEditors;
  switch (info.type) {
    case 'HTML':
      showRubric = false;
      editor = (
        <Html
          id={id}
          info={info}
          disabled={disabled}
        />
      );
      break;
    case 'Code':
      editor = (
        <Code
          id={id}
          info={info}
          disabled={disabled}
          answer={answer as CodeState}
        />
      );
      break;
    case 'AllThatApply':
      editor = (
        <AllThatApply
          id={id}
          info={info}
          disabled={disabled}
          answer={answer as AllThatApplyState}
        />
      );
      break;
    case 'MultipleChoice':
      editor = (
        <MultipleChoice
          id={id}
          info={info}
          disabled={disabled}
          answer={answer as MultipleChoiceState}
        />
      );
      break;
    case 'YesNo':
      editor = (
        <YesNo
          id={id}
          info={info}
          disabled={disabled}
          answer={answer as YesNoState}
        />
      );
      break;
    case 'Text':
      editor = (
        <Text
          id={id}
          info={info}
          disabled={disabled}
          answer={answer as TextState}
        />
      );
      break;
    case 'CodeTag':
      editor = (
        <CodeTag
          id={id}
          info={info}
          disabled={disabled}
          answer={answer as CodeTagState}
        />
      );
      break;
    case 'Matching':
      editor = (
        <Matching
          id={id}
          info={info}
          disabled={disabled}
          answer={answer as MatchingState}
        />
      );
      break;
    default:
      throw new ExhaustiveSwitchError(info);
  }
  return (
    <Card className="border border-secondary alert-secondary">
      {handleRef && <DragHandle handleRef={handleRef} variant="secondary" />}
      <DestroyButton
        disabled={disabled}
        onClick={destroyItem}
      />
      <Card.Body className="ml-4 mr-4">
        <Row>
          <Col sm={12} xl={showRubric ? 6 : 12}>
            {editor}
          </Col>
          {showRubric && (
            <Col sm={12} xl={6}>
              <SingleRubricKeyEditor
                disabled={disabled}
                rubricKey={bodyItem.rootRubric}
              />
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};
