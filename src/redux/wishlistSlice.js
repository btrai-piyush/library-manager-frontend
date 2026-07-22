import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  wishlist: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
    reducers: {
    setWishlist: (state, action) => {
      state.wishlist = action.payload;
    }
    },
});

export const { setWishlist } = wishlistSlice.actions;
export const selectWishlist = (state) => state.wishlist.wishlist;
export default wishlistSlice.reducer;