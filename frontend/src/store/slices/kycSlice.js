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

      const response = await api.post('/api/kyc/borrowers/kyc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.message || err.msg).join(', ');
        return rejectWithValue(errorMessages || 'Validation failed');
      }
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

      const response = await api.post('/api/kyc/lenders/kyc', formData, {
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

// Get individual KYC status for users
export const getBorrowerKYCStatus = createAsyncThunk(
  'kyc/getBorrowerKYCStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/kyc/borrowers/status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

export const getLenderKYCStatus = createAsyncThunk(
  'kyc/getLenderKYCStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/kyc/lenders/status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

// Get pending KYC lists (for admin)
export const getBorrowerKYCList = createAsyncThunk(
  'kyc/getBorrowerKYCList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/kyc/admin/borrowers/all');
      console.log('Borrower KYC Response:', response.data);
      
      // Handle different response formats
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Get Borrower KYC List Error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch KYC list';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getLenderKYCList = createAsyncThunk(
  'kyc/getLenderKYCList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/kyc/admin/lenders/all');
      console.log('Lender KYC Response:', response.data);
      
      // Handle different response formats
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Get Lender KYC List Error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch KYC list';
      return rejectWithValue(errorMessage);
    }
  }
);

// Verify KYC (for admin)
export const verifyBorrowerKYC = createAsyncThunk(
  'kyc/verifyBorrowerKYC',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/kyc/admin/borrowers/${userId}/status`, {
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
      const response = await api.put(`/api/kyc/admin/lenders/${userId}/status`, {
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
  userKycStatus: null, // Individual user's KYC status
  borrowerKycStatus: null,
  lenderKycStatus: null,
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
      // Get Borrower KYC Status
      .addCase(getBorrowerKYCStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBorrowerKYCStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.borrowerKycStatus = action.payload;
      })
      .addCase(getBorrowerKYCStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Lender KYC Status
      .addCase(getLenderKYCStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLenderKYCStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lenderKycStatus = action.payload;
      })
      .addCase(getLenderKYCStatus.rejected, (state, action) => {
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