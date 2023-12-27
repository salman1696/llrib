import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
  ToastAndroid,
  Platform,
} from 'react-native';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import {green, primaryBGColor, textFieldBorder} from '../../utils/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Card from '../../components/Card';
import ContactField from '../../components/ContactField';
import PasswordField from '../../components/PasswordField';
import {
  activateAccount,
  forgotVerifyingOtp,
  register,
} from '../../servercalls/auth';
import {CheckBox} from 'native-base';
import ErrorText from '../../components/ErrorText';
import {
  isEmailValid,
  getGradientColors,
  isValidName,
  isValidPassword,
} from '../../helpers/Utils';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import {AlertMessages} from '../../utils/strings';
import GlobalStyles from '../../GlobalStyles';
import StyleConfig from '../../StyleConfig';
import VerificationModal from '../../components/VerificationModal';
import BannerNotification from '../../components/BannerNotification';

const Signup = props => {
  // Main Variables
  const [firstname, setfirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phone, setPhone] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState([
    {
      value: 0,
      empty: true,
    },
    {
      value: 0,
      empty: true,
    },
    {
      value: 0,
      empty: true,
    },
    {
      value: 0,
      empty: true,
    },
    {
      value: 0,
      empty: true,
    },
    {
      value: 0,
      empty: true,
    },
  ]);
  const [healthCardNumber, setHealthCardNumber] = useState('');

  // Helper variables
  const [loading, setLoading] = useState(false);

  // Error Variables
  const [firstnameError, setFirstNameError] = useState(false);
  const [lastnameError, setLastNameError] = useState(false);
  const [emailError, setemailError] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState(false);

  const [phoneError, setphoneError] = useState(false);
  const [passwordError, setpasswordError] = useState(false);
  const [confirmPasswordError, setconfirmPasswordError] = useState(false);
  const [healthCardError, setHealthCardError] = useState(false);

  // input refs
  const lastNameRef = React.createRef();
  const emailRef = React.createRef();
  const emailOTPRef = React.createRef();
  const contactRef = React.createRef();
  const healthCardRef = React.createRef();
  const passRef = React.createRef();
  const confirmpassRef = React.createRef();

  const redirectToSignIn = () => {
    setShowModal(false);
    props.navigation.replace('login');
  };

  const validattionOTP = () => {
    let response = false;
    if (emailOtp === '' || emailOtp === null || !isEmailValid(emailOtp)) {
      setEmailOtpError(true);
      response = true;
    }

    return response;
  };
  function validations() {
    let response = false;
    try {
      if (
        firstname === '' ||
        lastname === '' ||
        email === '' ||
        phone === '' ||
        phone.length !== 10 ||
        password === '' ||
        confirmPassword === '' ||
        healthCardNumber === null ||
        healthCardNumber.length !== 10 ||
        !isEmailValid(email)
      ) {
        if (firstname == '' || firstname == null || !isValidName(firstname)) {
          setFirstNameError(true);
        }
        if (lastname == '' || lastname == null || !isValidName(lastname)) {
          setLastNameError(true);
        }
        if (email == '' || email == null || !isEmailValid(email)) {
          setemailError(true);
        }
        if (phone == '' || phone == null || phone.length !== 10) {
          setphoneError(true);
        }
        if (
          healthCardNumber == '' ||
          healthCardNumber == null ||
          healthCardNumber.length !== 10
        ) {
          setHealthCardError(true);
        }
        if (password == '' || password == null || !isValidPassword(password)) {
          setpasswordError(true);
        }
        if (
          confirmPassword == '' ||
          confirmPassword == null ||
          !isValidPassword(confirmPassword)
        ) {
          setconfirmPasswordError(true);
        }
      } else {
        response = true;
      }
    } catch (error) {
      console.log('Error in signup validation', error);
      response = false;
    }

    return response;
  }

  const handleSignUp = async () => {
    try {
      setLoading(true);
      if (validations()) {
        if (!policyAgreed) {
          BannerNotification.show(
            '',
            AlertMessages.TERMS_AND_CONDITION,
            'error',
          );
          setLoading(false);
          return;
        }

        if (password != confirmPassword) {
          setLoading(false);
          // alert(AlertMessages.PASSWORD_NOT_MATCH);
          BannerNotification.show(
            '',
            AlertMessages.PASSWORD_NOT_MATCH,
            'error',
          );
        } else if (password.length < 8) {
          setLoading(false);
          // alert(AlertMessages.MIN_PASSWORD_LENGTH);
          BannerNotification.show(
            '',
            AlertMessages.MIN_PASSWORD_LENGTH,
            'error',
          );
        } else {
          /**
           * Need to uncommen this part when the api is working
           */
          let response = await register(
            email,
            firstname,
            lastname,
            phone,
            password,
            healthCardNumber,
          );
          setLoading(false);
          if (response.status === 201 || response.status === 200) {
            setShowModal(true);
          } else {
            alert(response.data.title);
          }
        }
      } else {
        setLoading(false);
        BannerNotification.show(
          '',
          AlertMessages.FILL_FIELD_VALIDATION,
          'error',
        );
      }
    } catch (error) {
      console.log('Error in signup validation', error);
    }
  };

  async function validateEmailOTP() {
    if (!validattionOTP()) {
      const params = {email: emailOtp};
      let response = await forgotVerifyingOtp(params);
      console.log('response after OTP request ', response);
      if (response.status == 200) {
        setShowEmailModal(false);
        setShowModal(true);
      } else {
        // alert(response?.data.detail);
        BannerNotification.show('', response?.data.detail, 'error');
      }
    }
  }

  return (
    <KeyboardAwareView style={GlobalStyles.flexOne} behavior={'padding'}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Header onSignIn={redirectToSignIn} />
        <Card paddingBottom={StyleConfig.dimensions.margin}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.cardHeaderText}>Create your account</Text>
          </View>
          <Text style={styles.description}>
            Please enter the information below to get started.
          </Text>
          <View style={styles.group}>
            <Text style={styles.label}>First name</Text>
            <InputField
              borderColor={
                firstnameError == true
                  ? StyleConfig.colors.error
                  : StyleConfig.colors.textFieldBorder
              }
              placeholder={'Enter first name'}
              onChangeText={text => {
                setfirstName(text);
                setFirstNameError(false);
              }}
              keyboardType={'email-address'}
              cap={'sentences'}
              returnKeyType={'next'}
              onSubmitEditing={() => {
                lastNameRef.current.focus();
              }}
              blurOnSubmit={false}
            />
            {firstnameError == true && (
              <ErrorText error={'Please enter a valid firstname'} />
            )}
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Last name</Text>
            <InputField
              ref={lastNameRef}
              borderColor={
                lastnameError == true
                  ? StyleConfig.colors.error
                  : StyleConfig.colors.textFieldBorder
              }
              placeholder={'Enter last name'}
              cap={'sentences'}
              onChangeText={text => {
                setLastName(text);
                setLastNameError(false);
              }}
              returnKeyType={'next'}
              onSubmitEditing={() => {
                emailRef.current.focus();
              }}
              blurOnSubmit={false}
            />
            {lastnameError && (
              <ErrorText error={'Please enter a valid lastname'} />
            )}
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Email address</Text>
            <InputField
              ref={emailRef}
              borderColor={
                emailError == true
                  ? StyleConfig.colors.error
                  : StyleConfig.colors.textFieldBorder
              }
              placeholder={'Enter email address'}
              keyboardType={'email-address'}
              onChangeText={text => {
                setEmail(text);
                setemailError(false);
              }}
              returnKeyType={'next'}
              onSubmitEditing={() => {
                contactRef.current.focus();
              }}
              blurOnSubmit={false}
            />
            {emailError && <ErrorText error={'Please enter a valid email'} />}
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Contact number</Text>
            <ContactField
              ref={contactRef}
              borderColor={
                phoneError == true
                  ? StyleConfig.colors.error
                  : StyleConfig.colors.textFieldBorder
              }
              selectedValue={phoneCode}
              placeholder={'(xxx) xxx-xxxx'}
              onValueChange={code => {
                setPhoneCode(code);
                setphoneError(false);
              }}
              onChangeText={text => {
                setPhone(text);
                setphoneError(false);
              }}
              value={phone}
              keyboardType={'number-pad'}
              returnKeyType={'done'}
              onSubmitEditing={() => {
                healthCardRef.current.focus();
              }}
              blurOnSubmit={false}
            />
            {phoneError && (
              <ErrorText error={'Please enter a valid phone number'} />
            )}
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Health Card Number</Text>
            <PasswordField
              ref={healthCardRef}
              borderColor={
                healthCardError == true
                  ? StyleConfig.colors.error
                  : StyleConfig.colors.textFieldBorder
              }
              placeholder={'Enter health card number'}
              keyboardType={'number-pad'}
              maxLength={10}
              onChangeText={text => {
                setHealthCardNumber(text);
                setHealthCardError(false);
              }}
              returnKeyType={'done'}
              onSubmitEditing={() => {
                passRef.current.focus();
              }}
              blurOnSubmit={false}
            />
            {healthCardError && (
              <ErrorText error={'Please enter a valid healthCard number'} />
            )}
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Password</Text>
            <PasswordField
              ref={passRef}
              borderColor={
                passwordError == true
                  ? StyleConfig.colors.error
                  : StyleConfig.colors.textFieldBorder
              }
              placeholder={'Enter password'}
              onChangeText={text => {
                setPassword(text);
                setpasswordError(false);
              }}
              returnKeyType={'done'}
              onSubmitEditing={() => {
                confirmpassRef.current.focus();
              }}
              blurOnSubmit={false}
            />
            {passwordError && (
              <ErrorText error={'Please enter a valid password'} />
            )}
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Retype password</Text>
            <PasswordField
              ref={confirmpassRef}
              borderColor={
                confirmPasswordError === true
                  ? StyleConfig.colors.error
                  : StyleConfig.colors.textFieldBorder
              }
              placeholder={'Re-type the password'}
              onChangeText={text => {
                setConfirmPassword(text);
                setconfirmPasswordError(false);
              }}
            />
            {confirmPasswordError && (
              <ErrorText error={'Please enter a valid password'} />
            )}
          </View>
          <View style={styles.minPasswordContainer}>
            <Text style={{fontSize: StyleConfig.fontSize.small}}>
              Password should be minimum of 8 characters and should contain
              letters and number only.
            </Text>
          </View>
          <View
            style={[
              GlobalStyles.flexDirectionRow,
              GlobalStyles.alignItemsCenter,
              styles.checkBoxContainer,
            ]}>
            <CheckBox
              color={green}
              checked={policyAgreed}
              onPress={() => {
                setPolicyAgreed(!policyAgreed);
              }}
              style={styles.checkbox}
            />
            <Text style={{fontSize: StyleConfig.fontSize.small}}>
              Yes, I understand and agree to LLRIB Terms & conditions, including
              the Privacy policy.
            </Text>
          </View>
          <View style={{marginTop: StyleConfig.dimensions.margin}}>
            {loading ? (
              <View style={styles.btnSignContainer}>
                <LinearGradient
                  colors={getGradientColors()}
                  style={styles.linearGradient}>
                  <ActivityIndicator
                    size={'large'}
                    color={StyleConfig.colors.white}
                  />
                </LinearGradient>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSignUp}
                style={styles.btnSignContainer}>
                <LinearGradient
                  colors={getGradientColors()}
                  style={styles.linearGradient}>
                  <Text style={styles.labelSignup}>Sign Up</Text>
                  <View style={{position: 'absolute', right: 10}}>
                    <Icon name={'chevron-right'} size={30} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </ScrollView>
      <VerificationModal
        showModal={showModal}
        onDismiss={redirectToSignIn}
        onClose={() => setShowModal(false)}
        email={email}
      />
      {showEmailModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showEmailModal}>
          <View
            style={{
              ...styles.centeredView,
              paddingBottom: StyleConfig.dimensions.margin,
            }}>
            <View style={styles.modalView}>
              <View style={{position: 'absolute', top: 7, right: 7}}>
                <TouchableOpacity
                  style={styles.btnClose}
                  onPress={() => {
                    setShowEmailModal(false);
                    setEmailOtpError(false);
                  }}>
                  <Icon
                    name={'close'}
                    color={StyleConfig.colors.red}
                    size={StyleConfig.dimensions.iconSize * 0.833}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  GlobalStyles.alignItemsCenter,
                  {
                    width: Dimensions.get('window').width - 40,
                    marginVertical: StyleConfig.dimensions.margin * 2,
                    paddingHorizontal: StyleConfig.dimensions.margin * 0.5,
                  },
                ]}>
                <Text style={styles.modal_title}>Forgot to verify email?</Text>
                <Text style={styles.modal_sub}>
                  Please provide the signup email to receive the verification
                  code again.
                </Text>
                <View
                  style={{
                    marginVertical: StyleConfig.dimensions.margin,
                    zIndex: 2,
                    width: '100%',
                  }}>
                  <View style={styles.groupInner}>
                    <Text style={styles.label}>Email address</Text>
                    <InputField
                      ref={emailOTPRef}
                      borderColor={
                        emailOtpError == true
                          ? StyleConfig.colors.error
                          : StyleConfig.colors.textFieldBorder
                      }
                      placeholder={'Enter your email address'}
                      keyboardType={'email-address'}
                      onChangeText={text => {
                        setEmailOtp(text);
                        setEmailOtpError(false);
                      }}
                      returnKeyType={'next'}
                      blurOnSubmit={false}
                    />
                    {emailOtpError && (
                      <ErrorText error={'Please enter a valid email'} />
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => validateEmailOTP()}
                  style={{
                    height: StyleConfig.dimensions.height,
                    width: StyleConfig.dimensions.height * 3.077,
                    borderRadius: StyleConfig.dimensions.borderRadius * 10,
                  }}>
                  <LinearGradient
                    colors={getGradientColors()}
                    style={styles.linearGradient}>
                    <Text style={styles.labelSignup}>Get OTP</Text>
                    <View style={{position: 'absolute', right: 10}}>
                      <Icon name={'chevron-right'} size={30} color="white" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StyleConfig.colors.primaryColor,
    paddingBottom: StyleConfig.dimensions.margin,
  },
  cardHeaderText: {
    fontSize: StyleConfig.fontSize.veryLarge,
    fontWeight: 'bold',
  },
  cardHeaderHelpText: {
    fontSize: StyleConfig.fontSize.base,
    fontWeight: '500',
  },
  description: {
    color: StyleConfig.colors.black,
    fontSize: StyleConfig.fontSize.medium,
    marginTop: StyleConfig.dimensions.margin * 0.2,
  },
  label: {
    fontSize: StyleConfig.fontSize.medium,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalView: {
    width: Dimensions.get('screen').width / 1.1,
    zIndex: 4,
    backgroundColor: '#fff',
    borderRadius: StyleConfig.dimensions.borderRadius * 2,
    alignItems: 'center',
    shadowColor: StyleConfig.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  group: {
    marginTop: StyleConfig.dimensions.margin,
  },
  groupInner: {
    alignItems: 'center',
    marginTop: StyleConfig.dimensions.margin,
  },
  checkbox: {
    borderRadius: StyleConfig.dimensions.borderRadius,
    marginLeft: StyleConfig.dimensions.margin * -0.3,
    paddingLeft: StyleConfig.dimensions.margin * -1,
    marginRight: StyleConfig.dimensions.margin * 0.75,
    paddingBottom: StyleConfig.dimensions.margin * -0.5,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: StyleConfig.dimensions.borderRadius * 8,
    height: StyleConfig.dimensions.height,
  },
  socialcard: {
    marginHorizontal: StyleConfig.dimensions.margin * 0.5,
    padding: StyleConfig.dimensions.margin * 0.6,
    backgroundColor: StyleConfig.colors.white,
    borderColor: StyleConfig.colors.borderColor,
    borderWidth: StyleConfig.dimensions.borderWidth,
    borderRadius: StyleConfig.dimensions.borderRadius * 3,
    shadowColor: StyleConfig.colors.shadow,
    shadowOffset: {width: 2, height: 10},
    shadowOpacity: 0.5,
    elevation: 20,
    shadowRadius: 3.84,
  },
  modal_title: {
    fontWeight: 'bold',
    fontSize: StyleConfig.fontSize.veryLarge,
  },
  modal_sub: {
    fontSize: StyleConfig.fontSize.small,
    textAlign: 'center',
    marginTop: StyleConfig.dimensions.margin * 0.4,
    lineHeight: 18,
  },
  minPasswordContainer: {
    marginBottom: StyleConfig.dimensions.margin,
    marginTop: StyleConfig.dimensions.margin * 0.5,
  },
  btnSignContainer: {
    height: StyleConfig.dimensions.height,
    borderRadius: StyleConfig.dimensions.borderRadius * 10,
  },
  checkBoxContainer: {
    marginTop: StyleConfig.dimensions.margin * 0.35,
    marginRight: StyleConfig.dimensions.margin * 1.5,
  },
  labelSignup: {
    fontSize: StyleConfig.fontSize.large,
    color: StyleConfig.colors.white,
  },
  resendCodeContainer: {
    marginTop: StyleConfig.dimensions.margin * 0.75,
  },
  labelDidntGetCode: {
    fontSize: StyleConfig.fontSize.medium,
    marginBottom: StyleConfig.dimensions.margin * 0.25,
  },
  labelResendCode: {
    color: StyleConfig.colors.green,
    fontSize: StyleConfig.fontSize.medium,
    fontWeight: 'bold',
  },
  btnClose: {
    padding: StyleConfig.dimensions.margin * 0.5,
  },
});

export default Signup;
