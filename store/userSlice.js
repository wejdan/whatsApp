import {createSlice} from '@reduxjs/toolkit';
const initialState = {
  storedUsers: {},
};

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setStoredUsers: (state, action) => {
      const {payload} = action;

      state.storedUsers = {...state.storedUsers, ...payload.newUsers};
      // state.didTryAutoLogin = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const {setStoredUsers} = userSlice.actions;

export default userSlice.reducer;
