import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    books: [],
};

const addBooksSlice = createSlice({
    name: 'addBooks',
    initialState,
    reducers: {
        addBookToList: (state, action) => {
            state.books.push(action.payload);
        },

        removeBookFromList: (state, action) => {
            state.books.splice(action.payload, 1);
        },

        updateBookInList: (state, action) => {
            const { index, book } = action.payload;

            if (state.books[index]) {
                state.books[index] = book;
            }
        },

        clearBooks: (state) => {
            state.books = [];
        },
    },
});

export const {
    addBookToList,
    removeBookFromList,
    updateBookInList,
    clearBooks,
} = addBooksSlice.actions;

export default addBooksSlice.reducer;