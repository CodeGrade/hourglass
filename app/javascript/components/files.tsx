
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
  files: Array<File>;
}
function Files(props: FilesProps) {
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

function idToFileMap(files: Array<File>): { [id: string]: string } {
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
