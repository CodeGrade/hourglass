import React, { useState, useRef, useEffect, useContext } from "react";
import { Editor } from "./ExamCodeBox";
import { useExamState, BodyItem, BodyItemProps, ExamContext, FileDir } from "./examstate";
import { Question } from "./Question"
import { Form } from 'react-bootstrap';

import TreeView from "@material-ui/lab/TreeView";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import { HTML } from "./questions/HTML";

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


// interface HTMLProps extends  {

// }





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
  const { questions, instructions } = info;
  const [examStateByPath, dispatch] = useExamState(files, info);

  /* For each bodyitem
   * If it is a string: render a <textitem/>
   * If it is an object: switch and render a sub-component
   * Each subcomponent takes a defaultValue, value, and setVal
   *    setVal is a function that takes new val and calls dispatch
   */

  return (
    <ExamContext.Provider value={{ dispatch, examStateByPath }}>
      <div><HTML value={instructions} /></div>
      {/* TODO: show files */}
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
