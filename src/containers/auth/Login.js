import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import PasswordField from '../../components/PasswordField';
import {green, primaryBGColor, textFieldBorder} from '../../utils/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Card from '../../components/Card';
import {CheckBox} from 'native-base';
import {RNNotificationBanner} from 'react-native-notification-banner';

// import {
//   AccessToken,
//   GraphRequest,
//   GraphRequestManager,
//   LoginManager,
// } from 'react-native-fbsdk';
// import {
//   GoogleSigninButton,
//   GoogleSignin,
//   statusCodes,
// } from '@react-native-community/google-signin';
import {
  AlertMessages,
  getUser,
  setUser,
  WEB_CLIENT_ID,
} from '../../utils/strings';
import {login} from '../../servercalls/auth';
import ErrorToast from '../../components/ErrorToast';
import {AppContext} from '../../context/AppContext';
import {isEmailValid, getGradientColors} from '../../helpers/Utils';
import StyleConfig from '../../StyleConfig';
import GlobalStyles from '../../GlobalStyles';
import {storeUserInfo} from '../../slices/userSlice';
import {useDispatch} from 'react-redux';
import BannerNotification from '../../components/BannerNotification';

const Login = props => {
  // Context
  const [state, dispatch] = useContext(AppContext);
  const appDispatch = useDispatch();

  // Facebook Variable
  const [fbUserInfo, setFBUserInfo] = useState({});

  // Main variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error variables
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setpasswordError] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMesssage] = useState(null);

  const passInput = React.createRef();

  const emailRef = React.createRef();

  useMemo(() => {
    setUsernameError(false);
  }, [username]);
  useMemo(() => {
    setpasswordError(false);
  }, [password]);

  useEffect(async () => {
    const isLoginRemember = await AsyncStorage.getItem('login-remember');
    console.log(JSON.parse(isLoginRemember), '=================== login remem');
    if (isLoginRemember !== null) {
      setUsername(JSON.parse(isLoginRemember).username);
      setPassword(JSON.parse(isLoginRemember).password);
      setRememberMe(true);
    }
  }, []);

  function redirectToSignUp() {
    props.navigation.replace('signup');
  }

  function logoutWithFacebook() {
    LoginManager.logOut();
    setFBUserInfo({});
  }

  function getInfoFromToken(token) {
    const PROFILE_REQUEST_PARAMS = {
      fields: {
        string: 'id,email,name,first_name,last_name',
      },
    };
    const profileRequest = new GraphRequest(
      '/me',
      {token, parameters: PROFILE_REQUEST_PARAMS},
      (error, user) => {
        if (error) {
          console.log('login info has error: ' + error);
        } else {
          setFBUserInfo(user);
          console.log('result:', user);
        }
      },
    );
    new GraphRequestManager().addRequest(profileRequest).start();
  }

  function loginWithFacebook() {
    // Attempt a login using the Facebook login dialog asking for default permissions.
    LoginManager.logInWithPermissions(['public_profile']).then(
      login => {
        if (login.isCancelled) {
          console.log('Login cancelled');
        } else {
          AccessToken.getCurrentAccessToken().then(data => {
            const accessToken = data.accessToken.toString();
            getInfoFromToken(accessToken);
          });
        }
      },
      error => {
        console.log('Login fail with error: ' + error);
      },
    );
  }

  function validations() {
    let response = true;
    try {
      if (username === '' || username == null || !isEmailValid(username)) {
        setUsernameError(true);
        response = false;
      }

      if (password === '' || password === null || password.length < 8) {
        setpasswordError(true);
        response = false;
      }
    } catch (err) {
      console.log('Error in validations', err);
      response = false;
    }
    return response;
  }

  async function handleLogin() {
    let response = await login(username, password, rememberMe);
    console.log(
      '==============================Login response========================',
      response,
    );
    if (response.status === 200) {
      if (rememberMe) {
        AsyncStorage.setItem(
          'login-remember',
          JSON.stringify({username: username, password: password}),
        );
      }

      if (response.data.role === 'ROLE_ADMIN') {
        // Store the complete data object for future use.
        if (Object.keys(response?.data).length !== 0) {
          // store data in context api.
          dispatch({
            type: setUser,
            payload: response?.data,
          });

          appDispatch(storeUserInfo(response?.data));
        }

        AsyncStorage.setItem('admin', JSON.stringify(response?.data));
        props.navigation.replace('admin_dashboard');
        setLoading(false);
      } else {
        setLoading(false);
        // Store the complete data object for future use.
        AsyncStorage.setItem('user', JSON.stringify(response?.data));
        if (Object.keys(response?.data).length != 0) {
          // store data in context api.
          dispatch({
            type: setUser,
            payload: response?.data,
          });
        }

        AsyncStorage.setItem('user', JSON.stringify(response?.data));
        appDispatch(storeUserInfo(response?.data));

        if (
          response.data.completedStepNumber == null ||
          response.data?.completedStepNumber < 9
        ) {
          props.navigation.replace('user_profile_tabs', {
            completedSteps: response.data?.completedStepNumber ?? 0,
          });
        } else {
          props.navigation.replace('user_dashboard');
        }
      }
    } else {
      setLoading(false);
      setHasError(true);
      setErrorMesssage(response.data.detail);
    }
  }

  useEffect(async () => {
    if (rememberMe === false) {
      await AsyncStorage.removeItem('login-remember');
    }
  }, [rememberMe]);

  let isLogin = false;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
      <Header onCreateAccount={redirectToSignUp} />
      {hasError && (
        <View style={styles.errorContainer}>
          <ErrorToast
            error={errorMessage}
            onDismiss={() => {
              setHasError(false);
            }}
          />
        </View>
      )}
      <Card
        paddingBottom={StyleConfig.dimensions.margin}
        marginVertical={StyleConfig.dimensions.margin * 0.5}>
        <Text style={styles.cardHeaderText}>tānisi</Text>
        <Text style={styles.description}>Sign in to your account.</Text>
        <View style={styles.group}>
          <Text style={styles.label}>Email address</Text>
          <InputField
            ref={emailRef}
            borderColor={
              usernameError
                ? StyleConfig.colors.error
                : StyleConfig.colors.textFieldBorder
            }
            placeholder={'Enter your email address'}
            onChangeText={text => setUsername(text)}
            returnKeyType={'next'}
            onSubmitEditing={() => {
              passInput.current.focus();
            }}
            value={username.toLowerCase()}
            blurOnSubmit={false}
            onblur={() => setUsername(username.toLowerCase())}
          />
          {usernameError && (
            <Text style={styles.error}>Please provide a valid username</Text>
          )}
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>Password</Text>
          <PasswordField
            ref={passInput}
            value={password}
            borderColor={
              passwordError
                ? StyleConfig.colors.error
                : StyleConfig.colors.textFieldBorder
            }
            autoCapitalize="none"
            placeholder={'Enter your password'}
            onChangeText={text => setPassword(text)}
          />
          {passwordError && (
            <Text style={styles.error}>Please provide a valid password</Text>
          )}
        </View>
        <View style={[GlobalStyles.flexDirectionRow, styles.checkboxContainer]}>
          <CheckBox
            color={green}
            checked={rememberMe}
            onPress={() => {
              setRememberMe(!rememberMe);
            }}
            style={styles.checkbox}
          />
          <TouchableOpacity
            style={styles.paddingHorizontal5}
            onPress={() => setRememberMe(!rememberMe)}>
            <Text style={{fontSize: StyleConfig.fontSize.base}}>
              Remember me
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', marginTop: 17}}>
          <Text style={styles.marginRight5}>Having trouble signing in?</Text>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('reset_password');
            }}>
            <Text style={{color: green}}>Reset Password</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.marginTop20}>
          {loading ? (
            <View style={styles.btnSignContainer}>
              <LinearGradient
                colors={getGradientColors()}
                style={styles.linearGradient}>
                <ActivityIndicator
                  color={StyleConfig.colors.white}
                  size="large"
                />
              </LinearGradient>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setLoading(true);
                if (validations()) {
                  handleLogin();
                } else {
                  setLoading(false);
                  if (usernameError) {
                    setLoading(false);
                    BannerNotification.show(
                      '',
                      AlertMessages.VALID_EMAIL,
                      'error',
                    );
                  } else {
                    BannerNotification.show(
                      '',
                      AlertMessages.MIN_PASSWORD_LENGTH,
                      'error',
                    );
                  }
                }
              }}
              style={styles.btnSignContainer}>
              <LinearGradient
                colors={getGradientColors()}
                style={styles.linearGradient}>
                <Text style={styles.labelSignIn}>Sign In</Text>
                <View style={{position: 'absolute', right: 10}}>
                  <Icon name={'chevron-right'} size={30} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StyleConfig.colors.primaryColor,
    paddingBottom: StyleConfig.dimensions.margin,
  },
  card: {
    marginVertical: StyleConfig.dimensions.margin * 1.5,
    marginHorizontal: StyleConfig.dimensions.margin * 1.5,
    paddingHorizontal: StyleConfig.dimensions.margin * 1.25,
    paddingTop: StyleConfig.dimensions.margin,
    paddingBottom: StyleConfig.dimensions.margin * 2.5,
    backgroundColor: StyleConfig.colors.white,
    borderColor: StyleConfig.colors.borderColor,
    borderWidth: 1,
    borderRadius: 15,
    shadowColor: StyleConfig.colors.shadow,
    shadowOffset: {width: 2, height: 10},
    shadowOpacity: 0.5,
    elevation: 20,
    shadowRadius: 3.84,
  },
  cardHeaderText: {
    fontSize: StyleConfig.fontSize.veryLarge,
    fontWeight: 'bold',
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
  group: {
    marginTop: StyleConfig.dimensions.margin,
  },
  checkbox: {
    borderRadius: StyleConfig.dimensions.borderRadius,
    marginLeft: StyleConfig.dimensions.margin * -0.3,
    paddingLeft: StyleConfig.dimensions.margin * -1,
    marginRight: StyleConfig.dimensions.margin * 0.75,
    paddingBottom: StyleConfig.dimensions.margin * -2,
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
    borderWidth: 1,
    borderRadius: StyleConfig.dimensions.borderRadius * 3,
    shadowColor: StyleConfig.colors.shadow,
    shadowOffset: {width: 2, height: 10},
    shadowOpacity: 0.5,
    elevation: 20,
    shadowRadius: 3.84,
  },
  error: {
    color: StyleConfig.colors.error,
    fontSize: StyleConfig.fontSize.base,
  },
  errorContainer: {
    paddingHorizontal: StyleConfig.dimensions.margin * 1.5,
    marginTop: StyleConfig.dimensions.margin * 0.5,
  },
  labelSignIn: {
    fontSize: StyleConfig.fontSize.large,
    color: StyleConfig.colors.white,
  },
  btnSignContainer: {
    height: StyleConfig.dimensions.height,
    borderRadius: StyleConfig.dimensions.borderRadius * 10,
  },
  marginTop20: {
    marginTop: StyleConfig.dimensions.margin,
  },
  marginRight5: {
    marginRight: StyleConfig.dimensions.margin * 0.25,
  },
  paddingHorizontal5: {
    paddingHorizontal: StyleConfig.dimensions.margin * 0.25,
  },
  checkboxContainer: {
    alignItems: 'center',
    marginTop: StyleConfig.dimensions.margin,
  },
});

export default Login;
