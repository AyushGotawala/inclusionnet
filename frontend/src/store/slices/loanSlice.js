import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Submit loan application
export const submitLoanApplication = createAsyncThunk(
  'loan/submitLoanApplication',
  async (loanData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/loans/apply', loanData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Loan application submission failed');
    }
  }
);

// Get my loan applications
export const getMyLoanApplications = createAsyncThunk(
  'loan/getMyLoanApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/loans/my-applications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan applications');
    }
  }
);

// Get all loan applications (Admin)
export const getAllLoanApplications = createAsyncThunk(
  'loan/getAllLoanApplications',
  async (filters, { rejectWithValue }) => {
    try {
      const params = filters?.status ? { status: filters.status } : {};
      const response = await api.get('/api/loans/admin/all', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan applications');
    }
  }
);

// Get loan application by ID
export const getLoanApplicationById = createAsyncThunk(
  'loan/getLoanApplicationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/loans/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan application');
    }
  }
);

// Get loan eligibility
export const getLoanEligibility = createAsyncThunk(
  'loan/getLoanEligibility',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/loans/eligibility');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan eligibility');
    }
  }
);

// Get matching lenders for a loan application
export const getMatchingLenders = createAsyncThunk(
  'loan/getMatchingLenders',
  async ({ loanApplicationId, take, cursorId, maxInterestRate }, { rejectWithValue }) => {
    try {
      console.log('📤 API Call - getMatchingLenders:', { loanApplicationId, take, cursorId, maxInterestRate });
      const params = {};
      if (take) params.take = take;
      if (cursorId) params.cursorId = cursorId;
      if (maxInterestRate) params.maxInterestRate = maxInterestRate;
      const url = `/api/loans/${loanApplicationId}/matching-lenders`;
      console.log('📡 Request URL:', url, 'Params:', params);
      const response = await api.get(url, { params });
      console.log('📥 Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('❌ Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch matching lenders');
    }
  }
);

// Get matching loans for a lender
export const getMatchingLoans = createAsyncThunk(
  'loan/getMatchingLoans',
  async ({ take, cursorId, minCreditScore, maxTenureMonths, minTenureMonths }, { rejectWithValue }) => {
    try {
      const params = {};
      if (take) params.take = take;
      if (cursorId) params.cursorId = cursorId;
      if (minCreditScore) params.minCreditScore = minCreditScore;
      if (maxTenureMonths) params.maxTenureMonths = maxTenureMonths;
      if (minTenureMonths) params.minTenureMonths = minTenureMonths;
      const response = await api.get('/api/loans/matching-loans', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matching loans');
    }
  }
);

// Update loan application status (Admin)
export const updateLoanApplicationStatus = createAsyncThunk(
  'loan/updateLoanApplicationStatus',
  async ({ id, status, adminRemarks, creditScore }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/loans/admin/${id}/status`, {
        status,
        adminRemarks,
        creditScore,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update loan application');
    }
  }
);

const initialState = {
  applications: [],
  myApplications: [],
  currentApplication: null,
  eligibility: null,
  matchingLenders: [],
  matchingLoans: [],
  matchingLendersNextCursor: null,
  matchingLoansNextCursor: null,
  isLoading: false,
  isLoadingMatchingLenders: false,
  isLoadingMatchingLoans: false,
  error: null,
  submitSuccess: false,
};

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    setCurrentApplication: (state, action) => {
      state.currentApplication = action.payload;
    },
    clearMatchingLenders: (state) => {
      state.matchingLenders = [];
      state.matchingLendersNextCursor = null;
    },
    clearMatchingLoans: (state) => {
      state.matchingLoans = [];
      state.matchingLoansNextCursor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Loan Application
      .addCase(submitLoanApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitLoanApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submitSuccess = true;
        state.currentApplication = action.payload.data;
      })
      .addCase(submitLoanApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get My Loan Applications
      .addCase(getMyLoanApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyLoanApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myApplications = action.payload.data || [];
      })
      .addCase(getMyLoanApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get All Loan Applications
      .addCase(getAllLoanApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllLoanApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload.data || [];
      })
      .addCase(getAllLoanApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Loan Application By ID
      .addCase(getLoanApplicationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLoanApplicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentApplication = action.payload.data;
      })
      .addCase(getLoanApplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Loan Application Status
      .addCase(updateLoanApplicationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLoanApplicationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data;
        // Update in applications list
        state.applications = state.applications.map(app =>
          app.id === updated.id ? updated : app
        );
        // Update in myApplications list
        state.myApplications = state.myApplications.map(app =>
          app.id === updated.id ? updated : app
        );
        // Update current application if it's the same
        if (state.currentApplication?.id === updated.id) {
          state.currentApplication = updated;
        }
      })
      .addCase(updateLoanApplicationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Loan Eligibility
      .addCase(getLoanEligibility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLoanEligibility.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eligibility = action.payload.data;
      })
      .addCase(getLoanEligibility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Matching Lenders
      .addCase(getMatchingLenders.pending, (state) => {
        state.isLoadingMatchingLenders = true;
        state.error = null;
      })
      .addCase(getMatchingLenders.fulfilled, (state, action) => {
        state.isLoadingMatchingLenders = false;
        console.log('✅ Matching lenders fulfilled:', action.payload);
        const data = action.payload?.data || action.payload;
        const meta = action.meta.arg;
        if (meta?.cursorId) {
          // Append for pagination
          state.matchingLenders = [...state.matchingLenders, ...(data.items || [])];
        } else {
          // Replace for new search
          state.matchingLenders = data.items || [];
        }
        state.matchingLendersNextCursor = data.nextCursor || null;
      })
      .addCase(getMatchingLenders.rejected, (state, action) => {
        state.isLoadingMatchingLenders = false;
        state.error = action.payload;
        console.error('❌ Matching lenders rejected:', action.payload);
      })
      // Get Matching Loans
      .addCase(getMatchingLoans.pending, (state) => {
        state.isLoadingMatchingLoans = true;
        state.error = null;
      })
      .addCase(getMatchingLoans.fulfilled, (state, action) => {
        state.isLoadingMatchingLoans = false;
        const data = action.payload?.data || action.payload;
        const meta = action.meta.arg;
        if (meta?.cursorId) {
          // Append for pagination
          state.matchingLoans = [...state.matchingLoans, ...(data.items || [])];
        } else {
          // Replace for new search
          state.matchingLoans = data.items || [];
        }
        state.matchingLoansNextCursor = data.nextCursor || null;
      })
      .addCase(getMatchingLoans.rejected, (state, action) => {
        state.isLoadingMatchingLoans = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSubmitSuccess, setCurrentApplication, clearMatchingLenders, clearMatchingLoans } = loanSlice.actions;
export default loanSlice.reducer;

