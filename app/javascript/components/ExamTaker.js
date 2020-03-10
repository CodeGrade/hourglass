import React, { useState, useRef, useEffect } from "react";

import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";

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
            <Files files={nodes || []} />
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

function FileContents(props) {
  const { files, selectedFileID } = props;
  const m = idToFileMap(files);
  const contents = m[selectedFileID] || "Select a file to view.";
  return <textarea value={contents} readOnly />;
}

function FileTree(props) {
  const { files, onChangeFile } = props;
  const ids = reduceFilesDirs(files, f => String(f.id));
  return (
    <TreeView expanded={ids} onNodeSelect={(e, [id]) => onChangeFile(id)}>
      <Files files={files} />
    </TreeView>
  );
}

function ExamTaker(props) {
  const { files } = props;
  const [selectedID, setSelectedID] = useState(-1);

  return (
    <div>
      <FileTree files={files} onChangeFile={setSelectedID} />
      <FileContents files={files} selectedFileID={selectedID} />
    </div>
  );
}

export default ExamTaker;
