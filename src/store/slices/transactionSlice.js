// transactionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: { list: [], total: 0, loading: false, error: null, submitting: false },
  reducers: {
    fetchRequest: (s) => { s.loading = true; s.error = null; },
    fetchSuccess: (s, a) => { s.loading = false; s.list = a.payload.data; s.total = a.payload.total; },
    fetchFailure: (s, a) => { s.loading = false; s.error = a.payload; },
    addRequest: (s) => { s.submitting = true; s.error = null; },
    addSuccess: (s, a) => { s.submitting = false; s.list = [a.payload, ...s.list]; },
    addFailure: (s, a) => { s.submitting = false; s.error = a.payload; },
    deleteRequest: (s) => { s.submitting = true; },
    deleteSuccess: (s, a) => { s.submitting = false; s.list = s.list.filter(t => t._id !== a.payload); },
    deleteFailure: (s, a) => { s.submitting = false; s.error = a.payload; },
    updateSuccess: (s, a) => { s.list = s.list.map(t => t._id === a.payload._id ? a.payload : t); },
    clearError: (s) => { s.error = null; },
  }
});

export const { fetchRequest, fetchSuccess, fetchFailure, addRequest, addSuccess, addFailure, deleteRequest, deleteSuccess, deleteFailure, updateSuccess, clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
