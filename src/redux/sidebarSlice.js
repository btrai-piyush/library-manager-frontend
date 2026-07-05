import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: true,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openSidebar(state) {
      state.sidebarOpen = true;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
  },
});

export const { toggleSidebar, openSidebar, closeSidebar } = sidebarSlice.actions;
export const selectSidebarOpen = (state) => state.sidebar.sidebarOpen;

export default sidebarSlice.reducer;