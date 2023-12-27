import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistReducer} from 'redux-persist';

import {userSlice} from './slices/userSlice';
import {AsyncStorage} from 'react-native';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: [],
};

const reducers = combineReducers({
  userMeta: userSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
