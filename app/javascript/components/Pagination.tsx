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
  const showEnd = !paginated || onLastPage;
  const endClass = showEnd ? '' : 'd-none';
  const arrowsClass = paginated ? '' : 'd-none';
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
              <div>
                {b}
              </div>
              <div className={arrowsClass}>
                <PaginationArrows
                  showNext={!onLastPage}
                  showBack={!onFirstPage}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className={endClass}>
        {endItem}
      </div>
    </div>
  );
};

Pagination.displayName = 'Pagination';
export default Pagination;
