import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import {
  FileRef,
  ExamFile,
} from '@student/exams/show/types';
import Select, { GroupProps } from 'react-select';
import { TreeView } from '@material-ui/lab';
import { Files, VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { createMap, getFilesForRefs } from '@student/exams/show/files';
import { ExamContext } from '@hourglass/common/context';
import { InputGroup, Button, Collapse } from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { pluralize, SelectOption, SelectOptions } from '@hourglass/common/helpers';

export interface FilePickerProps {
  options: ExamFile[];
  selected: readonly FileRef[];
  disabled?: boolean;
  onChange: (fileRefs: FileRef[]) => void;
  children?: React.ReactNode;
}

const FilePicker: React.FC<FilePickerProps> = (props) => {
  const {
    options,
    selected = [],
    onChange,
  } = props;
  const allIds = createMap(options);
  return (
    <TreeView
      multiSelect
      selected={selected.map((s) => s.path)}
      onNodeSelect={(e, ids): void => {
        e.stopPropagation();
        e.preventDefault();
        const newSel = {};
        selected.forEach((val): void => { newSel[val.path] = true; });
        ids.forEach((val): void => { newSel[val] = !newSel[val]; });
        const newSelected: FileRef[] = [];
        Object.keys(newSel).forEach((key) => {
          if (newSel[key]) {
            newSelected.push({ type: allIds[key].filedir, path: key });
          }
        });
        onChange(newSelected);
      }}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={Object.keys(allIds)}
    >
      <Files files={options} />
    </TreeView>
  );
};

type FileRefOption = SelectOption<FileRef>;
type FileRefOptions = SelectOptions<FileRef>;

const Group: React.FC<GroupProps<FileRefOption>> = (props) => {
  const {
    selectProps,
  } = props;
  const {
    files,
    selected = [],
    setState,
  } = selectProps;
  return (
    <FilePicker
      options={files}
      selected={selected}
      onChange={setState}
    />
  );
};

const COMPONENTS = { Group };

const FilePickerSelect: React.FC<FilePickerProps> = (props) => {
  const {
    children,
    options,
    selected = [],
    onChange,
    disabled = false,
  } = props;
  const selectOptions = useMemo(() => {
    const allIds = createMap(options);
    const allOptions: SelectOptions<FileRef> = Object.keys(allIds).map((relPath) => ({
      label: relPath,
      value: {
        type: allIds[relPath].filedir,
        path: relPath,
      },
    }));
    // This extra array is necessary to wrap all the options
    // within a group, so that our Group can extract the properties
    // we want for our FilePicker, ignoring the options of this Select.
    // We still need a non-empty array of selected values,
    // or else the bubbles won't show up in the select control.
    return [{ options: allOptions }];
  }, [options]);
  const value: FileRefOptions = useMemo(() => (
    selected.map((s) => ({
      label: s.path,
      // This toString is needed because otherwise some CSS
      // mangler tries to convert this value directly to a string
      // to be used as a key, and then we get duplicate keys
      // since they're all [object Object]
      value: { ...s, toString: ((): string => s.path) },
    }))
  ), [selected]);

  const selectOnChange = useCallback((_value, action): void => {
    // These actions only come from interacting with the
    // Select part, not our FilePicker part.
    switch (action.action) {
      case 'pop-value':
      case 'remove-value': {
        const newSel = [...selected];
        const oldFIdx = selected.findIndex((f) => f.path === action.removedValue.value.path);
        if (oldFIdx !== -1) newSel.splice(oldFIdx, 1);
        onChange(newSel);
        break;
      }
      case 'clear':
        onChange([]);
        break;
      case 'set-value': {
        onChange([action.option.value]);
        break;
      }
      default:
        break;
    }
  }, [selected, onChange]);

  return (
    <>
      {children}
      <Select
        options={selectOptions}
        components={COMPONENTS}
        isDisabled={disabled}
        // Pass-along props to FilePicker
        files={options}
        selected={selected}
        setState={onChange}
        // Standard Select props
        isMulti
        className="z-1000"
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        value={value}
        onChange={selectOnChange}
      />
    </>
  );
};

export default FilePickerSelect;

export const FilePickerSelectWithPreview: React.FC<FilePickerProps> = (props) => {
  const {
    options,
    selected,
    disabled = false,
    onChange,
  } = props;
  const [open, setOpen] = useState(false);
  const { fmap } = useContext(ExamContext);
  const noFiles = selected.length === 0;
  const filteredFiles = getFilesForRefs(fmap, selected);
  return (
    <>
      <InputGroup>
        <div className="flex-grow-1">
          <FilePickerSelect
            options={options}
            selected={selected}
            disabled={disabled}
            onChange={onChange}
          />
        </div>
        <InputGroup.Append>
          <Button
            variant="info"
            disabled={noFiles || disabled}
            onClick={(): void => setOpen((o) => !o)}
          >
            {`Preview ${pluralize(selected.length, 'file', 'files')}`}
            {open && !noFiles ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </Button>
        </InputGroup.Append>
      </InputGroup>
      <Collapse in={open && !noFiles}>
        <div className="border">
          <VeryControlledFileViewer
            deps={[open]}
            files={filteredFiles}
          />
        </div>
      </Collapse>
    </>
  );
};
