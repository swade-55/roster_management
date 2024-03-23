// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// // Define the initial state with additional properties
// const initialState = {
//   workers: [],
//   totalCapacity: 0,
//   averageAttendance: 0,
//   averageCPH: 0,
//   averageUptime: 0,
//   headCount: 0,
//   status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
//   error: null
// };

// // // Async thunk to fetch metrics
// // export const fetchMetrics = createAsyncThunk('metrics/fetchMetrics', async () => {
// //   const response = await fetch('http://localhost:5555/associate_metrics');
// //   const data = await response.json();
// //   return data;
// // });

// // updateWorkerMetrics: (state, action) => {
// //   const { workerId, newMetrics } = action.payload;
// //   // Find the worker in the state and update their metrics
// //   const workerIndex = state.workers.findIndex(worker => worker.id === workerId);
// //   if(workerIndex !== -1) {
// //     state.workers[workerIndex].metrics = newMetrics;
// //     // Recalculate the global metrics
// //     const calculatedMetrics = calculateMetrics(state.workers);
// //     return { ...state, ...calculatedMetrics };
// //   }
// // },

// // Extract and calculate metrics from worker data
// const calculateMetrics = (workers) => {
//   let transformedWorkers = workers.map(worker => ({
//     attendance: worker.metrics.find(m => m.metric_name === 'Attendance')?.value || 0,
//     casesPerHour: worker.metrics.find(m => m.metric_name === 'Pallets Per Hour')?.value || 0,
//     uptime: worker.metrics.find(m => m.metric_name === 'Uptime')?.value || 0,
//   }));

  
//   let averageAttendance = transformedWorkers.reduce((sum, w) => sum + Number(w.attendance), 0) / (transformedWorkers.length || 1)
//   let averageCPH = transformedWorkers.reduce((sum, w) => sum + Number(w.casesPerHour), 0) / (transformedWorkers.length || 1)
//   let averageUptime = transformedWorkers.reduce((sum, w) => sum + Number(w.uptime), 0) / (transformedWorkers.length || 1)
//   let headCount = workers.length
//   let totalCapacity = headCount*averageAttendance*averageCPH * averageUptime



//   return {
//     totalCapacity,
//     averageAttendance,
//     averageCPH,
//     averageUptime,
//     headCount
//   };
// };

// const metricsSlice = createSlice({
//   name: 'metrics',
//   initialState,
//   reducers: {
//     // Reducer to manually set metrics
//     setMetrics: (state, action) => {
//       return { ...state, ...action.payload };
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchMetrics.pending, (state, action) => {
//         state.status = 'loading';
//       })

//       .addCase(fetchMetrics.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.workers = action.payload;
//         if (!Array.isArray(action.payload)) {
//           state.error = 'Data received is not an array';
//           return;
//         }
//         const newMetrics = calculateMetrics(action.payload);
//         state.totalCapacity = newMetrics.totalCapacity;
//         state.averageAttendance = newMetrics.averageAttendance;
//         state.averageCPH = newMetrics.averageCPH;
//         state.averageUptime = newMetrics.averageUptime;
//         state.headCount = newMetrics.headCount;
//       })
//       .addCase(fetchMetrics.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message;
//       });
//   }
// });


// export const { setMetrics } = metricsSlice.actions;

// export const updateMetrics = (workers) => (dispatch) => {
//   const metrics = calculateMetrics(workers);
//   dispatch(setMetrics(metrics));
// };


// export default metricsSlice.reducer;
