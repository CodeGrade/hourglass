import React, { useState, useContext } from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Row, Col } from 'react-bootstrap';
import {
  CodeTagState, FileRef, ExamFile,
} from '@examTaker/types';
import { ExamContext } from '@examTaker/context';
import { firstFile, getFilesForRefs } from '@examTaker/files';
import { ExhaustiveSwitchError } from '@examTaker/helpers';
import { Editor } from './ExamCodeBox';

interface FilesProps {
  files: ExamFile[];
}

const Files: React.FC<FilesProps> = (props) => {
  const { files } = props;
  return (
    <>
      {files.map((f) => {
        const nodeId = f.relPath;
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
            throw new ExhaustiveSwitchError(f);
        }
      })}
    </>
  );
};

interface FileContentsProps {
  selectedFile: string;
  selectedLine?: number;
  onChangeLine?: (lineNum: number) => void;
  refreshProps?: React.DependencyList;
}

const FileContents: React.FC<FileContentsProps> = (props) => {
  const {
    selectedFile,
    selectedLine,
    onChangeLine,
    refreshProps: rp,
  } = props;
  const refreshProps = rp ?? [];
  const { fmap } = useContext(ExamContext);
  const f = fmap[selectedFile];
  let cursor: CodeMirror.Position;
  if (selectedLine) {
    cursor = {
      line: selectedLine - 1,
      ch: 0,
    };
  }
  const handleLineClick = (num: number): void => {
    if (onChangeLine) {
      onChangeLine(num + 1);
    }
  };
  if (f?.filedir === 'file') {
    return (
      <Editor
        readOnly
        refreshProps={[...refreshProps, f]}
        language={f.type}
        value={f.contents}
        markDescriptions={f.marks}
        valueUpdate={[...refreshProps, f]}
        onGutterClick={(_ed, lineNum): void => {
          handleLineClick(lineNum);
          _ed.setCursor(lineNum);
        }}
        options={{
          styleActiveLine: !!selectedLine,
        }}
        cursor={cursor}
        onCursor={(ed, pos): void => {
          if (ed.hasFocus()) handleLineClick(pos.line);
        }}
        onFocus={(ed): void => {
          const { line } = ed.getCursor();
          handleLineClick(line);
        }}
      />
    );
  }
  return (
    <p>Choose a file.</p>
  );
};

interface FileTreeProps {
  files: ExamFile[];
  selectedFile: string;
  onChangeFile: (id: string) => void;
}

const FileTree: React.FC<FileTreeProps> = (props) => {
  const { files, onChangeFile, selectedFile } = props;
  const { fmap } = useContext(ExamContext);
  const allIds = Object.keys(fmap);
  return (
    <TreeView
      selected={selectedFile}
      onNodeSelect={(e, id): void => {
        const dir = fmap[id].filedir === 'dir';
        if (!dir) onChangeFile(id);
      }}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={allIds}
    >
      <Files files={files} />
    </TreeView>
  );
};

interface FileViewerProps {
  references: FileRef[];
}

export const FileViewer: React.FC<FileViewerProps> = (props) => {
  const { references } = props;
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  const first = firstFile(filteredFiles);
  const firstID = first?.relPath;
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
};


interface ControlledFileViewerProps {
  references: FileRef[];
  selection?: CodeTagState;
  onChangeLine: (lineNumber: number) => void;
  onChangeFile: (file: string) => void;
  refreshProps?: React.DependencyList;
}

export const ControlledFileViewer: React.FC<ControlledFileViewerProps> = (props) => {
  const {
    references, selection, onChangeFile, onChangeLine, refreshProps,
  } = props;
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  return (
    <Row>
      <Col sm={3}>
        <FileTree
          files={filteredFiles}
          selectedFile={selection?.selectedFile ?? ''}
          onChangeFile={onChangeFile}
        />
      </Col>
      <Col sm={9}>
        <FileContents
          selectedFile={selection?.selectedFile}
          selectedLine={selection?.lineNumber}
          onChangeLine={onChangeLine}
          refreshProps={refreshProps}
        />
      </Col>
    </Row>
  );
};
