import {createSlice} from '@reduxjs/toolkit';
const initialState = {
  token: null,
  userData: null,
  didTryAutoLogin: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticate: (state, action) => {
      const {payload} = action;
      state.token = payload.token;
      state.userData = payload.userData;
      state.didTryAutoLogin = true;
      //  console.log('newState', state);
    },
    setDidTryAutoLogin: (state, action) => {
      state.didTryAutoLogin = true;
      //  console.log('newState', state);
    },
    logout: (state, action) => {
      state.token = null;
      state.userData = null;
      // state.didTryAutoLogin = false;
    },
    setData: (state, action) => {
      const {payload} = action;

      state.userData = {...state.userData, ...payload.userData};
      // state.didTryAutoLogin = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const {authenticate, setDidTryAutoLogin, logout, setData} =
  authSlice.actions;

export default authSlice.reducer;
