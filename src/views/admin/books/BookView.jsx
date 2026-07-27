import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookApi, subjectApi } from '../../../api/Api';
import { Loader2, ArrowLeft, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const BookView = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [book, setBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  // Subjects for dropdown
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

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
        console.log('Fetched book:', response);
        setBook(response);
        // Initialize edit data
        setEditData({
          title: response.title || '',
          authors: response.authors?.map(a => ({ firstName: a.firstName || '', lastName: a.lastName || '' })) || [{ firstName: '', lastName: '' }],
          isbn: response.isbn || '',
          totalCopies: response.totalCopies || 0,
          additionalCopies: 0,
          categories: response.categories?.join(', ') || '',
          publisher: response.publisher || '',
          publisherAddress: response.publisherAddress || '',
          availableCopies: response.availableCopies || 0,
          subjectIds: response.subjects?.map(s => s.id) || [],
        });
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

  // Fetch all subjects for dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectApi.getAllSubjects();
        setAllSubjects(response);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        // Don't show error to user; subjects dropdown will be empty
      }
    };
    fetchSubjects();
  }, []);

  // Format helpers
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return '—';
    return authors.map(a => `${a.firstName} ${a.lastName}`).join(', ');
  };

  // Edit mode handlers
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit – reset to original data
      setEditData({
        title: book.title || '',
        authors: book.authors?.map(a => ({ firstName: a.firstName || '', lastName: a.lastName || '' })) || [{ firstName: '', lastName: '' }],
        isbn: book.isbn || '',
        totalCopies: book.totalCopies || 0,
        additionalCopies: 0,
        categories: book.categories?.join(', ') || '',
        publisher: book.publisher || '',
        publisherAddress: book.publisherAddress || '',
        availableCopies: book.availableCopies || 0,
        subjectIds: book.subjects?.map(s => s.id) || [],
      });
      setIsEditing(false);
      setSubjectSearchTerm('');
      setShowSubjectDropdown(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthorChange = (index, field, value) => {
    const updated = [...editData.authors];
    updated[index][field] = value;
    setEditData(prev => ({ ...prev, authors: updated }));
  };

  const addAuthor = () => {
    setEditData(prev => ({
      ...prev,
      authors: [...prev.authors, { firstName: '', lastName: '' }]
    }));
  };

  const removeAuthor = (index) => {
    if (editData.authors.length <= 1) {
      toast.warning('Book must have at least one author.');
      return;
    }
    const updated = editData.authors.filter((_, i) => i !== index);
    setEditData(prev => ({ ...prev, authors: updated }));
  };

  // Subject handling
  const toggleSubject = (subjectId) => {
    setEditData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }));
  };

  const removeSubject = (subjectId) => {
    setEditData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.filter(id => id !== subjectId)
    }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      const currentTotal = book.totalCopies || 0;
      const additional = parseInt(editData.additionalCopies) || 0;
      const newTotal = currentTotal + additional;

      const payload = {
        id: parseInt(bookId),
        title: editData.title,
        authors: editData.authors.map(a => ({
          firstName: a.firstName.trim(),
          lastName: a.lastName.trim()
        })),
        isbn: editData.isbn,
        totalCopies: newTotal,
        categories: editData.categories.split(',').map(c => c.trim()).filter(c => c),
        publisher: editData.publisher,
        publisherAddress: editData.publisherAddress,
        availableCopies: parseInt(editData.availableCopies) || 0,
        resultCount: 0,
        subjects: [],
        subjectIds: editData.subjectIds,
      };

      await bookApi.updateBook(bookId, payload);
      toast.success('Book updated successfully!');
      // Refresh book data
      const refreshed = await bookApi.getBookById(bookId);
      setBook(refreshed);
      setEditData({
        title: refreshed.title || '',
        authors: refreshed.authors?.map(a => ({ firstName: a.firstName || '', lastName: a.lastName || '' })) || [{ firstName: '', lastName: '' }],
        isbn: refreshed.isbn || '',
        totalCopies: refreshed.totalCopies || 0,
        additionalCopies: 0,
        categories: refreshed.categories?.join(', ') || '',
        publisher: refreshed.publisher || '',
        publisherAddress: refreshed.publisherAddress || '',
        availableCopies: refreshed.availableCopies || 0,
        subjectIds: refreshed.subjects?.map(s => s.id) || [],
      });
      setIsEditing(false);
      setSubjectSearchTerm('');
      setShowSubjectDropdown(false);
    } catch (err) {
      console.error('Error updating book:', err);
      toast.error(err?.message || 'Failed to update book.');
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
              {isEditing ? 'Edit Book' : 'Book Details'}
            </h1>
            <p className="mt-1 text-gray-600">
              {isEditing ? 'Update book information' : `Viewing details for "${book.title}"`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleEditToggle}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isEditing ? (
            // ---- EDIT MODE ----
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Authors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authors</label>
                {editData.authors.map((author, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={author.firstName}
                      onChange={(e) => handleAuthorChange(idx, 'firstName', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={author.lastName}
                      onChange={(e) => handleAuthorChange(idx, 'lastName', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={() => removeAuthor(idx)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove author"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addAuthor}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add author
                </button>
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  value={editData.isbn}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Total Copies - special section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Copies
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current</p>
                    <p className="text-lg font-medium text-gray-900">{book.totalCopies}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Additional</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.additionalCopies}
                      onChange={(e) => handleInputChange('additionalCopies', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">New Total</p>
                    <p className="text-lg font-medium text-gray-900">
                      {book.totalCopies + (parseInt(editData.additionalCopies) || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Copies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies</label>
                <input
                  type="number"
                  min="0"
                  readOnly={true}
                  value={editData.availableCopies}
                  onChange={(e) => handleInputChange('availableCopies', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Publisher & Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                <input
                  type="text"
                  value={editData.publisher}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publisher Address</label>
                <input
                  type="text"
                  value={editData.publisherAddress}
                  onChange={(e) => handleInputChange('publisherAddress', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma separated)</label>
                <input
                  type="text"
                  value={editData.categories}
                  onChange={(e) => handleInputChange('categories', e.target.value)}
                  placeholder="e.g. Fiction, Science, History"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Subjects - Searchable Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search subjects by name or code..."
                    value={subjectSearchTerm}
                    onChange={(e) => setSubjectSearchTerm(e.target.value)}
                    onFocus={() => setShowSubjectDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {showSubjectDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {allSubjects
                        .filter(s =>
                          s.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
                          s.code.toLowerCase().includes(subjectSearchTerm.toLowerCase())
                        )
                        .map(subject => (
                          <div
                            key={subject.id}
                            className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => toggleSubject(subject.id)}
                          >
                            <input
                              type="checkbox"
                              checked={editData.subjectIds.includes(subject.id)}
                              onChange={() => {}}
                              className="mr-2"
                            />
                            <span>{subject.name} ({subject.code})</span>
                          </div>
                        ))}
                      {allSubjects.length === 0 && (
                        <div className="px-4 py-2 text-gray-500">Loading subjects...</div>
                      )}
                      {allSubjects.filter(s =>
                        s.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
                        s.code.toLowerCase().includes(subjectSearchTerm.toLowerCase())
                      ).length === 0 && allSubjects.length > 0 && (
                        <div className="px-4 py-2 text-gray-500">No subjects match.</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editData.subjectIds.map(id => {
                    const subject = allSubjects.find(s => s.id === id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {subject ? `${subject.name} (${subject.code})` : `ID ${id}`}
                        <button
                          onClick={() => removeSubject(id)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Save button */}
              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // ---- VIEW MODE ----
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookView;