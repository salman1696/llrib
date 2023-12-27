import {
  SettingView,
  setUser,
  getMembers,
  getApplications,
  application,
  applicationsData,
  setAppId,
  updateStepCount,
  setSignatureBase64,
  setUserProfile,
  updateUserInfo,
} from '../../../utils/strings';

export const initialState = {
  settingCurrentView: 0,
  applications: null,
  application: null,
  applicationData: null,
  users: null,
  user: null,
  profile: null,
  assets: null,
  education: null,
  employment: null,
  bankAccount: null,
  address: null,
  spouse: null,
  dependent: null,
  applicationId: null,
  signatureBase64: null,
  selectedApplicationStepCount: 0,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case setUser:
      return {
        ...state,
        user: action.payload,
      };
    case updateUserInfo:
      const userMeta = {...state.user};
      if (userMeta) {
        userMeta.hasRequiredDocuments = action.payload;
      }
      return {
        ...state,
        user: userMeta,
      };
    case setUserProfile:
      console.log("====================UserProfileUpdate=================")
      return {
        ...state,
        profile: action.payload,
      };
    case SettingView:
      return {
        ...state,
        settingCurrentView: action.payload,
      };
    case getMembers:
      return {
        ...state,
        users: action.payload,
      };
    case getApplications:
      return {
        ...state,
        applications: action.payload,
      };
    case application:
      return {
        ...state,
        application: action.payload,
      };
    case applicationsData:
      return {
        ...state,
        applicationData: action.payload,
      };
    case setAppId:
      return {
        ...state,
        applicationId: action.payload.id,
        selectedApplicationStepCount: action.payload.completedStepNumber,
      };
    case updateStepCount:
      return {
        ...state,
        selectedApplicationStepCount: action.payload,
      };
    case setSignatureBase64:
      return {
        ...state,
        signatureBase64: action.payload,
      };
    default:
      return state;
  }
};
