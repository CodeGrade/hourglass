import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Editor } from '../ExamCodeBox';
import { HTML } from './HTML';
import { Code, CodeState } from '../../types';

interface CodeProps {
  info: Code;
  value: CodeState;
  onChange: (newVal: CodeState) => void;
}

export function Code(props: CodeProps) {
  const { info, value, onChange } = props;
  const { prompt, lang } = info;
  const { text, marks } = value ?? { text: '', marks: [] };
  // let theRest = null;
  // if (readOnly) {
  //    theRest = <Renderer className="border" value={initial} language={lang} />;
  // } else {
  const editor = (
    <Editor
      value={text}
      language={lang}
      onBeforeChange={(cm, _state, newVal) => {
        const marks = cm.getAllMarks();
        const descriptions = marks.map(m => {
          const found = m.find();
          return {
            ...found,
            options: m.getOptions(false),
          };
        });
        onChange({
          text: newVal,
          marks: descriptions,
        });
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
