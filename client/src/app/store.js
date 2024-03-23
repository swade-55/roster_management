// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import workersReducer from '../features/workersSlice';
import metricsReducer from '../features/metricsSlice'
import scheduleReducer from '../features/scheduleSlice';
import allocationReducer from '../features/allocationSlice';

const store = configureStore({
  reducer: {
    workers: workersReducer,
    metrics:metricsReducer,
    schedule: scheduleReducer,
    allocation: allocationReducer
  },
});

export default store;
