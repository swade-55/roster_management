// features/associatesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAssociates = createAsyncThunk('associates/fetchAssociates', async () => {
  const response = await fetch('/api/associates');
  return response.json();
});

export const associatesSlice = createSlice({
  name: 'associates',
  initialState: { entities: [], loading: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssociates.pending, (state) => {
        state.loading = 'loading';
      })
      .addCase(fetchAssociates.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.entities = action.payload;
      });
  },
});

export default associatesSlice.reducer;