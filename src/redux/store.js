import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import sidebarReducer from "./sidebarSlice";
import booksearchReducer from "./booksearchSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        sidebar: sidebarReducer,
        booksearch: booksearchReducer,
    },
});

export default store;