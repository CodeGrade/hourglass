import React, { useState } from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Row, Col } from 'react-bootstrap';
import { Editor } from './ExamCodeBox';
import { FileRef, ExamFile, Files } from '../types';
import { useExamContext } from '../context';
import { getFilesForRefs } from '../files';

interface FilesProps {
  files: Array<ExamFile>;
}

function Files(props: FilesProps) {
  const { files } = props;
  return (
    <>
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
            throw new Error('Invalid file type');
        }
      })}
    </>
  );
}

interface FileContentsProps {
  files: Files;
  selectedFile: string;
}

function FileContents(props: FileContentsProps) {
  const { files, selectedFile } = props;
  const { fmap } = useExamContext();
  const f = fmap[selectedFile];
  if (f?.filedir == 'file') {
    return (
      <Editor readOnly language={f.type} value={f.contents} />
    );
  }
  return (
    <Editor readOnly lineNumbers={false} value="Select a file..." />
  );
}

interface FileTreeProps {
  files: Files;
  onChangeFile: (id: string) => void;
}

function FileTree(props: FileTreeProps) {
  const { files, onChangeFile } = props;
  const { fmap } = useExamContext();
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

interface FileViewerProps {
  references: FileRef[];
}

export function FileViewer(props: FileViewerProps) {
  const { references } = props;
  const { files, fmap } = useExamContext();
  const [selectedID, setSelectedID] = useState('');
  const filteredFiles = getFilesForRefs(fmap, references);
  return (
    <Row>
      <Col sm={3}>
        <FileTree files={filteredFiles} onChangeFile={setSelectedID} />
      </Col>
      <Col sm={9}>
        <FileContents files={filteredFiles} selectedFile={selectedID} />
      </Col>
    </Row>
  );
}
