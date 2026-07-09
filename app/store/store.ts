import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 