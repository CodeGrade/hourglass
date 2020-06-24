import React, { useState, useContext, useEffect } from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Row, Col } from 'react-bootstrap';
import {
  CodeTagState, FileRef, ExamFile, FileMap,
} from '@student/exams/show/types';
import { ExamContext } from '@student/exams/show/context';
import {
  firstFile,
  getFilesForRefs,
  createMap,
  countFiles,
} from '@student/exams/show/files';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Editor } from './ExamCodeBox';

interface FilesProps {
  files: ExamFile[];
}

export const Files: React.FC<FilesProps> = (props) => {
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
  fmap: FileMap;
}

const FileContents: React.FC<FileContentsProps> = (props) => {
  const {
    selectedFile,
    selectedLine,
    onChangeLine,
    refreshProps = [],
    fmap,
  } = props;
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
          matchBrackets: false,
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
  fmap: FileMap;
}

const FileTree: React.FC<FileTreeProps> = (props) => {
  const {
    files,
    onChangeFile,
    selectedFile,
    fmap,
  } = props;
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
  alwaysShowTreeView?: boolean;
}

export const FileViewer: React.FC<FileViewerProps> = (props) => {
  const { references, alwaysShowTreeView = false } = props;
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  const first = firstFile(filteredFiles);
  const firstID = first?.relPath;
  const [selectedID, setSelectedID] = useState(firstID);
  const showTreeView = alwaysShowTreeView || countFiles(filteredFiles) > 1;
  return (
    <Row>
      {showTreeView && (
        <Col sm={3}>
          <FileTree
            files={filteredFiles}
            selectedFile={selectedID}
            onChangeFile={setSelectedID}
            fmap={fmap}
          />
        </Col>
      )}
      <Col sm={showTreeView ? 9 : 12}>
        <FileContents
          fmap={fmap}
          selectedFile={selectedID}
        />
      </Col>
    </Row>
  );
};


interface ControlledFileViewerProps {
  references: FileRef[];
  alwaysShowTreeView?: boolean;
  selection?: CodeTagState;
  onChangeLine: (lineNumber: number) => void;
  onChangeFile: (file: string) => void;
  refreshProps?: React.DependencyList;
}

export const ControlledFileViewer: React.FC<ControlledFileViewerProps> = (props) => {
  const {
    references,
    alwaysShowTreeView = false,
    selection,
    onChangeFile,
    onChangeLine,
    refreshProps,
  } = props;
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  const first = firstFile(filteredFiles);
  const firstID = first?.relPath;
  const showTreeView = alwaysShowTreeView || countFiles(filteredFiles) > 1;
  useEffect(() => {
    if (!showTreeView) {
      onChangeFile(firstID);
    }
  }, []);
  return (
    <Row>
      {showTreeView && (
        <Col sm={3} className="overflow-scroll-x">
          <FileTree
            files={filteredFiles}
            selectedFile={selection?.selectedFile ?? null}
            onChangeFile={onChangeFile}
            fmap={fmap}
          />
        </Col>
      )}
      <Col sm={showTreeView ? 9 : 12}>
        <FileContents
          selectedFile={selection?.selectedFile}
          selectedLine={selection?.lineNumber}
          onChangeLine={onChangeLine}
          refreshProps={refreshProps}
          fmap={fmap}
        />
      </Col>
    </Row>
  );
};

export const VeryControlledFileViewer: React.FC<{
  files: ExamFile[];
}> = (props) => {
  const {
    files,
  } = props;
  const fmap = createMap(files);
  const [selectedID, setSelectedID] = useState('');
  useEffect(() => {
    const first = firstFile(files);
    const firstID = first?.relPath ?? '';
    setSelectedID(firstID);
  }, [files]);
  return (
    <Row>
      <Col sm={3} className="overflow-scroll-x">
        <FileTree
          files={files}
          selectedFile={selectedID}
          onChangeFile={setSelectedID}
          fmap={fmap}
        />
      </Col>
      <Col sm={9}>
        <FileContents
          fmap={fmap}
          selectedFile={selectedID}
        />
      </Col>
    </Row>
  );
};
