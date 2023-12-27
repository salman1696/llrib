let config = {};

// config.root = 'http://crm-api.ap-south-1.elasticbeanstalk.com/api';
config.root = 'http://crm-api.ap-south-1.elasticbeanstalk.com/api';

// config.root =
//   'http://crms-public-szhb9s7sws1x-1853501634.ca-central-1.elb.amazonaws.com/api';

config.api = {};
// Authentication and Authorization
config.api.login = `${config.root}/authenticate`;
config.api.register = `${config.root}/register`;
config.api.changepassword = `${config.root}/account`;
config.api.forgotpassword = `${config.root}/account/reset-password/init`;
config.api.resetpassword = `${config.root}/account/reset-password/finish`;
config.api.accountActivation = `${config.root}/activate`; // POST
config.api.accountActivationKey = `${config.root}/account-activation-key`; // POST
// Admin
config.api.admin = `${config.root}/admin`;
// User Profile
/**
 * Update: POST , body: payload, authorization token,
 * GetProfileCurrentUser: POST, body: null, authorization token,
 */
config.api.userProfile = `${config.root}/user-profiles`;
config.api.userProfileAdmin = `${config.api.admin}/user-profile`;

/**
 * @param id, String
 * user-profile/2/address
 * user-profile/2/educations
 * user-profile/2/employments
 * user-profile/2/bank-accounts
 * user-profile/2/assets
 * ...so on
 */
config.api.getUserProfile = `${config.root}/user-profiles/`; // Params, id, user-profiles/2/addresses // GET

// User Address
/**
 * For update, use /addresses/1101 where 1101 is the id
 */
config.api.addresses = `${config.root}/addresses`; // POST
// config.api.updateAddress = `${config.root}/addresses/` // Params: id, address/1101 // POST

// Education
config.api.educations = `${config.root}/educations`; // POST
// config.api.updateEducation = `${config.root}/educations/` // Param: id, educations/1301 // POST

// Employments
config.api.employments = `${config.root}/employments`;

// Bank-accounts
config.api.bankAccounts = `${config.root}/bank-accounts`;

// Assets
config.api.assets = `${config.root}/assets`;

// Spouse
// config.api.spouses = `${config.root}/spouses`
config.api.spouses = `${config.root}`;

// dependent
config.api.dependents = `${config.root}/dependents`;

// Uplaod documents
config.api.uploadFile = `${config.root}/documents`;

// user application creations
config.api.applications = `${config.root}/applications`;

config.api.documents = `${config.root}/documents`;

config.api.preEmployment = `${config.root}/pre-employment-supports`;

config.api.employmentTraining = `${config.root}/job-training-search-logs`;

config.api.presignedUrl =
  'https://8soqnkbhw0.execute-api.us-east-2.amazonaws.com/production/presigned-url';

config.api.userProfileGetDocument =
  'https://8soqnkbhw0.execute-api.us-east-2.amazonaws.com/production/get-presigned-url';

config.api.getPresignedUrl =
  'https://8soqnkbhw0.execute-api.us-east-2.amazonaws.com/production/get-presigned-url';

config.api.docs_url =
  'https://biz9v6jn91.execute-api.us-east-2.amazonaws.com/stage';
config.api.getReviewStepsUrl = `${config.root}/user-profile-reviews`;
export default config;
