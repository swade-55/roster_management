import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk action for adding a worker
export const addWorker = createAsyncThunk(
  'workers/addWorker',
  async (workerData, { rejectWithValue }) => {
    console.log('dispatching data',workerData)
    try {
      const response = await fetch('/add_associate', {
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

export const fetchWorkers = createAsyncThunk(
  'workers/fetchWorkers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5555/associate_metrics');
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
    updateWorker: (state, action) => {
      const index = state.findIndex(worker => worker.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload };
      }
    },
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
      })
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        return action.payload;
      });
  },
});

export const { setWorkers, deleteWorker, updateWorker } = workersSlice.actions;
export default workersSlice.reducer;