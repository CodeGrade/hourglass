import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Editor } from '../ExamCodeBox';
import { HTML } from './HTML';
import { MarkDescription, Code, CodeState } from '../../types';
import { useExamContext } from '../../context';

interface CodeProps {
  info: Code;
  value: CodeState;
  onChange: (newVal: CodeState) => void;
  disabled: boolean;
}

export function Code(props: CodeProps) {
  const {
    info,
    value: state,
    onChange,
    disabled,
  } = props;
  const { prompt, lang, initial } = info;
  const { fmap } = useExamContext();
  const f = fmap[initial];
  if (f?.filedir === 'dir') {
    throw new Error("Code initial cannot be a directory.");
  }
  if (disabled) { // TODO show a disabled editor using disabled prop below
    return (
      <p>Disabled</p>
    );
  }
  const text = state?.text ?? f?.contents ?? '';
  const marks = state?.marks ?? f?.marks ?? [];
  const editor = (
    <Editor
      value={text}
      markDescriptions={marks}
      valueUpdate={[disabled]}
      disabled={disabled}
      language={lang}
      onChange={(text, marks) => {
        onChange({
          text,
          marks,
        })
      }}
    />
  );

  return (
    <>
      <Row>
        <Col>
          {prompt.map((p, i) => <HTML key={i} value={p} />)}
        </Col>
      </Row>
      <Row>
        <Col>
          {editor}
        </Col>
      </Row>
    </>
  );
  /*
     return (

<div class="col-12">
  <div><% item["prompt"]&.each do |p| %><%= p.html_safe %><% end %></div>
<% if readonly %>
  <% if answer&.dig('code').blank? %>
    <b>Answer: </b>
    <i>No answer given</i>
  <% else %>
      <%= content_tag(:pre, answer&.dig('code'), class: "sourceCodeDisplay border", data: {lang: item["lang"], readonly: true}, name: "#{unique_label}[code]") %>
  <% end %>
<% else %>
    <% val = answer&.dig('code') || item["initial"] %>
    <%= code_textarea val, class: "sourceCode", data: {lang: item["lang"], readonly: false}, name: "#{unique_label}[code]" %>
    <input hidden name="<%= unique_label %>[marks]" value="<%= answer&.dig('marks') %>" />
<% end %>
</div>
*/
}
