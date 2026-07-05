import {createSlice} from "@reduxjs/toolkit";

const AUTH_USER_STORAGE_KEY = "librarymanager.auth.user";

function writeStoredUser(user){
    if (typeof window === 'undefined') return;

    try{
        if (user) {
            window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        }
    } catch {
        // ignore storage write failures
    }
}

const initialState = {
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setSession: (state, action) => {
            state.user = action.payload.user;
            writeStoredUser(state.user);
        },
        clearSession: (state) => {
            state.user = null;
            writeStoredUser(null);
        },
    },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;