import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { user, token, loading: false, error: null, message: null },
  reducers: {
    loginRequest: (s) => { s.loading = true; s.error = null; },
    loginSuccess: (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; localStorage.setItem('token', a.payload.token); localStorage.setItem('user', JSON.stringify(a.payload.user)); },
    loginFailure: (s, a) => { s.loading = false; s.error = a.payload; },
    registerRequest: (s) => { s.loading = true; s.error = null; s.message = null; },
    registerSuccess: (s, a) => { s.loading = false; s.message = a.payload; },
    registerFailure: (s, a) => { s.loading = false; s.error = a.payload; },
    logout: (s) => { s.user = null; s.token = null; localStorage.removeItem('token'); localStorage.removeItem('user'); },
    forgotPasswordRequest: (s) => { s.loading = true; s.error = null; s.message = null; },
    forgotPasswordSuccess: (s, a) => { s.loading = false; s.message = a.payload; },
    forgotPasswordFailure: (s, a) => { s.loading = false; s.error = a.payload; },
    resetPasswordRequest: (s) => { s.loading = true; s.error = null; },
    resetPasswordSuccess: (s, a) => { s.loading = false; s.message = a.payload; },
    resetPasswordFailure: (s, a) => { s.loading = false; s.error = a.payload; },
    updateUserProfile: (s, a) => { s.user = { ...s.user, ...a.payload }; localStorage.setItem('user', JSON.stringify({ ...s.user, ...a.payload })); },
    clearMessages: (s) => { s.error = null; s.message = null; },
  }
});

export const { loginRequest, loginSuccess, loginFailure, registerRequest, registerSuccess, registerFailure, logout, forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure, resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure, updateUserProfile, clearMessages } = authSlice.actions;
export default authSlice.reducer;
