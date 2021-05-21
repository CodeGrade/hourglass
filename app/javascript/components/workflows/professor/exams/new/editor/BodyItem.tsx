import React from 'react';
import Code from '@hourglass/workflows/professor/exams/new/editor/questions/Code';
import YesNo from '@hourglass/workflows/professor/exams/new/editor/questions/YesNo';
import CodeTag from '@hourglass/workflows/professor/exams/new/editor/questions/CodeTag';
import Text from '@hourglass/workflows/professor/exams/new/editor/questions/Text';
import Matching from '@hourglass/workflows/professor/exams/new/editor/questions/Matching';
import MultipleChoice from '@hourglass/workflows/professor/exams/new/editor/questions/MultipleChoice';
import AllThatApply from '@hourglass/workflows/professor/exams/new/editor/questions/AllThatApply';
import { BodyItemInfo, CodeState } from '@student/exams/show/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { EditHTMLVal } from '@hourglass/workflows/professor/exams/new/editor';
import { graphql, useFragment } from 'relay-hooks';
import { BodyItemDetailsEditor$key } from './__generated__/BodyItemDetailsEditor.graphql';

const EditBodyItemDetails: React.FC<{
  bodyItemKey: BodyItemDetailsEditor$key;
}> = (props) => {
  const {
    bodyItemKey,
  } = props;
  const bodyItem = useFragment(
    graphql`
    fragment BodyItemDetailsEditor on BodyItem {
      id
      info
      answer
    }
    `,
    bodyItemKey,
  );
  const info = bodyItem.info as BodyItemInfo;
  const {
    id,
    answer,
  } = bodyItem;
  switch (info.type) {
    case 'HTML':
      return (
        <EditHTMLVal
          className="text-instructions bg-white"
          // disabled={loading || disabled}
          theme="snow"
          value={info}
          onChange={console.log}
          debounceDelay={1000}
          placeholder="Provide instructions here..."
        />
      );
    case 'Code':
      return (
        <Code
          id={id}
          info={info}
          answer={answer as CodeState}
        />
      );
    default:
      return <p>todo</p>;
    // case 'AllThatApply':
    //   return <AllThatApply qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'CodeTag':
    //   return <CodeTag qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'YesNo':
    //   return <YesNo qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'MultipleChoice':
    //   return <MultipleChoice qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'Text':
    //   return <Text qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'Matching':
    //   return <Matching qnum={qnum} pnum={pnum} bnum={bnum} />;
    // default:
    //   throw new ExhaustiveSwitchError(info);
  }
};

export default EditBodyItemDetails;
