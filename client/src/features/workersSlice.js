import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


const initialState = {
  workers: [],
  status: 'idle',
  error: null,
};
// Async thunk action for adding a worker
export const addWorker = createAsyncThunk(
  'workers/addWorker',
  async (workerData, { rejectWithValue }) => {
    try {
      const response = await fetch('/add_associate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(workerData),
});

      if (!response.ok) throw new Error('Server error!');
      const responseData =  await response.json();
      return responseData;
    } catch (error) {
      console.error('Error in addWorker thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteWorker = createAsyncThunk('/workers/deleteWorker', async(workerId, {rejectWithValue}) =>{
  try {
    const response = await fetch(`/associate_metrics/${workerId}`,{
      method:'DELETE',
    });
    if (!response.ok){
      throw new Error('Network response was not ok');
    }
    return workerId;
  } catch(error){
    return rejectWithValue(error.message);
  }
})

export const fetchWorkers = createAsyncThunk('workers/fetchWorkers', async () => {
  const url = `/associates_details`; 
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    throw new Error('Could not fetch contacts');
  }

  const data = await response.json();
  return data;
});

export const updateAssociate = createAsyncThunk(
  'workers/updateAssociate',
  async (associateData, { rejectWithValue }) => {
    
    try {
      
      const response = await fetch(`/update_associate`, {
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
      console.log('Received updated associate data:', updatedAssociate);
      return updatedAssociate;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAssociateSchedule = createAsyncThunk(
  'workers/updateAssociateSchedule',
  async (associateData, { rejectWithValue }) => {
    
    try {
      const response = await fetch(`/update_associate_schedule`, {
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
      return updatedAssociate;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const workersSlice = createSlice({
  name: 'workers',
  initialState,
  status: 'idle',
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(addWorker.fulfilled, (state, action) => {
        state.status='succeeded';
        state.workers = [...state.workers, action.payload];
        
      })
      .addCase(addWorker.rejected, (state, action) => {
        // Handle the case where adding a worker fails
        
        console.error('Failed to add worker:', action.payload);
      })
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // return action.payload;
        state.workers = action.payload;
        
      })
      .addCase(deleteWorker.fulfilled, (state, action) => {
        state.workers = state.workers.filter(worker => worker.id !== action.payload);
      })      
      .addCase(updateAssociate.rejected, (state, action) => {
        console.error('Failed to update worker:', action.payload);
      })
      .addCase(updateAssociate.fulfilled, (state, action) => {
        
        const index = state.workers.findIndex(worker => worker.id === action.payload.associateId);
        if (index !== -1) {
          state.workers[index] = action.payload;
        } else {
          console.warn("Updated worker not found in the array");
        }
      })
      .addCase(updateAssociateSchedule.rejected, (state, action) => {
        console.error('Failed to update worker:', action.payload);
      })
      .addCase(updateAssociateSchedule.fulfilled, (state, action) => {
        console.log(state.workers)
        debugger
        const index = state.workers.findIndex(worker => worker.id === action.payload.associateId);

        if (index !== -1) {
          state.workers[index] = action.payload;
        } else {
          console.warn("Updated worker not found in the array");
        }
      });
  },
});

export default workersSlice.reducer;

