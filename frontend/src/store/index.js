import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import kycReducer from './slices/kycSlice';
import loanReducer from './slices/loanSlice';
import loanRequestReducer from './slices/loanRequestSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kyc: kycReducer,
    loan: loanReducer,
    loanRequest: loanRequestReducer,
    chat: chatReducer,
  },
});

export default store;