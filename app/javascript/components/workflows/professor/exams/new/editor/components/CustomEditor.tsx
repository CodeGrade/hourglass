import React, { useCallback, useMemo } from 'react';
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
  refreshProps?: React.DependencyList;
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
    refreshProps = [],
  } = props;

  const filteredOnChange = useCallback((val, delta, source, editor) => {
    if (onChange) {
      const quillBreak = new RegExp('<p><br></p>', 'g');
      const filteredVal = val.replace(quillBreak, '');
      onChange(filteredVal, delta, source, editor);
    }
  }, [onChange]);

  const key = useMemo(() => Math.random(), refreshProps);

  return (
    <ReactQuill
      id={id}
      key={key}
      className={className}
      theme={theme || 'snow'}
      placeholder={placeholder}
      value={value}
      formats={formatOptions}
      modules={modules}
      onChange={filteredOnChange}
    />
  );
});

export default CustomEditor;
