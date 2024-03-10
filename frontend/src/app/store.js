import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import goalReducer from '../features/goals/goalSlice';
import inventoryReducer from '../features/inventory/inventorySplice';
import bomReducer from '../features/boms/bomSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goals: goalReducer,
    inventory: inventoryReducer,
    bom: bomReducer,
  },
});
