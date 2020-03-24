import React from "react";

export interface HTMLProps {
  value: string;
}

export function HTML(props: HTMLProps) {
  return (
    <div className="no-hover" dangerouslySetInnerHTML={{ __html: props.value }}></div>
  )
}

