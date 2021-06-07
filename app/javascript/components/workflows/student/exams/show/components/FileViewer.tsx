import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Row, Col } from 'react-bootstrap';
import {
  CodeTagState, FileRef, ExamFile, FileMap,
} from '@student/exams/show/types';
import { ExamContext } from '@hourglass/common/context';
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
  fullyExpandCode?: boolean;
}

const FileContents: React.FC<FileContentsProps> = (props) => {
  const {
    selectedFile,
    selectedLine,
    onChangeLine,
    refreshProps = [],
    fmap,
    fullyExpandCode = false,
  } = props;
  const f = fmap[selectedFile];
  let cursor: CodeMirror.Position;
  if (selectedLine) {
    cursor = {
      line: selectedLine - 1,
      ch: 0,
    };
  }
  const handleLineClick = useCallback((num: number): void => {
    if (onChangeLine) {
      onChangeLine(num + 1);
    }
  }, [onChangeLine]);
  const rp = useMemo(() => [...refreshProps, f], [refreshProps, f]);
  const handleGutterClick = useCallback((ed, lineNum): void => {
    handleLineClick(lineNum);
    ed.setCursor(lineNum);
  }, [handleLineClick]);
  const editorOptions = useMemo(() => ({
    styleActiveLine: !!selectedLine,
  }), [selectedLine]);
  const handleCursor = useCallback((ed, pos): void => {
    if (ed.hasFocus()) handleLineClick(pos.line);
  }, [handleLineClick]);
  const handleFocus = useCallback((ed): void => {
    const { line } = ed.getCursor();
    handleLineClick(line);
  }, [handleLineClick]);
  if (f?.filedir === 'file') {
    return (
      <Editor
        readOnly
        refreshProps={rp}
        language={f.type}
        value={f.contents}
        markDescriptions={f.marks}
        valueUpdate={rp}
        onGutterClick={handleGutterClick}
        options={editorOptions}
        cursor={cursor}
        onCursor={handleCursor}
        onFocus={handleFocus}
        autosize={fullyExpandCode}
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
  disabled?: boolean;
}

const FileTree: React.FC<FileTreeProps> = (props) => {
  const {
    files,
    onChangeFile,
    selectedFile,
    fmap,
    disabled = false,
  } = props;
  const allIds = Object.keys(fmap);
  return (
    <TreeView
      selected={selectedFile}
      disableSelection={disabled}
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
  references: readonly FileRef[];
  alwaysShowTreeView?: boolean;
  refreshProps?: React.DependencyList;
  fullyExpandCode?: boolean;
}

export const FileViewer: React.FC<FileViewerProps> = (props) => {
  const {
    references,
    alwaysShowTreeView = false,
    refreshProps,
    fullyExpandCode = false,
  } = props;
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
          refreshProps={refreshProps}
          fullyExpandCode={fullyExpandCode}
        />
      </Col>
    </Row>
  );
};

interface ControlledFileViewerProps {
  references: readonly FileRef[];
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
  deps?: React.DependencyList;
}> = (props) => {
  const {
    files,
    deps,
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
          refreshProps={deps}
        />
      </Col>
    </Row>
  );
};
