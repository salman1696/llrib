import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  profile: null,
  // assets: null,
  // education: null,
  // employment: null,
  bankAccount: null,
  // address: null,
  // spouse: null,
  // dependent: null,
  signatureBase64: null,
  reviewedSteps: null,
};

export const userSlice = createSlice({
  name: 'userMeta',
  initialState,
  reducers: {
    storeUserInfo: (state, action) => {
      console.log('Storing userInfo');
      state.user = action.payload;
    },
    updateUserInfo: (state, action) => {
      const user = {...state.user};
      user.hasRequiredDocuments = action.payload;
      state.user = user;
    },
    storeUserProfile: (state, action) => {
      console.log("======================UserData======================", action.payload)
      state.profile = action.payload;
    },
    storeBankInfo: (state, action) => {
      state.bankAccount = action.payload;
    },
    storeSignatureBase64: (state, action) => {
      state.signatureBase64 = action.payload;
    },
    storeReviewSteps: (state, action) => {
      state.reviewedSteps = action.payload;
    },
    updateReviewedStep: (state, action) => {
      const steps = {...state.reviewedSteps};
      console.log('payload', action.payload);
      steps[action.payload.step] = action.payload.status;
      console.log('steps', steps);
      state.reviewedSteps = steps;
    },
    clearUserMeta: () => {
      return initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  storeUserInfo,
  updateUserInfo,
  storeUserProfile,
  storeBankInfo,
  storeReviewSteps,
  updateReviewedStep,
} = userSlice.actions;

export default userSlice.reducer;
