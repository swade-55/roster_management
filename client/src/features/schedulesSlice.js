// schedulesSlice.js

import { createSlice } from '@reduxjs/toolkit';

export const schedulesSlice = createSlice({
  name: 'schedules',
  initialState: {
    associates: [],
  },
  reducers: {
    setAssociates: (state, action) => {
      state.associates = action.payload;
    },
  },
});

export const { setAssociates } = schedulesSlice.actions;

export default schedulesSlice.reducer;