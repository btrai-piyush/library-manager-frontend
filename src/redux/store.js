import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import sidebarReducer from "./SidebarSlice";
import booksearchReducer from "./BookSearchSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        sidebar: sidebarReducer,
        booksearch: booksearchReducer,
    },
});

export default store;