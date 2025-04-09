import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './feature/eventSlice'; // Import your slice reducer

const store = configureStore({
  reducer: {
    event: eventReducer, // Add your reducers here
  },
});

export default store;