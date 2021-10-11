import React, { useEffect } from 'react';

const DocumentTitle: React.FC<{
  title: string;
}> = (props) => {
  const {
    title,
    children,
  } = props;
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <>{children}</>;
};

export default DocumentTitle;
