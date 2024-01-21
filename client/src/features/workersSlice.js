import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk action for adding a worker
export const addWorker = createAsyncThunk(
  'workers/addWorker',
  async (workerData, { rejectWithValue }) => {
    console.log('dispatching data',workerData)
    try {
      const response = await fetch('http://localhost:5555/add_associate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(workerData),
});

      if (!response.ok) throw new Error('Server error!');
      const responseData =  await response.json();
      console.log('Add worker response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in addWorker thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWorkers = createAsyncThunk(
  'workers/fetchWorkers',
  async (_, { rejectWithValue }) => {
    console.log('Fetching workers');
    try {
      const response = await fetch('http://localhost:5555/associate_metrics');
      if (!response.ok) throw new Error('Server error!');
      return await response.json();
    } catch (error) {
      console.error('Error in updateAssociate thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateAssociate = createAsyncThunk(
  'workers/updateAssociate',
  async (associateData, { rejectWithValue }) => {
    console.log('Sending to backend:', associateData);
    try {
      const response = await fetch(`http://localhost:5555/update_associate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(associateData),
      });

      if (!response.ok) {
        throw new Error('Server error!');
      }

      const updatedAssociate = await response.json();
      console.log('Updated metrics from backend:', updatedAssociate.metrics);
      return updatedAssociate;
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
        state[index] = { ...state[index], ...action.payload.data };
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
      })
      .addCase(updateAssociate.fulfilled, (state, action) => {
        const index = state.findIndex(worker => worker.id === action.payload.associateId);
        if (index !== -1) {
          state[index] = { ...state[index], metrics: action.payload.metrics };
        }
      })
      
      
      .addCase(updateAssociate.rejected, (state, action) => {
        console.error('Failed to update worker:', action.payload);
      });
  },
});

export const { setWorkers, deleteWorker, updateWorker } = workersSlice.actions;
export default workersSlice.reducer;

