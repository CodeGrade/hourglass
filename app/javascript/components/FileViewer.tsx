import React, { useState } from 'react';
import { Editor } from './ExamCodeBox';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

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


interface FilesProps {
  files: Array<ExamFile>;
}

function Files(props: FilesProps) {
  const { files } = props;
  return (
    <React.Fragment>
    {files.map((f) => {
      const nodeId = String(f.id);
      switch (f.filedir) {
        case 'dir':
          return (
            <TreeItem label={f.text} key={nodeId} nodeId={nodeId}>
              <Files files={f.nodes} />
            </TreeItem>
          );
        case 'file':
          return (
            <TreeItem label={f.text} key={nodeId} nodeId={nodeId} />
          );
        default:
          throw new Error("Invalid file type");
      }
    })}
    </React.Fragment>
  );
}

function idToFileMap(files: Array<File>): { [id: string]: string } {
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
  return (
    <Editor readOnly onBeforeChange={()=>{}} value={contents} marksDependencies={[selectedFileID]} />
  );
}

interface FileTreeProps {
  files: Files;
  onChangeFile: (id: number) => void;
}

function FileTree(props: FileTreeProps) {
  const { files, onChangeFile } = props;
  const ids = reduceFilesDirs(files, f => String(f.id));
  return (
    <TreeView
      expanded={ids}
      onNodeSelect={(e, [id]) => onChangeFile(id)}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      <Files files={files} />
    </TreeView>
  );
}

interface FileViewerProps {
  files: Files;
}

export function FileViewer(props: FileViewerProps) {
  const { files } = props;
  const [selectedID, setSelectedID] = useState(-1);
  return (
    <div>
      <FileTree files={files} onChangeFile={setSelectedID} />
      <FileContents files={files} selectedFileID={selectedID} />
    </div>
  );
}
