import React, { useState } from 'react';
import { Editor } from './ExamCodeBox';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useExamContext } from './examstate';
import { Row, Col } from 'react-bootstrap';

interface FilesProps {
  files: Array<ExamFile>;
}

function Files(props: FilesProps) {
  const { files } = props;
  return (
    <React.Fragment>
    {files.map((f) => {
      const nodeId = f.rel_path;
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

interface FileContentsProps {
  files: Files;
  fmap: FileMap;
  selectedFile: string;
}

function FileContents(props: FileContentsProps) {
  const { files, selectedFile, fmap } = props;
  const f = fmap[selectedFile];
  if (f?.filedir == 'file') {
    return (
      <Editor readOnly value={f.contents} />
    );
  } else {
    return (
      <p>Select a file...</p>
    );
  }
}

interface FileTreeProps {
  files: Files;
  onChangeFile: (id: string) => void;
  fmap: FileMap;
}

function FileTree(props: FileTreeProps) {
  const { files, onChangeFile, fmap } = props;
  const allIds = Object.keys(fmap);
  return (
    <TreeView
      onNodeSelect={(e, id) => onChangeFile(id)}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={allIds}
    >
      <Files files={files} />
    </TreeView>
  );
}

// Map from file path to file.
interface FileMap {
  [path: string]: ExamFile;
}

function getFilesForRefs(map: FileMap, refs: FileRef[]): Files {
  return refs ? refs.map(r => map[r.path]).filter(a => a) : [];
}

function createMap(files: Files): FileMap {
  const ret = {};
  for (const file of files) {
    switch (file.filedir) {
      case 'dir':
        ret[file.rel_path] = file;
        const children = createMap(file.nodes);
        Object.assign(ret, children);
        break;
      case 'file':
        ret[file.rel_path] = file;
        break;
      default:
        throw new Error("invalid file");
    }
  }
  return ret;
}

interface FileViewerProps {
  references: FileRef[];
}

export function FileViewer(props: FileViewerProps) {
  const { references } = props;
  const { files } = useExamContext();
  const [selectedID, setSelectedID] = useState("");
  const fileMap = createMap(files);
  const filteredFiles = getFilesForRefs(fileMap, references);
  return (
    <Row>
      <Col sm={6}>
        <FileTree fmap={fileMap} files={filteredFiles} onChangeFile={setSelectedID} />
      </Col>
      <Col sm={6}>
        <FileContents fmap={fileMap} files={filteredFiles} selectedFile={selectedID} />
      </Col>
    </Row>
  );
}
