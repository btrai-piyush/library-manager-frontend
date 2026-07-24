import { useEffect, useState } from 'react';
import { wishlistApi, bookRequestApi } from '../../../api/Api';
import { Eye, Trash2, Send, Search, BookMarked, Loader2 } from 'lucide-react';
import Pagination from '../../../components/Pagination';
import { toast } from 'react-toastify';

export default function Wishlist() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pageSize = 20;

  const user = localStorage.getItem('librarymanager.auth.user');
  const userId = user ? JSON.parse(user).id : null;

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await wishlistApi.getWishlist(userId);
        setBooks(Array.isArray(res) ? res : []);
      } catch (err) {
        setError('Failed to load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchWishlist();
  }, [userId]);

  const filtered = books.filter((book) =>
    [book.title, book.publisher, ...(book.authors?.map(a => `${a.firstName} ${a.lastName}`) ?? [])]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => setPage(1), [search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const confirmRemove = async () => {
    try {
      await wishlistApi.removeFromWishlist({ userId, bookId: deleteTarget });
      setBooks((prev) => prev.filter((b) => b.id !== deleteTarget));
      toast.success('Book removed from wishlist.');
    } catch {
      toast.error('Could not remove the book.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRequest = async (bookId) => {
    try {
      await bookRequestApi.requestBook({ userId, bookId });
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast.success('Book request sent. Moved to Requested Books.');
    } catch {
      toast.error('Could not request the book.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading your wishlist...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-6xl mb-4">⚠</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Wishlist</h1>
      <p className="text-gray-600 mb-6">Books you've saved for later.</p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by title, author, or publisher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Saved Books</h2>
              <p className="text-sm text-gray-500">{filtered.length} book{filtered.length !== 1 && 's'}</p>
            </div>
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>

        {paginated.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            📚<br />No saved books found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Publisher</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.map((book) => (
                  <tr key={book.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{book.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {book.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{book.publisher}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        book.availableCopies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {book.availableCopies ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button className="text-gray-400 hover:text-blue-600" title="View details">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600" title="Remove" onClick={() => setDeleteTarget(book.id)}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-green-600" title="Request" onClick={() => handleRequest(book.id)}>
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t bg-gray-50/50 flex justify-between items-center">
            <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Remove from wishlist?</h3>
            <p className="text-gray-600 mb-4">This book will be removed from your wishlist.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100">Cancel</button>
              <button onClick={confirmRemove} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}