import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bomData: null,
  loading: false,
  error: null,
};

const bomSlice = createSlice({
  name: 'boms',
  initialState,
  reducers: {
    fetchBOMStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchBOMSuccess(state, action) {
      state.loading = false;
      state.bomData = action.payload;
    },
    fetchBOMFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchBOMStart, fetchBOMSuccess, fetchBOMFailure } = bomSlice.actions;

export default bomSlice.reducer;
