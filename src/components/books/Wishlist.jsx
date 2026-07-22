import React, { useEffect,useState } from 'react';
import { wishlistApi } from '../../api/api';
import Pagination from '../../components/pagination';

export default function WishlistTable({ books }) {
    const [pageNumber, setPageNumber] = useState(appliedFilters.pageNumber || 1);
      const pageSize = 20;
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Your Wishlist</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your books to request or borrow. Add books to your wishlist to keep track of what you want to read next.
                    </p>
                </div>

                {/* Results */}
                <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">Search Results</h2>
                        <div className="flex justify-between items-center bg-gray-50">
                            <p className="text-sm text-gray-600">
                                Showing {books.length} books
                            </p>
                            <Pagination
                                currentPage={pageNumber}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>



                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr className="text-left">
                                    <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Author</th>
                                    {/* <th className="px-6 py-4 font-semibold text-gray-700">Categories</th> */}
                                    {/* <th className="px-6 py-4 font-semibold text-gray-700">ISBN</th> */}
                                    <th className="px-6 py-4 font-semibold text-gray-700">Publisher</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Availability</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book) => (
                                    <tr key={book.id} className="border-t hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{book.title}</td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {book.authors?.map((a) => `${a.firstName} ${a.lastName}`).join(', ')}
                                        </td>

                                        {/* <td className="px-6 py-4 text-gray-600">{book.isbn}</td> */}
                                        <td className="px-6 py-4 text-gray-600">{book.publisher}</td>
                                        <td className="px-6 py-4 items-center">
                                            <div className="flex items-center justify-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${book.availableCopies > 0
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {userRole === 'admin' ? (
                                                        <span className="text-sm text-gray-500">
                                                            {book.availableCopies}/{book.totalCopies}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">
                                                            {book.availableCopies}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex items-center">
                                                <button className="text-blue-600 hover:text-blue-900 hover:cursor-pointer" title="View Details">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button className="ml-4 text-green-600 hover:text-green-900 hover:cursor-pointer" onClick={() => handleWishlistAdd(book.id)} title="Add to Wishlist">
                                                    <HeartPlus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-end p-4 border-t bg-gray-50">
                        <Pagination
                            currentPage={pageNumber}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}