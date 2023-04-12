import {createSlice} from '@reduxjs/toolkit';
const initialState = {
  chatsData: {},
  isLoading: true,
};

export const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChatsData: (state, action) => {
      const {payload} = action;

      state.chatsData = {...payload.chatsData};
      // state.didTryAutoLogin = false;
    },
    setChatdataLoading: (state, action) => {
      state.isLoading = action.payload.isLoading;
    },
  },
});

// Action creators are generated for each case reducer function
export const {setChatsData, setChatdataLoading} = chatSlice.actions;

export default chatSlice.reducer;
