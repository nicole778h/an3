import React, { useContext, useEffect } from 'react';
import { ItemContext } from './todo/ItemProvider';

const Pagination: React.FC = () => {
    const { currentPage, totalPages, changePage } = useContext(ItemContext);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    };

    useEffect(() => {
        // Assuming you're using a toast notification here
        if (currentPage) {
            // Show the toast or perform any side effect
        }
    }, [currentPage]);

    return (
        <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
            </button>
        </div>
    );
};

export default Pagination;
