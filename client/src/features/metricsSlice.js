// metricsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const calculateMetrics = (workers) => {
  let totalAttendance = workers.reduce((sum, worker) => sum + worker.attendance, 0);
  let attendanceAverage = totalAttendance / workers.length || 0;

  let totalCPH = workers.reduce((sum, worker) => sum + worker.casesPerHour, 0);
  let cphAverage = totalCPH / workers.length || 0;

  let totalUptime = workers.reduce((sum, worker) => sum + worker.uptime, 0);
  let uptimeAverage = totalUptime / workers.length || 0;

  let casesArray = workers.map(worker => worker.casesPerHour * (worker.uptime / 100) * 8);
  let capacity = casesArray.reduce((sum, value) => sum + value, 0);

  return {
    totalCapacity: capacity,
    averageAttendance: attendanceAverage,
    averageCPH: cphAverage,
    averageUptime: uptimeAverage,
    headCount: workers.length,
  };
};

const metricsSlice = createSlice({
  name: 'metrics',
  initialState: {
    totalCapacity: 0,
    averageAttendance: 0,
    averageCPH: 0,
    averageUptime: 0,
    headCount: 0,
  },
  reducers: {
    setMetrics: (state, action) => {
      return action.payload;
    },
  },
});

export const { setMetrics } = metricsSlice.actions;

// New action creator for updating metrics based on workers data
export const updateMetrics = (workers) => (dispatch) => {
  const metrics = calculateMetrics(workers);
  dispatch(setMetrics(metrics));
};

export default metricsSlice.reducer;
