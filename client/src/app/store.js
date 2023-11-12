// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import workersReducer from '../features/workersSlice';
import metricsReducer from '../features/metricsSlice'
import searchReducer from '../features/searchSlice'
import associatesReducer from '../features/associatesSlice';
import schedulesReducer from '../features/schedulesSlice';

const store = configureStore({
  reducer: {
    workers: workersReducer,
    metrics:metricsReducer,
    search:searchReducer,
    associates: associatesReducer,
    schedules: schedulesReducer,
  },
});

export default store;
