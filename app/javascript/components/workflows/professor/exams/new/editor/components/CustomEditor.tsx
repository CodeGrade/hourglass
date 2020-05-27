import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble';
import './CustomEditor.css';

interface HTMLValProps {
  value: string;
  placeholder?: string;
  className?: string;
  id?: string;
  onChange?: (content: string) => void;
}

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike', 'code'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

  //  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  //  [{ header: [4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }, { align: [] }],

  ['clean'], // remove formatting button
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
      theme="bubble"
      placeholder={placeholder}
      value={value}
      modules={{
        toolbar: toolbarOptions,
      }}
      onChange={onChange}
    />
  );
};

export default CustomEditor;
