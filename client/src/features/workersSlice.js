// src/features/workersSlice.js
import { createSlice } from '@reduxjs/toolkit';

const workersSlice = createSlice({
  name: 'workers',
  initialState: [],
  reducers: {
    addWorker: (state, action) => {
      state.push(action.payload);
    },
    setWorkers: (state, action) => {
      return action.payload;
    },
    deleteWorker: (state, action) => {
        return state.filter((worker) => worker.id !== action.payload);
      },
  },
});

export const { addWorker, setWorkers,deleteWorker } = workersSlice.actions;
export default workersSlice.reducer;
