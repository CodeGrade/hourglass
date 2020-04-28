import React, { useState } from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Row, Col } from 'react-bootstrap';
import { Editor } from './ExamCodeBox';
import { CodeTagState, CMMarks, FileRef, ExamFile, Files } from '../types';
import { useExamContext } from '../context';
import { firstFile, getFilesForRefs } from '../files';

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
  selectedFile: string;
  onMark?: (marks: CMMarks) => void;
}

function FileContents(props: FileContentsProps) {
  const { selectedFile } = props;
  const { fmap } = useExamContext();
  const f = fmap[selectedFile];
  if (f?.filedir == 'file') {
    return (
      <Editor
        readOnly
        language={f.type}
        value={f.contents}
      />
    );
  }
  return ( // TODO: error boundaries
    <p>Error rendering files.</p>
  );
}

interface FileTreeProps {
  files: Files;
  selectedFile: string;
  onChangeFile: (id: string) => void;
}

function FileTree(props: FileTreeProps) {
  const { files, onChangeFile, selectedFile } = props;
  const { fmap } = useExamContext();
  const allIds = Object.keys(fmap);
  return (
    <TreeView
      selected={selectedFile}
      onNodeSelect={(e, id) => {
        const dir = fmap[id].filedir == 'dir';
        if (!dir) onChangeFile(id);
      }}
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
  const { fmap } = useExamContext();
  const filteredFiles = getFilesForRefs(fmap, references);
  const first = firstFile(filteredFiles);
  const firstID = first?.rel_path;
  const [selectedID, setSelectedID] = useState(firstID);
  return (
    <Row>
      <Col sm={3}>
        <FileTree
          files={filteredFiles}
          selectedFile={selectedID}
          onChangeFile={setSelectedID}
        />
      </Col>
      <Col sm={9}>
        <FileContents
          selectedFile={selectedID}
        />
      </Col>
    </Row>
  );
}

interface ControlledFileViewerProps {
  references: FileRef[];
  selection?: CodeTagState;
  onSelectionChange: (newSelection: CodeTagState) => void;
}
