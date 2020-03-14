import React from "react";
import { BodyItem } from "../examstate";

export interface HTML extends BodyItem {
  value: string;
}

export interface HTMLProps {
  value: string;
}

export function HTML(props: HTMLProps) {
  return (
    <div dangerouslySetInnerHTML={{ __html: props.value }}></div>
  )
}

