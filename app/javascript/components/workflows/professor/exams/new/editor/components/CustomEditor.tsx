import React from 'react';
import ReactQuill from 'react-quill';
import QuillPasteSmart from 'quill-paste-smart';
import 'react-quill/dist/quill.snow';
import './CustomEditor.css';


ReactQuill.Quill.register('modules/clipboard', QuillPasteSmart, true);

interface HTMLValProps {
  value: string;
  placeholder?: string;
  className?: string;
  id?: string;
  onChange?: ReactQuill.ReactQuillProps['onChange'];
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

const formatOptions = [
  'background', 'color', 'bold', 'italic', 'underline', 'font', 'code', 'size', 'strike', 'script',
  // NO 'link'
  'blockquote', 'header', 'indent', 'list', 'align', 'code-block', 'direction',
  'formula', 'image',
  // NO 'video'
];

const CustomEditor: React.FC<HTMLValProps> = (props) => {
  const {
    value,
    placeholder,
    className,
    id,
    onChange,
  } = props;

  return (
    <ReactQuill
      id={id}
      className={className}
      theme="snow"
      placeholder={placeholder}
      value={value}
      formats={formatOptions}
      modules={{
        toolbar: toolbarOptions,
      }}
      onChange={onChange}
    />
  );
};

export default CustomEditor;
