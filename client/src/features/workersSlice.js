import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk action for adding a worker
export const addWorker = createAsyncThunk(
  'workers/addWorker',
  async (workerData, { rejectWithValue }) => {
    console.log('dispatching data',workerData)
    try {
      const response = await fetch('/associate_metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerData),
      });
      if (!response.ok) throw new Error('Server error!');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const workersSlice = createSlice({
  name: 'workers',
  initialState: [],
  reducers: {
    // Reducer to set workers
    setWorkers: (state, action) => action.payload,
    // Reducer to delete a worker
    deleteWorker: (state, action) => state.filter((worker) => worker.id !== action.payload),
  },
  extraReducers: (builder) => {
    builder
      .addCase(addWorker.fulfilled, (state, action) => {
        // Add the new worker to the state
        state.push(action.payload);
      })
      .addCase(addWorker.rejected, (state, action) => {
        // Handle the case where adding a worker fails
        console.error('Failed to add worker:', action.payload);
      });
  },
});

export const { setWorkers, deleteWorker } = workersSlice.actions;
export default workersSlice.reducer;
