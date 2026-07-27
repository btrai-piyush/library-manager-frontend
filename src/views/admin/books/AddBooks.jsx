import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    Trash2,
    ScanBarcode,
    BookOpen,
    Loader2,
    X,
    Save,
    Search,
} from 'lucide-react';

import { addBookToList, removeBookFromList, clearBooks } from '../../../redux/addBooksSlice';
import { addBookByBarcodeApi, bookApi, subjectApi, categoryApi } from '../../../api/api';
import BarcodeScanner from '../../../components/books/BarcodeScanner';
import { toast } from 'react-toastify';

const emptyBook = {
    title: '',
    isbn: '',
    authors: [],
    totalCopies: 1,
    categories: [],
    publisher: '',
    publisherAddress: '',
    subjectIds: [],
};

// FIXED: Moved inside component
export default function AddBooks() {
    const dispatch = useDispatch();
    const books = useSelector((state) => state.addBooks.books);

    // State
    const [showForm, setShowForm] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [book, setBook] = useState(emptyBook);
    const [subjects, setSubjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingBook, setLoadingBook] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isbn, setIsbn] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newAuthor, setNewAuthor] = useState({ firstName: '', lastName: '' });
    const [subjectSearch, setSubjectSearch] = useState('');
    const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
    const selectedSubjectsCount = book.subjectIds.length;

    // Refs for click‑outside
    const subjectDropdownRef = useRef(null);

    // Load subjects & categories on mount
    useEffect(() => {
        loadSubjects();
        loadCategories();
    }, []);

    // Click‑outside handler for subject dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(e.target)) {
                setShowSubjectDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadSubjects = async () => {
        try {
            setLoadingSubjects(true);
            const response = await subjectApi.getAllSubjects();
            setSubjects(response?.data ?? response ?? []);
        } catch (error) {
            console.error('Failed to load subjects:', error);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await categoryApi.getAllCategories();
            setCategories(response?.data ?? response ?? []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    // FIXED: Now inside component, can access state and setters
    const addManualAuthor = useCallback(() => {
        const firstName = newAuthor.firstName.trim();
        const lastName = newAuthor.lastName.trim();
        if (!firstName || !lastName) return;

        const alreadyExists = book.authors.some(
            (author) =>
                author.firstName.trim().toLowerCase() === firstName.toLowerCase() &&
                author.lastName.trim().toLowerCase() === lastName.toLowerCase()
        );
        if (alreadyExists) return;

        setBook((prev) => ({
            ...prev,
            authors: [...prev.authors, { firstName, lastName }],
        }));
        setNewAuthor({ firstName: '', lastName: '' });
    }, [newAuthor, book.authors]);

    // FIXED: Now inside component
    const removeAuthor = useCallback((indexToRemove) => {
        setBook((prev) => ({
            ...prev,
            authors: prev.authors.filter((_, index) => index !== indexToRemove),
        }));
    }, []);

    const filteredSubjects = subjects.filter((subject) => {
        const search = subjectSearch.trim().toLowerCase();
        if (!search) return true;
        return subject.name?.toLowerCase().includes(search) || subject.code?.toLowerCase().includes(search);
    });

    const isValidIsbn = (value) => {
        const clean = value.replace(/[-\s]/g, '');
        return /^(97[89])?\d{9}[\dX]$/.test(clean); // basic ISBN‑10/13
    };

    const lookupBook = async (value) => {
        const cleanIsbn = value.trim();
        if (!cleanIsbn) return;
        if (!isValidIsbn(cleanIsbn)) {
            alert('Please enter a valid ISBN.');
            return;
        }

        try {
            setLoadingBook(true);
            const response = await addBookByBarcodeApi.getByISBN(cleanIsbn);
            const data = response?.data ?? response;

            // Only update if we have a valid book (title or ISBN present)
            if (data && (data.title || data.isbn)) {
                setBook((prev) => ({
                    ...prev,
                    title: data.title ?? '',
                    isbn: data.isbn ?? cleanIsbn,
                    authors: data.authors ?? [],
                    publisher: data.publisher ?? data.publisherName ?? '',
                    publisherAddress: data.publisherAddress ?? '',
                }));
                setIsbn(data.isbn ?? cleanIsbn);
            } else {
                // No book found – do not fill anything, just alert
                toast.error('Could not find book information for this ISBN.');
            }
        } catch (error) {
            console.error('Failed to lookup book:', error);
            alert('Could not find book information for this ISBN.');
        } finally {
            setLoadingBook(false);
        }
    };

    const handleBarcodeScan = async (barcode) => {
        setShowScanner(false);
        setIsbn(barcode);
        await lookupBook(barcode);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setBook((prev) => ({ ...prev, [name]: value }));
    };

    const toggleCategory = (categoryName) => {
        setBook((prev) => {
            const exists = prev.categories.includes(categoryName);
            return {
                ...prev,
                categories: exists
                    ? prev.categories.filter((c) => c !== categoryName)
                    : [...prev.categories, categoryName],
            };
        });
    };

    const addNewCategory = () => {
        const category = newCategory.trim();
        if (!category) return;
        setBook((prev) => ({
            ...prev,
            categories: prev.categories.includes(category) ? prev.categories : [...prev.categories, category],
        }));
        setNewCategory('');
    };

    const toggleSubject = (subjectId) => {
        setBook((prev) => {
            const exists = prev.subjectIds.includes(subjectId);
            return {
                ...prev,
                subjectIds: exists ? prev.subjectIds.filter((id) => id !== subjectId) : [...prev.subjectIds, subjectId],
            };
        });
        // Optionally close dropdown after selection for a cleaner UX
        // setShowSubjectDropdown(false);
    };

    const handleAddBook = () => {
        if (!book.title.trim()) {
            alert('Book title is required.');
            return;
        }
        if (!book.isbn.trim()) {
            alert('ISBN is required.');
            return;
        }
        if (book.totalCopies < 1) {
            alert('Total copies must be at least 1.');
            return;
        }

        const formattedBook = {
            title: book.title.trim(),
            isbn: book.isbn.trim(),
            authors: book.authors.map((author) => ({
                firstName: author.firstName ?? '',
                lastName: author.lastName ?? '',
            })),
            totalCopies: Number(book.totalCopies),
            categories: book.categories,
            publisher: book.publisher.trim(),
            publisherAddress: book.publisherAddress.trim(),
            subjectIds: book.subjectIds,
            availableCopies: Number(book.totalCopies), // backend may override
        };

        dispatch(addBookToList(formattedBook));
        setBook(emptyBook);
        setIsbn('');
        setShowForm(false);
    };

    const handleRemoveBook = (index) => {
        dispatch(removeBookFromList(index));
    };

    const handleSaveAll = async () => {
        if (books.length === 0) return;
        try {
            setSaving(true);
            await bookApi.addBooks(books);
            dispatch(clearBooks());
            alert('All books were added successfully.');
        } catch (error) {
            console.error('Failed to add books:', error);
            alert('Failed to save books.');
        } finally {
            setSaving(false);
        }
    };

    // ---- Render helpers ----
    const renderBookForm = () => (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Add Book</h2>
                    <p className="text-sm text-gray-500">Enter book information or scan its ISBN barcode.</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setShowForm(false);
                        setBook(emptyBook);
                    }}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                    <X size={20} />
                </button>
            </div>

            {/* ISBN */}
            <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">ISBN</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={isbn}
                        onChange={(e) => {
                            setIsbn(e.target.value);
                            setBook((prev) => ({ ...prev, isbn: e.target.value }));
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && lookupBook(isbn)}
                        placeholder="Enter ISBN"
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                    <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        <ScanBarcode size={10} /> Scan
                    </button>
                    <button
                        type="button"
                        onClick={() => lookupBook(isbn)}
                        disabled={loadingBook || !isbn.trim()}
                        className="rounded-xl border border-gray-300 px-4 py-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loadingBook ? <Loader2 size={20} className="animate-spin" /> : 'Lookup'}
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
                <input
                    name="title"
                    value={book.title}
                    onChange={handleChange}
                    placeholder="Book title"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
            </div>

            {/* Authors */}
            <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Authors</label>
                <div className="mb-3 flex flex-wrap gap-2">
                    {book.authors.length > 0 ? (
                        book.authors.map((author, index) => (
                            <span
                                key={`${author.firstName}-${author.lastName}-${index}`}
                                className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700"
                            >
                                <span>{author.firstName} {author.lastName}</span>
                                <button type="button" onClick={() => removeAuthor(index)} className="rounded-full text-gray-500 hover:text-red-500">
                                    <X size={15} />
                                </button>
                            </span>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No authors added yet.</p>
                    )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Add Author Manually</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="text"
                            value={newAuthor.firstName}
                            onChange={(e) => setNewAuthor((prev) => ({ ...prev, firstName: e.target.value }))}
                            placeholder="First name"
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                        />
                        <input
                            type="text"
                            value={newAuthor.lastName}
                            onChange={(e) => setNewAuthor((prev) => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Last name"
                            onKeyDown={(e) => e.key === 'Enter' && addManualAuthor()}
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                        />
                        <button
                            type="button"
                            onClick={addManualAuthor}
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Add Author
                        </button>
                    </div>
                </div>
            </div>

            {/* Publisher & Address */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Publisher</label>
                    <input
                        name="publisher"
                        value={book.publisher}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Publisher Address</label>
                    <input
                        name="publisherAddress"
                        value={book.publisherAddress}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                    />
                </div>
            </div>

            {/* Copies */}
            <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Total Copies</label>
                <input
                    type="number"
                    min="1"
                    name="totalCopies"
                    value={book.totalCopies}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
            </div>

            {/* Categories */}
            <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Categories</label>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                        const selected = book.categories.includes(category.name);
                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => toggleCategory(category.name)}
                                className={`rounded-full border px-3 py-1.5 text-sm ${selected
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {category.name}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-3 flex gap-2">
                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addNewCategory()}
                        placeholder="Add new category"
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-gray-900"
                    />
                    <button type="button" onClick={addNewCategory} className="rounded-xl border border-gray-300 px-4 py-2.5 hover:bg-gray-50">
                        Add
                    </button>
                </div>
                {book.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {book.categories.map((category) => (
                            <span key={category} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm">
                                {category}
                                <button type="button" onClick={() => toggleCategory(category)}>
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Subjects */}
            <div className="mt-6" ref={subjectDropdownRef}>
                <label className="mb-2 block text-sm font-medium text-gray-700">Subjects</label>
                <div className="relative">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={subjectSearch}
                            onFocus={() => setShowSubjectDropdown(true)}
                            onChange={(e) => {
                                setSubjectSearch(e.target.value);
                                setShowSubjectDropdown(true);
                            }}
                            placeholder="Search subjects by name or code..."
                            className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />
                        {selectedSubjectsCount > 0 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {selectedSubjectsCount} selected
                            </span>
                        )}
                    </div>
                    {showSubjectDropdown && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                            {loadingSubjects ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 size={20} className="animate-spin text-gray-500" />
                                </div>
                            ) : filteredSubjects.length > 0 ? (
                                filteredSubjects.map((subject) => {
                                    const selected = book.subjectIds.includes(subject.id);
                                    return (
                                        <button
                                            type="button"
                                            key={subject.id}
                                            onClick={() => toggleSubject(subject.id)}
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${selected
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{subject.name}</p>
                                                {subject.code && <p className="text-xs text-gray-500">{subject.code}</p>}
                                            </div>
                                            {selected && (
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="px-3 py-6 text-center text-sm text-gray-500">No subjects found.</p>
                            )}
                        </div>
                    )}
                </div>
                {book.subjectIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {book.subjectIds.map((subjectId) => {
                            const subject = subjects.find((item) => item.id === subjectId);
                            if (!subject) return null;
                            return (
                                <span key={subjectId} className="flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 text-sm text-gray-700">
                                    {subject.name} ({subject.code})
                                    <button type="button" onClick={() => toggleSubject(subjectId)} className="text-blue-500 hover:text-blue-700">
                                        <X size={14} />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add to pending list */}
            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleAddBook}
                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
                >
                    <Plus size={20} /> Add to List
                </button>
            </div>
        </div>
    );

    const renderBookList = () => (
        <div className="space-y-4">
            {books.map((item, index) => (
                <div key={`${item.isbn}-${index}`} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                <BookOpen size={22} className="text-gray-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                <p className="mt-1 text-sm text-gray-500">ISBN: {item.isbn}</p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {item.authors.map((author) => `${author.firstName} ${author.lastName}`).join(', ')}
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={() => handleRemoveBook(index)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-4">
                        <div>
                            <p className="text-gray-500">Publisher</p>
                            <p className="font-medium">{item.publisher || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Copies</p>
                            <p className="font-medium">{item.totalCopies}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Categories</p>
                            <p className="font-medium">{item.categories.length}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Subjects</p>
                            <p className="font-medium">{item.subjectIds.length}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // ---- Main render ----
    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Add Books</h1>
                            <p className="mt-1 text-sm text-gray-500">Add multiple books to your library inventory.</p>
                        </div>
                        {!showForm && (
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white shadow-sm hover:bg-gray-800"
                            >
                                <Plus size={20} /> Add Book
                            </button>
                        )}
                    </div>

                    {/* Book form */}
                    {showForm && renderBookForm()}

                    {/* Pending books */}
                    {books.length > 0 && (
                        <div className="mt-8">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Books to Add</h2>
                                    <p className="text-sm text-gray-500">
                                        {books.length} book{books.length !== 1 ? 's' : ''} ready to save
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSaveAll}
                                    disabled={saving || books.length === 0} // FIXED: disable when empty
                                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    Save All Books
                                </button>
                            </div>
                            {renderBookList()}
                        </div>
                    )}

                    {/* Empty state */}
                    {!showForm && books.length === 0 && (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                <BookOpen size={30} className="text-gray-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">No books added yet</h2>
                            <p className="mt-1 max-w-sm text-sm text-gray-500">
                                Click the plus button to manually add a book or scan its ISBN barcode.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
                                className="mt-5 flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
                            >
                                <Plus size={20} /> Add Your First Book
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Barcode scanner modal */}
            {showScanner && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowScanner(false);
                        }
                    }}
                >
                    <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
                </div>
            )}
        </>
    );
}