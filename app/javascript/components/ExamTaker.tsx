import React, { useState, useRef, useEffect, useContext } from "react";
import Code from "./questions/Code";
import { Editor } from "./ExamCodeBox";
import { useExamState } from "./examstate";
import { Form } from 'react-bootstrap';

import TreeView from "@material-ui/lab/TreeView";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";

const ExamContext = React.createContext({
  dispatch: undefined,
  examStateByPath: undefined,
});
const useExamContext = () => useContext(ExamContext);

function reduceFilesDirs(files, f) {
  return files.reduce((acc, file) => {
    const thisFile = f(file);
    if ("nodes" in file) {
      const rest = reduceFilesDirs(file.nodes, f);
      return acc.concat(thisFile).concat(rest);
    } else {
      return acc.concat(thisFile);
    }
  }, []);
}

function Files(props) {
  const { files } = props;
  return (
    <React.Fragment>
      {files.map(({ id, text, nodes }) => {
        const nodeId = String(id);
        return (
          <TreeItem label={text} key={nodeId} nodeId={nodeId}>
            {nodes ? <Files files={nodes} /> : null}
          </TreeItem>
        );
      })}
    </React.Fragment>
  );
}

function idToFileMap(files) {
  const m = {};
  reduceFilesDirs(files, f => {
    m[f.id] = f.contents;
  });
  return m;
}

//function FileContents(props) {
//  const { files, selectedFileID } = props;
//  const m = idToFileMap(files);
//  const contents = m[selectedFileID] || "Select a file to view.";
//  return <Editor defaultValue={contents} marksDependencies={[selectedFileID]} readOnly />;
//}
//
//function FileTree(props) {
//  const { files, onChangeFile } = props;
//  const ids = reduceFilesDirs(files, f => String(f.id));
//  return (
//    <TreeView
//      expanded={ids}
//      onNodeSelect={(e, [id]) => onChangeFile(id)}
//      defaultCollapseIcon={<ExpandMoreIcon />}
//      defaultExpandIcon={<ChevronRightIcon />}
//    >
//      <Files files={files} />
//    </TreeView>
//  );
//}

//function FileBrowser(props) {
//  const { files } = props;
//  const [selectedID, setSelectedID] = useState(-1);
//  return (
//    <div>
//      <FileTree files={files} onChangeFile={setSelectedID} />
//      <FileContents files={files} selectedFileID={selectedID} />
//    </div>
//  );
//}

interface BodyItem {
  type: string;
}

interface BodyItemProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

interface HTML extends BodyItem {
  value: string;
}

interface HTMLProps {
  value: string;
}

// interface HTMLProps extends  {

// }

interface AllThatApply extends BodyItem {
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
}

interface AllThatApplyProps extends BodyItemProps {
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
  readOnly?: boolean;
}

// interface CodeProps extends AnswerItem<string> {
//   starterContents?: string;
//   language: string;
//   prompt: string;
// }

function HTML(props: HTMLProps) {
  return (
    <div dangerouslySetInnerHTML={{ __html: props.value }}></div>
  )
}

interface Part {
  name?: string;
  description: string;
  points: number;
  reference?: Array<FileDir>;
  body: Array<BodyItem>;
}

interface PartProps extends Part {
  qnum: number;
  pnum: number;
}

interface FileDir { }

interface File extends FileDir {
  file: string; // Full path
}

interface Dir extends FileDir {
  dir: string; // Full path
}

interface Question {
  name?: string;
  description: string;
  separateSubparts: boolean;
  parts: Array<Part>;
  reference?: Array<FileDir>;
}

interface QuestionProps extends Question {
  qnum: number;
}


function AllThatApply(props: AllThatApplyProps) {
  const { options, qnum, pnum, bnum, readOnly } = props;
  const { dispatch, examStateByPath } = useExamContext();
  const value = examStateByPath(qnum, pnum, bnum);
  if (readOnly) {
    if (!value?.some((ans) => !!ans)) {
      return (<React.Fragment>
        <b>Answer: </b>
        <i>None selected</i>
      </React.Fragment>);
    } else {
      return (<React.Fragment>
        <b>Answer: </b>
        <ul>
          {options.map((o, i) => {
            if (value?.[i]) { return <li>{o}</li>; }
            else { return null; }
          })}
        </ul>
      </React.Fragment>)
    }
  }
  const handler = index => event => {
    const val = event.target.checked;
    dispatch({
      type: 'updateAnswer',
      path: [qnum, pnum, bnum, index],
      val,
    })
  }
  return (
    <div>
      <i>(Select all that apply)</i>
      {options.map((o, i) => {
        const val = !!value?.[i];
        return (
          <Form.Group key={i}>
            <Form.Check type="checkbox" label={o} id={`ata-${qnum}-${pnum}-${bnum}-${i}`} checked={val} onChange={handler(i)} />
          </Form.Group>
        );
      })}
    </div>
  )
}


function Part(props: PartProps) {
  const { qnum, pnum, body } = props;
  return (
    <div>
      <h2>Part {pnum + 1}</h2>
      {body.map((b, i) => {
        switch (b.type) {
          case 'HTML':
            return <HTML value={(b as HTML).value} key={i} />
          case 'AllThatApply':
            return <AllThatApply {...(b as AllThatApply)} qnum={qnum} pnum={pnum} bnum={i} key={i} />
          default:
            return <p key={i}>Something more complicated.</p>

        }
      })}
    </div>
  )
}

function Question(props: QuestionProps) {
  const { qnum, parts } = props;
  return (
    <div>
      <h1>Question {qnum + 1}</h1>
      {parts.map((p, i) => (
        <Part {...p} pnum={i} qnum={qnum} key={i} />
      ))}
    </div>
  );
}

interface Exam {
  questions: Array<Question>;
  reference?: Array<FileDir>;
  instructions: string;
}

interface ExamTakerProps {
  files: Array<any>;
  info: Exam;
}

function ExamTaker(props: ExamTakerProps) {
  const { files, info } = props;
  const { questions } = info;
  const [examStateByPath, dispatch] = useExamState(files, info);
  console.log('esbp', examStateByPath);
  console.log('dispatch', dispatch);

  /* For each bodyitem
   * If it is a string: render a <textitem/>
   * If it is an object: switch and render a sub-component
   * Each subcomponent takes a defaultValue, value, and setVal
   *    setVal is a function that takes new val and calls dispatch
   */

  return (
    <ExamContext.Provider value={{ dispatch, examStateByPath }}>
      <div>
        {questions.map((q, i) => (
          <Question {...q} qnum={i} key={i} />
        ))}
      </div>
    </ExamContext.Provider>
  );
}
//dispatch({
//  type: "updateAnswer",
//  qnum: 0,
//  pnum: 0,
//  bnum: 0,
//  val: v
//});
//</div><Code
//</div>  defaultValue={"function a() {}"}
//</div>  language={"javascript"}
//</div>  value={examStateByPath(0, 0, 0)}
//</div>/>

export default ExamTaker;
