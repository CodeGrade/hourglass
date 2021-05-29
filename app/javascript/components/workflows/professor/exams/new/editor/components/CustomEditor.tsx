import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import ReactQuill from 'react-quill';
import QuillPasteSmart from 'quill-paste-smart';
import './CustomEditor.scss';

ReactQuill.Quill.register('modules/clipboard', QuillPasteSmart, true);

export interface CustomEditorProps {
  value: string;
  placeholder?: string;
  className?: string;
  id?: string;
  theme?: string;
  onChange?: ReactQuill.ReactQuillProps['onChange'];
  disabled?: boolean;
}

const toolbarOptions = [
  [
    { font: [] },
    'bold', 'italic', 'underline', 'strike', 'code',
    { script: 'sub' }, { script: 'super' },
    { color: [] }, { background: [] },
  ],

  [
    { align: [] },
    'blockquote', 'code-block',
    { list: 'ordered' }, { list: 'bullet' },
    { indent: '-1' }, { indent: '+1' },
  ],

  ['image'],

  //  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  //  [{ header: [4, 5, 6, false] }],

  ['clean'], // remove formatting button
];

const modules = {
  toolbar: toolbarOptions,
};

const formatOptions = [
  'background', 'color', 'bold', 'italic', 'underline', 'font', 'code', 'size', 'strike', 'script',
  // NO 'link'
  'blockquote', 'header', 'indent', 'list', 'align', 'code-block', 'direction',
  'formula', 'image',
  // NO 'video'
];

const CustomEditor: React.FC<CustomEditorProps> = ((props) => {
  const {
    value,
    placeholder,
    className,
    id,
    theme,
    onChange,
    disabled = false,
  } = props;

  const filteredOnChange = useCallback((val, delta, source, editor) => {
    if (onChange) {
      const quillBreak = new RegExp('<p><br></p>', 'g');
      const filteredVal = val.replace(quillBreak, '');
      onChange(filteredVal, delta, source, editor);
    }
  }, [onChange]);

  const ref = useRef<ReactQuill>();
  useEffect(() => {
    if (!ref.current) { return; }
    ref.current.getEditor().root.dataset.placeholder = placeholder;
  }, [ref.current, placeholder]);

  // When the component first mounts, setting the initial value
  // adds one item to the undo stack, but the initial value
  // should not be undoable.
  useEffect(() => {
    if (ref.current) {
      ref.current.getEditor().getModule('history').clear();
    }
  }, []);

  return (
    <ReactQuill
      ref={ref}
      readOnly={disabled}
      id={id}
      className={className}
      theme={theme || 'snow'}
      value={value}
      formats={formatOptions}
      modules={modules}
      onChange={filteredOnChange}
    />
  );
});

export default CustomEditor;
