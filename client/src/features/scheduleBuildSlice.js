// scheduleBuildSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define an async thunk for fetching the schedule from the Flask API
export const fetchSchedule = createAsyncThunk(
  'schedule/fetchSchedule',
  async (userInput, thunkAPI) => {
    try {
      console.log('Making API call to generate schedule with user input:', userInput);
      const response = await axios.post('http://localhost:5555/generate_schedule', userInput);
      console.log('Received schedule data from API:', response.data);
      return response.data; // This should be the schedule data returned from your Flask API
    } catch (error) {
      console.error('API call to generate schedule failed:', error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Create the schedule slice
const scheduleBuildSlice = createSlice({
  name: 'schedule',
  initialState: {
    data: null, // This will store the schedule data
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null // This will store the error message, if any
  },
  reducers: {
    // You can also define reducers for other actions related to the schedule
  },
  extraReducers: {
    [fetchSchedule.pending]: (state, action) => {
      state.status = 'loading';
    },
    [fetchSchedule.fulfilled]: (state, action) => {
      state.status = 'succeeded';
      state.data = action.payload; // Set the schedule data on successful API response
    },
    [fetchSchedule.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = action.error.message; // Set the error message on API failure
    }
  }
});

// Export the reducer
export default scheduleBuildSlice.reducer;