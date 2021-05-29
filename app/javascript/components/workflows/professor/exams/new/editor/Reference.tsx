import React, { useContext, useEffect, useRef } from 'react';
import {
  Form,
  Col,
} from 'react-bootstrap';
import { ExamContext } from '@hourglass/common/context';
import { FilePickerSelectWithPreview } from '@professor/exams/new/editor/components/FilePicker';
import { FileRef } from '@student/exams/show/types';

/**
 * Like useEffect, but does not trigger on the initial render.
 */
function useEffectSkipFirst(effect: React.EffectCallback, deps?: React.DependencyList) {
  const ranOnce = useRef(false);
  useEffect(() => {
    if (!ranOnce.current) {
      ranOnce.current = true;
      return () => undefined;
    }
    return effect();
  }, deps);
}

const EditReference: React.FC<{
  label: string;
  value: FileRef[];
  disabled?: boolean;
  onChange: (newVal: FileRef[]) => void;
}> = (props) => {
  const {
    label,
    value,
    disabled = false,
    onChange,
  } = props;
  const { files, fmap } = useContext(ExamContext);
  // We don't need the effect on the initial render, because
  // we assume the fileRefs that come from the database are valid.
  useEffectSkipFirst(() => {
    // Filter out references that no longer exist.
    const filtered = value.filter((fileRef) => (fileRef.path in fmap));
    onChange(filtered);
  }, [fmap]);
  return (
    <>
      <Form.Label column sm={2}>
        {`Files to be shown for ${label}:`}
      </Form.Label>
      <Col sm={10}>
        <FilePickerSelectWithPreview
          options={files}
          selected={value}
          onChange={onChange}
          disabled={disabled}
        />
      </Col>
    </>
  );
};

export default EditReference;
