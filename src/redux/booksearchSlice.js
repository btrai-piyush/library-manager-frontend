// booksearchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookApi } from '../api/Api';

const bookDefaultFilters = {
  searchTerm: '',
  courseCode: '',
  sortBy: 'title',
  isDescending: false,
  pageNumber: 1,
  pageSize: 20, // fixed
};

const initialState = {
  books: [],
  loading: false,
  error: null,
  defaultFilters: { ...bookDefaultFilters },
  appliedFilters: { ...bookDefaultFilters },
};

export const fetchFilteredBooks = createAsyncThunk(
  'booksearch/fetchFilteredBooks',
  async (filters, { rejectWithValue }) => {
    try {
      return await bookApi.getFiltered(filters);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const booksearchSlice = createSlice({
  name: 'booksearch',
  initialState,
  reducers: {
    setBooks: (state, action) => {
      state.books = action.payload;
    },
    setAppliedFilters: (state, action) => {
      state.appliedFilters = action.payload;
    },
    resetFilters: (state) => {
      state.appliedFilters = { ...state.defaultFilters };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchFilteredBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setBooks, setAppliedFilters, resetFilters } = booksearchSlice.actions;

export const selectBookState = (state) => state.booksearch;
export const selectBooks = (state) => selectBookState(state).books;
export const selectAppliedFilters = (state) => selectBookState(state).appliedFilters;
export const selectLoading = (state) => selectBookState(state).loading;
export const selectError = (state) => selectBookState(state).error;

export default booksearchSlice.reducer;