import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchFilteredBooks,
  setAppliedFilters,
  selectAppliedFilters,
  selectBooks,
  selectLoading,
  selectError,
} from '../../redux/BookSearchSlice';
import Pagination from '../../components/Pagination';
import { Eye, HeartPlus } from 'lucide-react';
import { wishlistApi } from '../../api/Api';
import { toast } from 'react-toastify';

const BookSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appliedFilters = useSelector(selectAppliedFilters);
  const books = useSelector(selectBooks);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const userRole = useSelector((state) => state.auth.user?.role);
  const userId = useSelector((state) => state.auth.user?.userId);

  const [searchTerm, setSearchTerm] = useState(appliedFilters.searchTerm || '');
  const [courseCode, setCourseCode] = useState(appliedFilters.courseCode || '');
  const [sortBy, setSortBy] = useState(appliedFilters.sortBy || 'title');
  const [isDescending, setIsDescending] = useState(appliedFilters.isDescending || false);
  const [pageNumber, setPageNumber] = useState(appliedFilters.pageNumber || 1);
  const pageSize = 20;

  const totalResults = books.length > 0 ? books[0].resultCount : 0;
  const totalPages = Math.ceil(totalResults / pageSize);

  const handleWishlistAdd = async (bookId) => {
    const body = { userId, bookId };
    try {
      var response = await wishlistApi.addToWishlist(body);
      toast.success('Book added to wishlist!');
    } catch (error) {
      console.error('Error adding book to wishlist:', error);
      toast.error(error.message);
    }
  }

  const handleSearch = () => {
    // Always reset to page 1 when a new search is executed
    setPageNumber(1);
    const filters = {
      searchTerm,
      courseCode,
      sortBy,
      isDescending,
      pageNumber: 1,
      pageSize,
    };
    dispatch(setAppliedFilters(filters));
    dispatch(fetchFilteredBooks(filters));
  };

  const handleReset = () => {
    const defaultFilters = {
      searchTerm: '',
      courseCode: '',
      sortBy: 'title',
      isDescending: false,
      pageNumber: 1,
      pageSize,
    };
    setSearchTerm(defaultFilters.searchTerm);
    setCourseCode(defaultFilters.courseCode);
    setSortBy(defaultFilters.sortBy);
    setIsDescending(defaultFilters.isDescending);
    setPageNumber(defaultFilters.pageNumber);
    dispatch(setAppliedFilters(defaultFilters));
    dispatch(fetchFilteredBooks(defaultFilters));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
    const filters = {
      searchTerm,
      courseCode,
      sortBy,
      isDescending,
      pageNumber: newPage,
      pageSize,
    };
    dispatch(setAppliedFilters(filters));
    dispatch(fetchFilteredBooks(filters));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Library Catalog</h1>
          <p className="mt-2 text-gray-600">
            Search books by title, author, ISBN or course code
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Title, Author..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Course Code</label>
              <input
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="CS101"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="year">Year</option>
                <option value="courseCode">Course Code</option>
              </select>
            </div>
          </div>

          {/* Order By */}
          <div className="flex flex-wrap items-center justify-between mt-6 gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Order:</span>
              <div className="inline-flex rounded-xl border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setIsDescending(false)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${!isDescending
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Ascending
                </button>
                <button
                  onClick={() => setIsDescending(true)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${isDescending
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Descending
                </button>
              </div>
            </div>

            <div className="space-x-3">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Search Results</h2>
            <div className="flex justify-between items-center bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {books.length} of {totalResults} matches
              </p>
              <Pagination
                currentPage={pageNumber}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>


          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error: {error}</div>
          ) : books.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No books match your search.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr className="text-left">
                      <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                      <th className="px-6 py-4 font-semibold text-gray-700">Author</th>
                      {/* <th className="px-6 py-4 font-semibold text-gray-700">Categories</th> */}
                      <th className="px-6 py-4 font-semibold text-gray-700">ISBN</th>
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
                        {/* <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {book.categories?.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td> */}
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{book.isbn}</td>
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
                            {userRole === 'admin' && (
                              <button
                                className="text-blue-600 hover:text-blue-900 hover:cursor-pointer"
                                title="View Details"
                                onClick={() => navigate(`/admin/books/${book.id}`)}
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            )}
                            {userRole === 'user' && (
                              <button
                                className="text-blue-600 hover:text-blue-900 hover:cursor-pointer"
                                title="View Details"
                                onClick={() => navigate(`/user/books/${book.id}`)}
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            )}
                            {userRole === 'user' && (
                              <button className="ml-4 text-green-600 hover:text-green-900 hover:cursor-pointer" onClick={() => handleWishlistAdd(book.id)} title="Add to Wishlist">
                                <HeartPlus className="w-5 h-5" />
                              </button>
                            )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookSearch;