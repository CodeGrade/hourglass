import React from 'react';
import { Carousel } from 'react-bootstrap';

interface PaginationProps {
  paginated: boolean;
  current: number;
  body: JSX.Element[];
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    paginated,
    current,
    body,
  } = props;
  return (
    <div
      className={paginated ? 'carousel' : undefined}
    >
      {body.map((b, i) => {
        const active = current === i ? 'active' : '';
        return (
          <div
            key={i}
            className={paginated ? `carousel-item ${active}` : ''}
          >
            {b}
          </div>
        );
      })}
    </div>
  );
}

Pagination.displayName = "Pagination";
export default Pagination;
