import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import sidebarReducer from "./SidebarSlice";
import booksearchReducer from "./BookSearchSlice";
import addBooksReducer from "./AddBooksSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        sidebar: sidebarReducer,
        booksearch: booksearchReducer,
        addBooks: addBooksReducer,
    },
});

export default store;