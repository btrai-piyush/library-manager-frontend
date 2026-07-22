import { useEffect, useState } from 'react';
import { bookRequestApi, wishlistApi } from '../../api/api';
import { Eye, Trash2, Loader2, Send, Undo2, Search, BookMarked } from 'lucide-react';
import Pagination from '../../components/pagination';
import { toast } from 'react-toastify';

export default function Wishlist() {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [undoTarget, setUndoTarget] = useState(null);
  const [books, setBooks] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const pageSize = 20;

  // Separate pagination for each section
  const [wishlistPage, setWishlistPage] = useState(1);
  const [requestedPage, setRequestedPage] = useState(1);

  const user = localStorage.getItem('librarymanager.auth.user');
  const userId = user ? JSON.parse(user).id : null;

  // Fetch wishlist and requested books on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [wishlistRes, requestedRes] = await Promise.all([
          wishlistApi.getWishlist(userId),
          bookRequestApi.getRequestedBooks(userId),
        ]);
        setBooks(Array.isArray(wishlistRes) ? wishlistRes : []);
        setRequestedBooks(
          Array.isArray(requestedRes) ? requestedRes : requestedRes?.data ?? []
        );
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  // Search filter
  const filterBySearch = (list) =>
    list.filter((item) =>
      [item.title, item.publisher, ...(item.authors?.map(a => `${a.firstName} ${a.lastName}`) ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // Filtered lists
  const filteredWishlist = filterBySearch(books);
  const filteredRequested = filterBySearch(requestedBooks);

  // Pagination helpers
  const paginate = (list, page) => {
    const start = (page - 1) * pageSize;
    return {
      totalPages: Math.ceil(list.length / pageSize),
      paginated: list.slice(start, start + pageSize),
    };
  };

  const { totalPages: wishlistTotal, paginated: paginatedBooks } = paginate(filteredWishlist, wishlistPage);
  const { totalPages: requestedTotal, paginated: paginatedRequested } = paginate(filteredRequested, requestedPage);

  // Reset pages when search changes
  useEffect(() => {
    setWishlistPage(1);
    setRequestedPage(1);
  }, [search]);

  // Handlers (unchanged logic, just cleaned)
  const handleRemove = (bookId) => setDeleteTarget(bookId);

  const confirmRemove = async () => {
    try {
      await wishlistApi.removeFromWishlist({ userId, bookId: deleteTarget });
      setBooks((prev) => prev.filter((b) => b.id !== deleteTarget));
      toast.success('Book removed from wishlist.');
    } catch (err) {
      toast.error('Could not remove the book.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRequest = async (bookId) => {
    try {
      await bookRequestApi.requestBook({ userId, bookId });
      const refreshed = await bookRequestApi.getRequestedBooks(userId);
      const data = refreshed?.data ?? refreshed;
      setRequestedBooks(Array.isArray(data) ? data : []);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast.success('Book request sent.');
    } catch (err) {
      toast.error('Could not request the book.');
    }
  };

  const handleUndoRequest = async (bookId, removeFromWishlist) => {
    try {
      await bookRequestApi.undoBookRequest({ userId, bookId, removeFromWishlist });
      setRequestedBooks((prev) => prev.filter((b) => b.id !== bookId));
      if (removeFromWishlist) {
        toast.success('Request undone, book removed from wishlist.');
      } else {
        const updated = await wishlistApi.getWishlist(userId);
        setBooks(Array.isArray(updated) ? updated : []);
        toast.success('Request undone, book kept in wishlist.');
      }
    } catch (err) {
      toast.error('Could not undo request.');
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

  // ----- MAIN CONTENT -----
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Your Wishlist
          </h1>
          <p className="mt-2 text-gray-600">
            Books you've saved and requested. Keep track of what you want to read next.
          </p>
        </div>

        {/* Global Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search your books by title, author, or publisher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Wishlist Section */}
        <SectionCard
          title="Saved Books"
          icon={<BookMarked className="w-5 h-5 text-blue-600" />}
          count={filteredWishlist.length}
          page={wishlistPage}
          totalPages={wishlistTotal}
          onPageChange={setWishlistPage}
        >
          {paginatedBooks.length === 0 ? (
            <EmptyState message="No saved books found." search={search} />
          ) : (
            <WishlistTable
              books={paginatedBooks}
              onRemove={handleRemove}
              onRequest={handleRequest}
            />
          )}
        </SectionCard>

        {/* Requested Books Section */}
        <div className="mt-8">
          <SectionCard
            title="Requested Books"
            icon={<Send className="w-5 h-5 text-green-600" />}
            count={filteredRequested.length}
            page={requestedPage}
            totalPages={requestedTotal}
            onPageChange={setRequestedPage}
          >
            {paginatedRequested.length === 0 ? (
              <EmptyState message="No requested books found." search={search} />
            ) : (
              <RequestedTable
                books={paginatedRequested}
                onUndoRequest={handleUndoRequest}
                onUndoAndRemove={(id) => setUndoTarget(id)}
              />
            )}
          </SectionCard>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmRemove}
        title="Remove from wishlist?"
        message="This book will be removed from your wishlist."
        confirmLabel="Remove"
        confirmStyle="bg-red-600 hover:bg-red-700"
      />

      {/* Undo & Remove Confirmation Modal */}
      <ConfirmModal
        open={!!undoTarget}
        onClose={() => setUndoTarget(null)}
        onConfirm={async () => {
          await handleUndoRequest(undoTarget, true);
          setUndoTarget(null);
        }}
        title="Undo request and remove?"
        message="The request will be undone and the book removed from your wishlist."
        confirmLabel="Undo & Remove"
        confirmStyle="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable subcomponents (can be defined in same file or imported) */
/* ------------------------------------------------------------------ */

function SectionCard({ title, icon, count, page, totalPages, onPageChange, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">
              {count} {count === 1 ? 'book' : 'books'}
              {totalPages > 1 && ` – Page ${page} of ${totalPages}`}
            </p>
          </div>
        </div>
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        )}
      </div>
      {children}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t bg-gray-50/50 flex items-center justify-between">
          <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

function EmptyState({ message, search }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="text-gray-300 text-5xl mb-3">📚</div>
      <p className="text-gray-500">{message}</p>
      {search && (
        <p className="text-sm text-gray-400 mt-1">Try a different search term.</p>
      )}
    </div>
  );
}

function WishlistTable({ books, onRemove, onRequest }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Publisher</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 whitespace-wrap">
                <div className="text-sm font-medium text-gray-900">{book.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                  {book.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-600">{book.publisher}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  book.availableCopies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {book.availableCopies ?? 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-3">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors" title="View details"
                    onClick={() => console.log('View book', book.id)}>
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600 transition-colors" title="Remove"
                    onClick={() => onRemove(book.id)}>
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-green-600 transition-colors" title="Request"
                    onClick={() => onRequest(book.id)}>
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequestedTable({ books, onUndoRequest, onUndoAndRemove }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Publisher</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 whitespace-wrap">
                <div className="text-sm font-medium text-gray-900">{book.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                  {book.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-600">{book.publisher}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-3">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors" title="View details"
                    onClick={() => console.log('View book', book.id)}>
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600 transition-colors" title="Undo & remove"
                    onClick={() => onUndoAndRemove(book.id)}>
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-green-600 transition-colors" title="Undo only"
                    onClick={() => onUndoRequest(book.id, false)}>
                    <Undo2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, confirmStyle }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm text-white rounded-md ${confirmStyle}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}