import React, { useEffect } from 'react';

const DocumentTitle: React.FC<React.PropsWithChildren<{
  title: string;
}>> = (props) => {
  const {
    title,
    children,
  } = props;
  useEffect(() => {
    document.title = title;
  }, [title]);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default DocumentTitle;
