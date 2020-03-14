import React, { useState } from "react";
import { Editor, Renderer } from "../ExamCodeBox";
import { useExamContext, BodyItem, BodyItemProps } from "../examstate";


export interface CodeProps extends BodyItemProps {
  starterContents?: string;
  language: string;
  prompt: string;
}

export function Code(props) {
  const { readOnly, prompt, defaultValue, language, onChange, value } = props;

  let theRest = null;
  if (readOnly) {
    if (/\S/.test(defaultValue)) {
      theRest = <Renderer className="border" value={defaultValue} language={language} />;
    } else {
      theRest = <i>No answer given.</i>;
    }
  } else {
    theRest = (
      <Editor
        value={value || defaultValue}
        language={language}
        onBeforeChange={onChange}
      />
    );
  }

  return (
    <div>
      <div>{prompt}</div>
      {theRest}
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