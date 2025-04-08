import { createSlice } from '@reduxjs/toolkit';

// Initial state with both user and organizer objects
const initialState = {
  user: null,          // For normal users
  organiser: null,     // For organizers
  accessToken: null,
  refreshToken: null,
  role: null,          // Can be 'user' or 'organizer'
  isLoggedIn: false,
};

const currentUserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logIn: (state, action) => {
      console.log("Logging in with payload:", action.payload);
      const { user,organiser, accessToken, refreshToken } = action.payload;
      console.log(organiser)
      // Set data based on role
      if (user) {
        state.user = user;
        state.role = "user"
      } else if (organiser) {
        state.organiser = organiser;
        state.role = 'organiser'
      }

      // Update other state fields
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isLoggedIn = true;
      console.log(state)
    },
    logOut: (state) => {
      state.user = null;
      state.organiser = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.isLoggedIn = false;
    },
  },
});

// Export the actions
export const { logIn, logOut } = currentUserSlice.actions;

// Export the reducer
export default currentUserSlice.reducer;
