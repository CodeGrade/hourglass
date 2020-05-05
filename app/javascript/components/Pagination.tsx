import React from 'react';
import PaginationArrows from '@hourglass/containers/PaginationArrows';

interface PaginationProps {
  paginated: boolean;
  current: number;
  max: number;
  body: JSX.Element[];
  endItem: JSX.Element;
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    paginated,
    current,
    max,
    body,
    endItem,
  } = props;
  const onFirstPage = current === 0;
  const onLastPage = current === max - 1;
  const showEnd = (!paginated) || onLastPage;
  return (
    <div>
      <div
        className={paginated ? 'carousel' : undefined}
      >
        {body.map((b, i) => {
          const active = current === i;
          const activeClass = active ? 'active' : '';
          return (
            <div
              key={i}
              className={paginated ? `carousel-item ${activeClass}` : ''}
            >
              {b}
              {paginated && (
                <PaginationArrows
                  showNext={!onLastPage}
                  showBack={!onFirstPage}
                />
              )}
              {showEnd && endItem}
            </div>
          );
        })}
      </div>
    </div>
  );
};

Pagination.displayName = 'Pagination';
export default Pagination;
