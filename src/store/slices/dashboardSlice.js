import { createSlice } from '@reduxjs/toolkit';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: null, loading: false, error: null },
  reducers: {
    dashboardRequest: (s) => { s.loading = true; s.error = null; },
    dashboardSuccess: (s, a) => { s.loading = false; s.stats = a.payload; },
    dashboardFailure: (s, a) => { s.loading = false; s.error = a.payload; },
  }
});

export const { dashboardRequest, dashboardSuccess, dashboardFailure } = dashboardSlice.actions;
export default dashboardSlice.reducer;
