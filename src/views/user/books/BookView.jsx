import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { bookApi, wishlistApi, bookRequestApi } from '../../../api/Api';
import { Loader2, ArrowLeft, Heart, Send, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';

const UserBookView = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [book, setBook] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Fetch book details
  useEffect(() => {
    if (!bookId) {
      setError('No book ID provided.');
      setLoading(false);
      return;
    }

    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await bookApi.getBookById(bookId);
        setBook(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details.');
        toast.error('Could not load book information.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  // Format helpers
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return '—';
    return authors.map(a => `${a.firstName} ${a.lastName}`).join(', ');
  };

  // Wishlist handler
  const handleWishlist = async () => {
    if (!userId) {
      toast.error('Please log in to add to wishlist.');
      return;
    }
    try {
      const body = { userId, bookId: parseInt(bookId) };
      await wishlistApi.addToWishlist(body);
      setIsWishlisted(true);
      toast.success('Book added to wishlist!');
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      toast.error(err?.message || 'Failed to add to wishlist.');
    }
  };

  // Request handler
  const handleRequest = async () => {
    if (!userId) {
      toast.error('Please log in to request a book.');
      return;
    }
    setIsRequesting(true);
    try {
      const body = { userId, bookId: parseInt(bookId) };
      await bookRequestApi.requestBook(body); // adjust method name if needed
      toast.success('Book requested successfully!');
    } catch (err) {
      console.error('Error requesting book:', err);
      toast.error(err?.message || 'Failed to request book.');
    } finally {
      setIsRequesting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading book details...</span>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-red-500 text-6xl mb-4">⚠</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600">{error || 'Book not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Book Details
            </h1>
            <p className="mt-1 text-gray-600">
              Viewing details for "{book.title}"
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Book Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="text-lg font-medium text-gray-900">{book.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ISBN</p>
                <p className="text-lg font-medium text-gray-900">{book.isbn || '—'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Authors</p>
              <p className="text-lg font-medium text-gray-900">{formatAuthors(book.authors)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Copies</p>
                <p className="text-lg font-medium text-gray-900">{book.totalCopies}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Copies</p>
                <p className="text-lg font-medium text-gray-900">{book.availableCopies}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Publisher</p>
              <p className="text-lg font-medium text-gray-900">{book.publisher || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Publisher Address</p>
              <p className="text-lg font-medium text-gray-900">{book.publisherAddress || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-lg font-medium text-gray-900">
                {book.categories?.join(', ') || '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Subjects</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {book.subjects && book.subjects.length > 0 ? (
                  book.subjects.map(s => (
                    <span key={s.id} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {s.name} ({s.code})
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t flex flex-wrap gap-3">
              <button
                onClick={handleWishlist}
                disabled={isWishlisted}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isWishlisted
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                <Heart className="w-5 h-5" />
                {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <button
                onClick={handleRequest}
                disabled={isRequesting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isRequesting
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Send className="w-5 h-5" />
                {isRequesting ? 'Requesting...' : 'Request Book'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookView;