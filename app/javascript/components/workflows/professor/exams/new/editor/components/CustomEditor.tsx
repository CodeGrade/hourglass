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
  ['bold', 'italic', 'underline', 'strike', 'code'], // toggled buttons
  ['blockquote', 'code-block'],

  ['image'],

  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

  //  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  //  [{ header: [4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }, { align: [] }],

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
