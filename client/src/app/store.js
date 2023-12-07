// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import workersReducer from '../features/workersSlice';
import metricsReducer from '../features/metricsSlice'
import schedulesReducer from '../features/schedulesSlice';
import scheduleBuildReducer from '../features/scheduleBuildSlice';

const store = configureStore({
  reducer: {
    workers: workersReducer,
    metrics:metricsReducer,
    schedules: schedulesReducer,
    scheduleBuilder: scheduleBuildReducer,
  },
});

export default store;
