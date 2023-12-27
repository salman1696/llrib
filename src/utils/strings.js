export const applicationsData = 'APPLICATION_DATA';
export const application = 'APPLICATION';
export const getApplications = 'GET_APPLICATIONS';
export const getMembers = 'GET_USERS';
export const setUser = 'SET_USER';
export const updateUserInfo = 'UPDATE_USER_INFO';
export const setUserProfile = 'SET_PROFILE';
export const setBankInfo = 'SET_BANK_INFO';
export const SettingView = 'SETTING_CURRENT_VIEW';
export const setAddress = 'SET_ADDRESS';
export const setEducation = 'SET_EDUCATION';
export const setEmployment = 'SET_EMPLOYMENT';
export const setBankAccount = 'SET_BANK_ACCOUNT';
export const setAssets = 'SET_ASSETS';
export const setSpouse = 'SET_SPOUSE';
export const setDependent = 'SET_DEPENDENT';
export const setAppId = 'SET_APPLICATION_ID';
export const updateStepCount = 'UPDATE_STEP_COUNT';
export const setSignatureBase64 = 'SET_SIGNATURE';

// Keys
export const WEB_CLIENT_ID =
  '335222411465-0252i3bek3e3psb27tbie8k1qeab3hh5.apps.googleusercontent.com';

// Alerts
export const AlertMessages = {
  FILL_FIELD_VALIDATION: 'Please fill all the fields',
  CONSENT_VALIDATION: 'Please give your conset to proceed.',
  SIGNATURE_VALIDATION: 'Please add signature to proceed.',
  PREEMPPLOYMENT_VALIDATION: 'Please select a type to proceed.',
  VALID_EMAIL: 'Please provide a valid email address.',
  VALID_INFORMATION: 'Please provide valid information.',
  MIN_PASSWORD_LENGTH: 'Password needs to be 8 characters.',
  TERMS_AND_CONDITION: 'Please accept our terms and conditions to proceed.',
  PASSWORD_NOT_MATCH: 'Passwords do not match.',
  USER_REGISTERED_SUCCESS: 'User successfully registered',
  PASSWORD_RESET_SUCCESS: 'Password Reset successfully ',
  INVALID_ACTIVATION_NUMBER: 'Invalid activation number, please try again.',
  FORM_SUBMISSION_FAILED: 'Unable to submit the form, please try again.',
  FORM_SUBMISSION_SUCCESS: 'Data has been successfully saved.',
  INVALDE_POSTCODE: 'Invalid postal code.',
  AMOUNT_LESS_THEN_ONE: 'Amount can not bee less than 1',
  FORM_UPDATED_SUCCESSFUL: 'Data has been successfully updated.',
  SAVE_CURRENT_INFO: 'Please save current information',
  ATLEAST_ONE_RECORD: 'Please add atleast one record.',
  MISSING_DOCUMENT_WARNING: 'Please upload required documents or you application will not be accepted.'
};

export const DocumentType = {
  APPLICATION_FORM: 'APPLICATION_FORM',
  ATTEND_SCHOOL: 'ATTEND_SCHOOL',
  BANK_STATEMENT: 'BANK_STATEMENT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  CCB_LETTER: 'CCB_LETTER',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  FIREARM_LICENSE: 'FIREARM_LICENSE',
  GST_ASSESSMENT: 'GST_ASSESSMENT',
  HAVE_DEPENDENT: 'HAVE_DEPENDENT',
  HEALTH_CARD: 'HEALTH_CARD',
  ID_CARD: 'ID_CARD',
  JOB_POSTING: 'JOB_POSTING',
  MEDICAL_CONDITION: 'MEDICAL_CONDITION',
  PAY_STUB: 'PAY_STUB',
  PROFILE_PICTURE: 'PROFILE_PICTURE',
  RESIDENCE_DECLARATION: 'RESIDENCE_DECLARATION',
  RESUME: 'RESUME',
  ROE: 'ROE',
  SIGNATURE: 'SIGNATURE',
  SIN_CARD: 'SIN_CARD',
  SIN_PAPER: 'SIN_PAPER',
  TAX_NOA: 'TAX_NOA',
  TREATY_CARD: 'TREATY_CARD',
  UTILITY_BILL: 'UTILITY_BILL',
  VOID_CHEQUE: 'VOID_CHEQUE',
};

export const DocumentCategory = {
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  EMPLOYMENT: 'EMPLOYMENT',
  GOVT_ID: 'GOVT_ID',
  HEALTH_CARD: 'HEALTH_CARD',
  JOB_TRAINING_SEARCH: 'JOB_TRAINING_SEARCH',
  ON_RESERVE_RESIDENCE: 'ON_RESERVE_RESIDENCE',
  RESUME: 'RESUME',
  SIGNATURE: 'SIGNATURE',
  SIN_VERIFICATION: 'SIN_VERIFICATION',
  TAX_NOA: 'TAX_NOA',
  UNEMPLOYABILITY: 'UNEMPLOYABILITY',
  PROFILE: 'PROFILE',
};


export const applicationData = [
  {
    step_id: 1,
    name: 'EI Cross Check Authorization',
    completed: false,
    nav: 'cross_check',
    next_nav: 'pre_employment',
    back_nav: 'pre_employment',
  },
  {
    step_id: 2,
    name: 'Pre-Employment Supports',
    completed: false,
    nav: 'pre_employment',
    next_nav: 'exempted_income',
    back_nav: 'cross_check',
  },
  {
    step_id: 3,
    name: 'Exempted Income',
    completed: false,
    nav: 'exempted_income',
    next_nav: 'other_support',
    back_nav: 'pre_employment',
  },
  {
    step_id: 4,
    name: 'Other Supports',
    completed: false,
    nav: 'other_support',
    next_nav: 'residency_declaration',
    back_nav: 'exempted_income',
  },
  {
    step_id: 5,
    name: 'On-Reserve Residence Declaration',
    completed: false,
    nav: 'residency_declaration',
    next_nav: 'employment_training',
    back_nav: 'other_support',
  },
  {
    step_id: 6,
    name: ' Employment and Training Search',
    completed: false,
    nav: 'employment_training',
    next_nav: 'employment_separation',
    back_nav: 'residency_declaration',
  },
  {
    step_id: 7,
    name: 'Unemployability',
    completed: false,
    nav: 'employment_separation',
    next_nav: 'client_consent',
    back_nav: 'employment_training',
  },
  {
    step_id: 8,
    name: 'Client Consent Form',
    completed: false,
    nav: 'client_consent',
    next_nav: 'pre_employment',
    back_nav: 'employment_separation',
  },
];
export const applicationUserData = [
  {
    step_id: 1,
    name: 'EI Cross Check Authorization',
    completed: false,
    nav: 'cross_check_form',
    next_nav: 'pre_employment_form',
    back_nav: 'pre_employment_form',
  },
  {
    step_id: 2,
    name: 'Pre-Employment Supports',
    completed: false,
    nav: 'pre_employment_form',
    next_nav: 'exempted_income_form',
    back_nav: 'cross_check_form',
  },
  {
    step_id: 3,
    name: 'Exempted Income',
    completed: false,
    nav: 'exempted_income_form',
    next_nav: 'other_support_form',
    back_nav: 'pre_employment_form',
  },
  {
    step_id: 4,
    name: 'Other Supports',
    completed: false,
    nav: 'other_support_form',
    next_nav: 'residency_declaration_form',
    back_nav: 'exempted_income_form',
  },
  {
    step_id: 5,
    name: 'On-Reserve Residence Declaration',
    completed: false,
    nav: 'residency_declaration_form',
    next_nav: 'employment_training_form',
    back_nav: 'other_support_form',
  },
  {
    step_id: 6,
    name: ' Employment and Training Search',
    completed: false,
    nav: 'employment_training_form',
    next_nav: 'employment_separation_form',
    back_nav: 'residency_declaration_form',
  },
  {
    step_id: 7,
    name: 'Unemployability',
    completed: false,
    nav: 'employment_separation_form',
    next_nav: 'client_consent_form',
    back_nav: 'employment_training_form',
  },
  {
    step_id: 8,
    name: 'Client Consent Form',
    completed: false,
    nav: 'client_consent_form',
    next_nav: '',
    back_nav: 'employment_separation_form',
  },
];

export const educationType = [
  {label: 'Technical Training', value: 'TECH_TRAINING'},
  {label: 'Diploma', value: 'DIPLOMA'},
  {label: 'Degree', value: 'DEGREE'},
  {label: 'Grade', value: 'GRADE'},
  {label: 'University', value: 'UNIVERSITY'},
];

export const assertType = [
  {label: 'Vehicle', value: 'VEHICLE'},
  {label: 'House/Farm', value: 'PROPERTY'},
  {label: 'Savings', value: 'SAVINGS'},
  {label: 'Insurance', value: 'INSURANCE'},
];

export const DocumentName = {
  profileImage: 'profile-image',
  signature: 'signature',
  employmentLetter: 'roe',
  resume: 'resume',
  paystub: 'last-pay-stub',
  ccb: 'ccb',
  bankStatement: 'bank-statement',
  treatyCard: 'treaty-card',
  idCard: 'id-card',
  drivingLicense: 'driving-license',
  firearmLicense: 'firearm-license',
  birthCertificate: 'birth-certificate',
  sinCard: 'sin-card',
  sinPaper: 'sin-paper',
  gstAssessment: 'gst-assessment',
  ccbLetter: 'ccb-letter',
  healthCard: 'health-card',
  taxNOA: 'tax-NOA',
  roe: 'ROE',
  residenceDeclaration: 'residence-declaration',
  utilityBill: 'utility-bill',
  /////////// application file names
  assessment: 'assessment',
  verification: 'verification',
  jobPosting: 'job-posting',
  appliactoinForm: 'application-form',
  attendSchool: 'attend-school',
  haveDependent: 'have-dependent',
  medicalCondition: 'medical-condition',
};

export const Routes = {
  AUTHENTICATE_STACK_NAV: 'AuthenticationStack',
  LOGIN: 'login',
  SIGNUP: 'signup',
  RESET_PASSWORD: 'reset_password',
  VERIFICATION: 'verification',
  UPDATE_PASSWORD: 'update_password',

  ADMIN_DASHBOARD: 'admin_dashboard',
  ADMIN_APPLICATION_STACK_NAV: 'ApplicationStack',
  ADMIN_RESIDENCY_DECLARATION: 'residency_declaration',
  ADMIN_EMPLOYEMENT_SEPARATION: 'employment_separation',
  ADMIN_CROSS_CHECK: 'cross_check',
  ADMIN_PRE_EMPLOYMENT: 'pre_employment',
  ADMIN_EMPLOYMENT_TRAINING: 'employment_training',
  ADMIN_OTHER_SUPPORT: 'other_support',
  ADMIN_EXEMPT_INCOME: 'exempted_income',
  ADMIN_CLIENT_CONSENT: 'client_consent',
  ADMIN_APPLICATION_STEPS: 'application_list',

  ADMIN_PROFILE: 'admin_profile',
  ADMIN_FEEDBACK: 'feedback',

  USER_PROFILE_TABS: 'user_profile_tabs',
  USER_APPLICATIONS: 'user_apps',
  USER_DASHBOARD: 'user_dashboard',
  USER_APPLICATION_STEPS: 'application_steps',
  USER_RESIDENCY_DECLARATION: 'residency_declaration_form',
  USER_EMPLOYEMENT_SEPARATION: 'employment_separation_form',
  USER_CROSS_CHECK: 'cross_check_form',
  USER_PRE_EMPLOYMENT: 'pre_employment_form',
  USER_EMPLOYMENT_TRAINING: 'employment_training_form',
  USER_OTHER_SUPPORT: 'other_support_form',
  USER_EXEMPT_INCOME: 'exempted_income_form',
  USER_CLIENT_CONSENT: 'client_consent_form',

  USER_APPLICATION_CARDS: 'application_cards',
  USER_PROFILE_CARDS: 'profile_cards',
  USER_PROFILE: 'user_profile',
  USER_PROFILE_TAB: 'profile_info',
  USER_ADDRESS_TAB: 'address_info',
  USER_DOCUMENT_TAB: 'upload_document_info',
  USER_EDUCATION_TAB: 'educational_info',
  USER_EMPLOYMENT_TAB: 'employment_info',
  USER_BANK_TAB: 'bank_account_info',
  USER_ASSET_TAB: 'asset_info',
  USER_FAMILT_TAB: 'family_info',
};
