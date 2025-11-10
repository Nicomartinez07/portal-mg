"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const pageLimit = 2;
    const startPage = Math.max(1, currentPage - pageLimit);
    const endPage = Math.min(totalPages, currentPage + pageLimit);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("…");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("…");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
  <nav className="flex justify-center sm:justify-end mt-3 px-2">
    <div className="inline-flex rounded-md shadow-sm border border-gray-300 overflow-hidden">
      {/* Botón anterior */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm font-semibold text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        «
      </button>

      {/* Números de página */}
      {getPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            className={`px-3 py-1 text-sm font-semibold border-l border-gray-300 transition ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "text-blue-600 bg-white hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ) : (
          <span
            key={index}
            className="px-3 py-1 text-sm text-gray-500 border-l border-gray-300 bg-white"
          >
            {page}
          </span>
        )
      )}

      {/* Botón siguiente */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm font-semibold text-gray-500 bg-white hover:bg-gray-50 border-l border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        »
      </button>
    </div>
  </nav>
);
}
