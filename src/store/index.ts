import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import authReducer from "./slices/authSlice";
import servicesReducer from "./slices/servicesSlice";
import ordersReducer from "./slices/ordersSlice";
import walletReducer from "./slices/walletSlice";
import supportReducer from "./slices/supportSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    orders: ordersReducer,
    wallet: walletReducer,
    support: supportReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStore = typeof store;
export type ReduxState = RootState;
export type Dispatch = AppDispatch;
export default store;
