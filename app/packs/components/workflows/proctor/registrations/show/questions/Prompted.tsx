import React from 'react';
import { HTMLVal } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

const Prompted: React.FC<React.PropsWithChildren<{
  prompt?: HTMLVal;
}>> = (props) => {
  const {
    children,
    prompt,
  } = props;
  return (
    <div>
      {prompt && (<div><HTML value={prompt} /></div>)}
      {children}
    </div>
  );
};

export default Prompted;
