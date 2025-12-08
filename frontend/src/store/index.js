import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import kycReducer from './slices/kycSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kyc: kycReducer,
  },
});

export default store;