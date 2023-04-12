import {createSlice} from '@reduxjs/toolkit';
const initialState = {
  messagesData: {},
  starredMessages: {},
};

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setChatMessages: (state, action) => {
      const {payload} = action;
      const chatId = payload.messagesData.chatId;
      const messages = payload.messagesData.messages;
      const loadOldMessages = payload.messagesData.loadOldMessages;
      if (loadOldMessages) {
        state.messagesData = {
          ...state.messagesData,
          [chatId]: {...messages, ...state.messagesData[chatId]},
        };
      } else {
        state.messagesData = {
          ...state.messagesData,
          [chatId]: {...state.messagesData[chatId], ...messages},
        };
      }

      // state.didTryAutoLogin = false;
    },
    setStarredMessages: (state, action) => {
      const {payload} = action;
      state.starredMessages = {
        ...state.starredMessages,
        ...payload.starredMessages,
      };
      // state.starredMessages = {
      //   ...state.starredMessages,
      //   ...payload.starredMessages,
      // };

      // state.didTryAutoLogin = false;
    },
    unstarMessage: (state, action) => {
      const {payload} = action;
      const oldData = {...state.starredMessages};
      delete oldData[payload.starId];
      state.starredMessages = {
        ...oldData,
      };
    },

    removeAllStarredMessages: (state, action) => {
      state.starredMessages = {};
      // state.didTryAutoLogin = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setChatMessages,
  setStarredMessages,
  unstarMessage,
  removeAllStarredMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
