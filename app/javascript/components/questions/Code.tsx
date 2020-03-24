import React, { useState } from "react";
import { Editor, Renderer } from "../ExamCodeBox";
import { useExamContext } from "../examstate";
import { HTML } from "./HTML";

interface CodeProps {
  code: Code;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function Code(props: CodeProps) {
  const { code, qnum, pnum, bnum } = props;
  const { prompt, lang } = code;
  const { dispatch, getAtPath } = useExamContext();
  const value = getAtPath(qnum, pnum, bnum);
  //let theRest = null;
  //if (readOnly) {
  //  if (/\S/.test(initial)) {
  //    theRest = <Renderer className="border" value={initial} language={lang} />;
  //  } else {
  //    theRest = <i>No answer given.</i>;
  //  }
  //} else {
  const onChange = (cm, state, newVal) => dispatch({
    type: "updateAnswer",
    path: [qnum, pnum, bnum],
    val: newVal,
  });
  const editor = (
    <Editor
      value={value}
      language={lang}
      onBeforeChange={onChange}
    />
  );

  return (
    <div>
      <div>
        {prompt.map((p, i) => <HTML key={i} value={p}/>)}
      </div>
      {editor}
    </div>
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
