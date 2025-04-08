import { configureStore, current } from "@reduxjs/toolkit";
import currentUserReducer from "./Reducers/user.reducer";
const store = configureStore({
    reducer: {
        currentUser: currentUserReducer
    }
})
export default store;