import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  // Helper to generate a windowed range of page numbers with ellipsis
  const getPageNumbers = () => {
    const maxPagesToShow = 8;
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always show first page
    const pages: (number | string)[] = [1];
    const start = Math.max(2, currentPage - 3);
    const end = Math.min(totalPages - 1, currentPage + 4);
    
    if (start > 2) pages.push('...');
    
    // Generate range using map
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    pages.push(...range);
    
    if (end < totalPages - 1) pages.push('...');
    // Always show last page
    pages.push(totalPages);
    return pages;
  };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center my-3">
        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
        </li>
        {getPageNumbers().map((page, idx) =>
          typeof page === 'number' ? (
            <li key={page} className={`page-item${page === currentPage ? ' active' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(page)}>{page}</button>
            </li>
          ) : (
            <li key={`ellipsis-${idx}`} className="page-item disabled">
              <span className="page-link">&hellip;</span>
            </li>
          )
        )}
        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 