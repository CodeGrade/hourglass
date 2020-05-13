import React from 'react';
import PaginationArrows from '@hourglass/containers/PaginationArrows';

interface PaginationProps {
  paginated: boolean;
  current: number;
  max: number;
  endItem: JSX.Element;
  children: React.ReactChild[];
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    paginated,
    current,
    max,
    children,
    endItem,
  } = props;
  const onFirstPage = current === 0;
  const onLastPage = current === max - 1;
  const showEnd = paginated && onLastPage;
  return (
    <div>
      <div>
        {children.map((b, i) => {
          const isCurrent = current === i;
          const active = !paginated || isCurrent;
          const activeClass = active ? '' : 'd-none';
          return (
            // Page indices are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} className={activeClass}>
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
      {!paginated && endItem}
    </div>
  );
};

Pagination.displayName = 'Pagination';
export default Pagination;
