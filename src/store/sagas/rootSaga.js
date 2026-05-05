import { all, takeLatest, put, call } from 'redux-saga/effects';
import { authAPI, transactionAPI } from '../../services/api';
import { loginRequest, loginSuccess, loginFailure, registerRequest, registerSuccess, registerFailure, forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure, resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure } from '../slices/authSlice';
import { fetchRequest, fetchSuccess, fetchFailure, addRequest, addSuccess, addFailure, deleteRequest, deleteSuccess, deleteFailure } from '../slices/transactionSlice';
import { dashboardRequest, dashboardSuccess, dashboardFailure } from '../slices/dashboardSlice';

// Auth Sagas
function* loginSaga(action) {
  try {
    const res = yield call(authAPI.login, action.payload);
    yield put(loginSuccess(res.data));
  } catch (e) {
    yield put(loginFailure(e.response?.data?.message || 'Login failed'));
  }
}

function* registerSaga(action) {
  try {
    const res = yield call(authAPI.register, action.payload);
    yield put(registerSuccess(res.data.message));
  } catch (e) {
    yield put(registerFailure(e.response?.data?.message || 'Registration failed'));
  }
}

function* forgotPasswordSaga(action) {
  try {
    const res = yield call(authAPI.forgotPassword, action.payload);
    yield put(forgotPasswordSuccess(res.data.message));
  } catch (e) {
    yield put(forgotPasswordFailure(e.response?.data?.message || 'Failed to send reset email'));
  }
}

function* resetPasswordSaga(action) {
  try {
    const res = yield call(authAPI.resetPassword, action.payload.token, action.payload.password);
    yield put(resetPasswordSuccess(res.data.message));
  } catch (e) {
    yield put(resetPasswordFailure(e.response?.data?.message || 'Reset failed'));
  }
}

// Transaction Sagas
function* fetchTransactionsSaga(action) {
  try {
    const res = yield call(transactionAPI.getAll, action.payload);
    yield put(fetchSuccess(res.data));
  } catch (e) {
    yield put(fetchFailure(e.response?.data?.message || 'Failed to fetch transactions'));
  }
}

function* addTransactionSaga(action) {
  try {
    const res = yield call(transactionAPI.create, action.payload);
    yield put(addSuccess(res.data.data));
    // Refresh dashboard
    const dash = yield call(transactionAPI.getDashboard);
    yield put(dashboardSuccess(dash.data.data));
  } catch (e) {
    yield put(addFailure(e.response?.data?.message || 'Failed to add transaction'));
  }
}

function* deleteTransactionSaga(action) {
  try {
    yield call(transactionAPI.delete, action.payload);
    yield put(deleteSuccess(action.payload));
    const dash = yield call(transactionAPI.getDashboard);
    yield put(dashboardSuccess(dash.data.data));
  } catch (e) {
    yield put(deleteFailure(e.response?.data?.message || 'Delete failed'));
  }
}

function* fetchDashboardSaga() {
  try {
    const res = yield call(transactionAPI.getDashboard);
    yield put(dashboardSuccess(res.data.data));
  } catch (e) {
    yield put(dashboardFailure(e.response?.data?.message || 'Failed to load dashboard'));
  }
}

export default function* rootSaga() {
  yield all([
    takeLatest(loginRequest.type, loginSaga),
    takeLatest(registerRequest.type, registerSaga),
    takeLatest(forgotPasswordRequest.type, forgotPasswordSaga),
    takeLatest(resetPasswordRequest.type, resetPasswordSaga),
    takeLatest(fetchRequest.type, fetchTransactionsSaga),
    takeLatest(addRequest.type, addTransactionSaga),
    takeLatest(deleteRequest.type, deleteTransactionSaga),
    takeLatest(dashboardRequest.type, fetchDashboardSaga),
  ]);
}
