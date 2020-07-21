import React from 'react';
import {
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import {
  WrappedFieldArrayProps,
  FieldIterate,
  WrappedFieldProps,
} from 'redux-form';
import { HTMLVal } from '@student/exams/show/types';
import CustomEditor, { CustomEditorProps } from './CustomEditor';

export const EditHTMLField: React.FC<WrappedFieldProps & {
  theme?: CustomEditorProps['theme'];
  className?: string;
  placeholder?: CustomEditorProps['placeholder'];
}> = (props) => {
  const {
    input,
    className = 'bg-white',
    theme,
    placeholder,
  } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <CustomEditor
      className={className}
      theme={theme}
      value={value.value}
      placeholder={placeholder}
      onChange={(newName, _delta, source, _editor): void => {
        if (source === 'user') {
          onChange({
            type: 'HTML',
            value: newName,
          });
        }
      }}
    />
  );
};

interface EditHTMLsProps {
  prompt?: string;
  renderOptions: FieldIterate<HTMLVal, JSX.Element>;
}

const EditHTMLs: React.FC<WrappedFieldArrayProps<HTMLVal> & EditHTMLsProps> = (props) => {
  const {
    renderOptions,
    fields,
    prompt = 'Add new option',
  } = props;
  return (
    <>
      {fields.map(renderOptions)}
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            variant="dark"
            onClick={(): void => {
              fields.push({
                type: 'HTML',
                value: '',
              });
            }}
          >
            {prompt}
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default EditHTMLs;
