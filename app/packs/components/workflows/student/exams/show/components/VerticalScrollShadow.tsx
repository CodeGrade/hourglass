import React, { useEffect, useRef, useState } from 'react';
import './VerticalScrollShadow.scss';

const VerticalScrollShadow: React.FC<{
  className?: string,
}> = (props) => {
  const {
    className,
    children,
  } = props;
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBot, setAtBot] = useState(true);
  const marginMarkers = { topMarker: setAtTop, botMarker: setAtBot };
  useEffect(() => {
    if (parentRef.current && scrollRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          marginMarkers[entry.target.className](entry.isIntersecting);
        });
      }, {
        root: parentRef.current,
        rootMargin: '0px',
        threshold: 1,
      });
      observer.observe(scrollRef.current.firstElementChild);
      observer.observe(scrollRef.current.lastElementChild);
      return () => {
        observer.disconnect();
      };
    }
    return undefined;
  }, [parentRef.current, scrollRef.current]);
  return (
    <div className={`${className} scroll-shadowing`} ref={parentRef}>
      <div
        className={`${atTop ? '' : 'not-top'} ${atBot ? '' : 'not-bot'}`}
        ref={scrollRef}
      >
        <span className="topMarker" />
        {children}
        <span className="botMarker" />
      </div>
    </div>
  );
};

export default VerticalScrollShadow;
