// In scheduleSlice.js or a similar file

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the async thunk
export const fetchSchedule = createAsyncThunk(
  'schedule/fetchSchedule',
  async (dailyDemand, { rejectWithValue }) => {
    try {
      // Wrap dailyDemand in an object with the key 'required_heads'
      const payload = {
        required_heads: dailyDemand
      };

      const response = await fetch('/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)  // Pass the object to JSON.stringify
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Define the initial state
const initialState = {
  scheduleData: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Create slice
const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    // Optionally add reducers for other non-async actions
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedule.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.scheduleData = action.payload.Schedules;
        state.additionalResources = action.payload["Additional Resources"];
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default scheduleSlice.reducer;
