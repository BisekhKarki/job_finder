"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Props {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPage,
  onPageChange,
}: Props) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPage, currentPage + halfVisible);

    if (currentPage <= halfVisible + 1) {
      endPage = Math.min(totalPage, maxVisible);
    } else if (currentPage >= totalPage - halfVisible) {
      startPage = Math.max(1, totalPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPage) {
      if (endPage < totalPage - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPage);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPage;

  return (
    <div className="flex items-center justify-center mt-8 mb-4">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .pagination-button {
          animation: slideIn 0.3s ease-out;
        }

        .pagination-button:active {
          animation: pulse-scale 0.2s ease-out;
        }
      `}</style>

      <nav className="flex items-center gap-1 md:gap-2" aria-label="Pagination">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={isFirstPage}
          className={`pagination-button flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-lg font-medium transition-all duration-200 ${
            isFirstPage
              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:bg-slate-100"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 md:gap-2 mx-2">
          {pageNumbers.map((page, index) => {
            if (typeof page === "string") {
              return (
                <span
                  key={page}
                  className="px-2 text-slate-400 font-medium"
                  aria-hidden="true"
                >
                  •••
                </span>
              );
            }

            const isActive = currentPage === page;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`pagination-button w-10 h-10 md:w-11 md:h-11 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105 hover:bg-slate-800"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPage))}
          disabled={isLastPage}
          className={`pagination-button flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-lg font-medium transition-all duration-200 ${
            isLastPage
              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:bg-slate-100"
          }`}
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </nav>

      {/* Page Info */}
      <div className="hidden sm:flex items-center ml-4 md:ml-6 text-xs md:text-sm text-slate-500 font-medium">
        Page{" "}
        <span className="font-semibold text-slate-900 mx-1">{currentPage}</span>{" "}
        of{" "}
        <span className="font-semibold text-slate-900 mx-1">{totalPage}</span>
      </div>
    </div>
  );
}
