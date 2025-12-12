import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create loan request (borrower to lender)
export const createLoanRequest = createAsyncThunk(
  'loanRequest/create',
  async ({ loanApplicationId, lenderId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/loan-requests/borrower/request', {
        loanApplicationId,
        lenderId,
        message,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send request');
    }
  }
);

// Create loan offer request (lender to borrower)
export const createLoanOfferRequest = createAsyncThunk(
  'loanRequest/createOffer',
  async ({ loanApplicationId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/loan-requests/lender/offer', {
        loanApplicationId,
        message,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send offer');
    }
  }
);

// Accept loan request
export const acceptLoanRequest = createAsyncThunk(
  'loanRequest/accept',
  async (loanRequestId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/loan-requests/${loanRequestId}/accept`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept request');
    }
  }
);

// Reject loan request
export const rejectLoanRequest = createAsyncThunk(
  'loanRequest/reject',
  async (loanRequestId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/loan-requests/${loanRequestId}/reject`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject request');
    }
  }
);

// Get borrower loan requests
export const getBorrowerLoanRequests = createAsyncThunk(
  'loanRequest/getBorrowerRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/loan-requests/borrower/requests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

// Get lender loan requests
export const getLenderLoanRequests = createAsyncThunk(
  'loanRequest/getLenderRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/loan-requests/lender/requests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

const initialState = {
  borrowerRequests: [],
  lenderRequests: [],
  isLoading: false,
  error: null,
  submitSuccess: false,
};

const loanRequestSlice = createSlice({
  name: 'loanRequest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create loan request
      .addCase(createLoanRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLoanRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submitSuccess = true;
        state.error = null;
      })
      .addCase(createLoanRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create loan offer
      .addCase(createLoanOfferRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLoanOfferRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submitSuccess = true;
        state.error = null;
      })
      .addCase(createLoanOfferRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Accept request
      .addCase(acceptLoanRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptLoanRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update request in lists
        const requestId = action.payload.data.id;
        state.borrowerRequests = state.borrowerRequests.map(req =>
          req.id === requestId ? action.payload.data : req
        );
        state.lenderRequests = state.lenderRequests.map(req =>
          req.id === requestId ? action.payload.data : req
        );
      })
      .addCase(acceptLoanRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reject request
      .addCase(rejectLoanRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectLoanRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update request in lists
        const requestId = action.payload.data.id;
        state.borrowerRequests = state.borrowerRequests.map(req =>
          req.id === requestId ? action.payload.data : req
        );
        state.lenderRequests = state.lenderRequests.map(req =>
          req.id === requestId ? action.payload.data : req
        );
      })
      .addCase(rejectLoanRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get borrower requests
      .addCase(getBorrowerLoanRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBorrowerLoanRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.borrowerRequests = action.payload.data;
      })
      .addCase(getBorrowerLoanRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get lender requests
      .addCase(getLenderLoanRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLenderLoanRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lenderRequests = action.payload.data;
      })
      .addCase(getLenderLoanRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSubmitSuccess } = loanRequestSlice.actions;
export default loanRequestSlice.reducer;
