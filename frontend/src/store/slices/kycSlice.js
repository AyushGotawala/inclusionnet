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

// Async thunks for Borrower KYC
export const uploadBorrowerKYC = createAsyncThunk(
  'kyc/uploadBorrowerKYC',
  async (kycData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(kycData).forEach((key) => {
        if (key !== 'aadhar' && key !== 'pan') {
          formData.append(key, kycData[key]);
        }
      });
      
      // Append files
      if (kycData.aadhar) {
        formData.append('aadhar', kycData.aadhar);
      }
      if (kycData.pan) {
        formData.append('pan', kycData.pan);
      }

      const response = await api.post('/kyc/borrowers/kyc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'KYC upload failed');
    }
  }
);

export const uploadLenderKYC = createAsyncThunk(
  'kyc/uploadLenderKYC',
  async (kycData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(kycData).forEach((key) => {
        if (key !== 'aadhar' && key !== 'pan') {
          formData.append(key, kycData[key]);
        }
      });
      
      // Append files
      if (kycData.aadhar) {
        formData.append('aadhar', kycData.aadhar);
      }
      if (kycData.pan) {
        formData.append('pan', kycData.pan);
      }

      const response = await api.post('/kyc/lenders/kyc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'KYC upload failed');
    }
  }
);

// Get pending KYC lists (for admin)
export const getBorrowerKYCList = createAsyncThunk(
  'kyc/getBorrowerKYCList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/kyc/borrowers/pendingKYC');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC list');
    }
  }
);

export const getLenderKYCList = createAsyncThunk(
  'kyc/getLenderKYCList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/kyc/lenders/pendingKYC');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC list');
    }
  }
);

// Verify KYC (for admin)
export const verifyBorrowerKYC = createAsyncThunk(
  'kyc/verifyBorrowerKYC',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.post('/kyc/borrowers/verifyKYC', {
        userId,
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'KYC verification failed');
    }
  }
);

export const verifyLenderKYC = createAsyncThunk(
  'kyc/verifyLenderKYC',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.post('/kyc/lenders/verifyKYC', {
        userId,
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'KYC verification failed');
    }
  }
);

const initialState = {
  borrowerKycList: [],
  lenderKycList: [],
  currentKyc: null,
  isLoading: false,
  error: null,
  uploadSuccess: false,
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUploadSuccess: (state) => {
      state.uploadSuccess = false;
    },
    setCurrentKyc: (state, action) => {
      state.currentKyc = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Borrower KYC
      .addCase(uploadBorrowerKYC.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadBorrowerKYC.fulfilled, (state, action) => {
        state.isLoading = false;
        state.uploadSuccess = true;
        state.currentKyc = action.payload;
      })
      .addCase(uploadBorrowerKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload Lender KYC
      .addCase(uploadLenderKYC.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadLenderKYC.fulfilled, (state, action) => {
        state.isLoading = false;
        state.uploadSuccess = true;
        state.currentKyc = action.payload;
      })
      .addCase(uploadLenderKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Borrower KYC List
      .addCase(getBorrowerKYCList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBorrowerKYCList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.borrowerKycList = action.payload;
      })
      .addCase(getBorrowerKYCList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Lender KYC List
      .addCase(getLenderKYCList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLenderKYCList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lenderKycList = action.payload;
      })
      .addCase(getLenderKYCList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Borrower KYC
      .addCase(verifyBorrowerKYC.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyBorrowerKYC.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the KYC list after verification
        state.borrowerKycList = state.borrowerKycList.filter(
          kyc => kyc.userId !== action.meta.arg.userId
        );
      })
      .addCase(verifyBorrowerKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Lender KYC
      .addCase(verifyLenderKYC.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyLenderKYC.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the KYC list after verification
        state.lenderKycList = state.lenderKycList.filter(
          kyc => kyc.userId !== action.meta.arg.userId
        );
      })
      .addCase(verifyLenderKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearUploadSuccess, setCurrentKyc } = kycSlice.actions;
export default kycSlice.reducer;