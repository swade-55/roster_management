// metricsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the initial state with additional properties
const initialState = {
  workers: [],
  totalCapacity: 0,
  averageAttendance: 0,
  averageCPH: 0,
  averageUptime: 0,
  headCount: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Async thunk to fetch metrics
export const fetchMetrics = createAsyncThunk('metrics/fetchMetrics', async () => {
  const response = await axios.get('/selectors_metrics');
  return response.data;
});

// Extract and calculate metrics from worker data
const calculateMetrics = (workers) => {
  // The structure of the workers array needs to be taken into account.
  // It seems the workers array contains objects with a metrics property that is an array.
  // You would first need to transform this structure to match what calculateMetrics expects.
  let transformedWorkers = workers.map(worker => {
    let metrics = {
      attendance: 0,
      casesPerHour: 0,
      uptime: 0
    };

    worker.metrics.forEach(metric => {
      if (metric.metric_name === 'Attendance') metrics.attendance = metric.value;
      if (metric.metric_name === 'Pallets Per Hour') metrics.casesPerHour = metric.value;
      if (metric.metric_name === 'Uptime') metrics.uptime = metric.value;
    });

    return metrics;
  });

  return {
    totalCapacity: 0, // Implement logic to calculate totalCapacity if needed
    averageAttendance: transformedWorkers.reduce((sum, worker) => sum + worker.attendance, 0) / transformedWorkers.length,
    averageCPH: transformedWorkers.reduce((sum, worker) => sum + worker.casesPerHour, 0) / transformedWorkers.length,
    averageUptime: transformedWorkers.reduce((sum, worker) => sum + worker.uptime, 0) / transformedWorkers.length,
    headCount: workers.length
  };
};

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    setMetrics: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: {
    [fetchMetrics.pending]: (state, action) => {
      state.status = 'loading';
    },
    [fetchMetrics.fulfilled]: (state, action) => {
      state.status = 'succeeded';
      state.workers = action.payload;
      // Assuming your server response structure matches your state structure.
      // Otherwise, you would transform the response here before assigning.
      const newMetrics = calculateMetrics(action.payload);
      state.totalCapacity = newMetrics.totalCapacity;
      state.averageAttendance = newMetrics.averageAttendance;
      state.averageCPH = newMetrics.averageCPH;
      state.averageUptime = newMetrics.averageUptime;
      state.headCount = newMetrics.headCount;
    },
    [fetchMetrics.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = action.error.message;
    },
  },
});

export const { setMetrics } = metricsSlice.actions;

export const updateMetrics = (workers) => (dispatch) => {
  const metrics = calculateMetrics(workers);
  dispatch(setMetrics(metrics));
};

export default metricsSlice.reducer;
