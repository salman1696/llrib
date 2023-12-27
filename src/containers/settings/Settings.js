import React from 'react';
import {ScrollView, StyleSheet, Text, Switch, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Container} from 'native-base';
import {useState} from 'react';
import Header from '../../components/Header';
import PasswordField from '../../components/PasswordField';
import {useContext} from 'react';
import {AppContext} from '../../context/AppContext';
import {useMemo, useEffect} from 'react';
import {useIsFocused} from '@react-navigation/core';
import StyleConfig from '../../StyleConfig';
import GlobalStyles from '../../GlobalStyles';
import BannerNotification from '../../components/BannerNotification';
import {ChangePassword} from '../../servercalls/auth';
import {isValidPassword} from '../../helpers/Utils';

const Settings = props => {
  // Context
  const [state, dispatch] = useContext(AppContext);

  // focus
  const isFocus = useIsFocused();

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [inAppAlert, setInAppAlert] = useState(false);
  const [mobileAlerts, setMobileAlerts] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [retypePasswordError, setRetypePasswordError] = useState(false);

  const [enableChangePasswordView, setEnableChangePasswordView] =
    useState(false);

  // Refs
  const newPassRef = React.createRef();
  const retypePassRef = React.createRef();

  useMemo(() => {
    setEnableChangePasswordView(0);
  }, [isFocus]);

  function validations() {
    let response = true;
    try {
      if (currentPassword === '' || currentPassword == null) {
        setCurrentPasswordError(true);
        response = false;
      }
      if (password === '' || password === null || !isValidPassword(password)) {
        setPasswordError(true);
        response = false;
      }
      if (confirmPassword === '' || confirmPassword === null) {
        setRetypePasswordError(true);
        response = false;
      }
    } catch (err) {
      console.log('Error in validations', err);
      response = false;
    }
    return response;
  }

  const submit = async () => {
    if (validations()) {
      if (confirmPassword !== password) {
        BannerNotification.show('', 'Passwords do not match.', 'error');
        return;
      }

      const payload = {
        currentPassword: currentPassword,
        newPassword: password,
      };

      const response = await ChangePassword(
        state?.user?.id,
        payload,
        state?.user?.accessToken,
      );
      console.log('Change Password Response', response);
      if (response.status === 200) {
        BannerNotification.show('', 'Password updated successfully', 'success');
        setEnableChangePasswordView(false);
        clearAll();
      } else {
        BannerNotification.show('', response.data.detail, 'error');
      }
    }
  };

  const clearAll = () => {
    setCurrentPassword('');
    setConfirmPassword('');
    setPassword('');
  };

  return (
    <>
      <Container>
        <ScrollView>
          <Header />
          {enableChangePasswordView ? (
            <View
              style={{paddingHorizontal: StyleConfig.dimensions.margin * 1.25}}>
              <View
                style={[
                  GlobalStyles.flexDirectionRow,
                  GlobalStyles.alignItemsCenter,
                  {marginTop: StyleConfig.dimensions.margin * 0.5},
                ]}>
                <TouchableOpacity
                  onPress={() => {
                    setEnableChangePasswordView(false);
                    clearAll();
                  }}
                  style={GlobalStyles.justifyContentCenter}>
                  <Icon
                    name="arrow-left"
                    size={25}
                    color={StyleConfig.colors.green}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    GlobalStyles.flexOne,
                    {
                      marginLeft: StyleConfig.dimensions.margin * 0.25,
                      fontWeight: 'bold',
                      fontSize: StyleConfig.fontSize.heading * 1.2,
                    },
                  ]}>
                  Change Password
                </Text>
              </View>
              <View style={{marginTop: StyleConfig.dimensions.margin * 0.75}}>
                <Text>
                  Please enter your current password and new password.
                </Text>
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Current Password</Text>
                <PasswordField
                  borderColor={
                    currentPasswordError
                      ? StyleConfig.colors.error
                      : StyleConfig.colors.textFieldBorder
                  }
                  placeholder={'Password'}
                  onChangeText={text => {
                    setCurrentPassword(text);
                    setCurrentPasswordError(false);
                  }}
                  returnKeyType={'next'}
                  onSubmitEditing={() => {
                    newPassRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>New Password</Text>
                <PasswordField
                  borderColor={
                    passwordError
                      ? StyleConfig.colors.error
                      : StyleConfig.colors.textFieldBorder
                  }
                  ref={newPassRef}
                  placeholder={'Password'}
                  onChangeText={text => {
                    setPassword(text);
                    setPasswordError(false);
                  }}
                  returnKeyType={'next'}
                  onSubmitEditing={() => {
                    retypePassRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Retype Password</Text>
                <PasswordField
                  borderColor={
                    retypePasswordError
                      ? StyleConfig.colors.error
                      : StyleConfig.colors.textFieldBorder
                  }
                  ref={retypePassRef}
                  placeholder={'Confirm Password'}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    setRetypePasswordError(false);
                  }}
                />
              </View>
              <View style={{marginTop: StyleConfig.dimensions.margin * 0.5}}>
                <Text>
                  Password should be a minimum of 8 characters and should
                  contain letters and number only.
                </Text>
              </View>
              <View
                style={{
                  height: 1,
                  marginVertical: StyleConfig.dimensions.margin * 1.25,
                  width: '100%',
                  backgroundColor: 'lightgray',
                }}
              />
              <View>
                <TouchableOpacity
                  onPress={submit}
                  style={{width: '100%', borderRadius: 50}}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={styles.linearGradient}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                      Submit
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.container}>
              <View style={{marginBottom: StyleConfig.dimensions.margin}}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: StyleConfig.fontSize.veryLarge,
                  }}>
                  Preferences
                </Text>
              </View>
              <View style={styles.card}>
                <TouchableOpacity
                  onPress={() => {
                    setEnableChangePasswordView(true);
                  }}
                  style={[
                    GlobalStyles.flexDirectionRow,
                    GlobalStyles.alignItemsCenter,
                  ]}>
                  <Text
                    style={[
                      GlobalStyles.flexOne,
                      {fontSize: StyleConfig.fontSize.medium},
                    ]}>
                    Change Password
                  </Text>
                  <Icon name="chevron-right" size={40} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StyleConfig.colors.primaryColor,
    paddingHorizontal: StyleConfig.dimensions.margin,
    paddingTop: StyleConfig.dimensions.margin,
  },
  card: {
    backgroundColor: StyleConfig.colors.white,
    justifyContent: 'center',
    borderRadius: StyleConfig.dimensions.borderRadius,
    width: '100%',
    paddingVertical: StyleConfig.dimensions.margin,
    paddingHorizontal: StyleConfig.dimensions.margin,
    minHeight: 70,
    borderColor: '#ededed',
    borderWidth: StyleConfig.dimensions.borderWidth,
    marginBottom: StyleConfig.dimensions.margin * 0.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: StyleConfig.dimensions.borderRadius * 8,
    flexDirection: 'row',
    height: 65,
    width: '100%',
  },
  textArea: {
    borderColor: StyleConfig.colors.textFieldBorder,
    borderWidth: StyleConfig.dimensions.borderWidth,
    marginTop: StyleConfig.dimensions.margin * 0.35,
    paddingHorizontal: StyleConfig.dimensions.margin * 0.75,
    paddingVertical: StyleConfig.dimensions.margin * 0.6,
    borderRadius: StyleConfig.dimensions.borderRadius,
    height: 100,
    textAlignVertical: 'top',
  },
  cardHeading: {
    flex: 0.85,
    fontSize: StyleConfig.fontSize.medium,
    fontWeight: 'bold',
  },
  fileType: {
    flex: 0.2,
    fontSize: StyleConfig.fontSize.small,
    color: StyleConfig.colors.borderColor,
    paddingBottom: StyleConfig.dimensions.margin * 0.15,
  },
  description: {
    fontSize: StyleConfig.fontSize.small,
    marginTop: StyleConfig.dimensions.margin * 0.15,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: StyleConfig.dimensions.borderRadius * 8,
    flexDirection: 'row',
    height: 60,
  },
  group: {
    marginTop: StyleConfig.dimensions.margin * 1.25,
  },
  label: {
    fontSize: StyleConfig.fontSize.medium,
    fontWeight: 'bold',
    marginBottom: StyleConfig.dimensions.margin * 0.25,
  },
  dropdown: {
    borderColor: StyleConfig.colors.textFieldBorder,
    borderWidth: StyleConfig.dimensions.borderWidth,
    marginTop: StyleConfig.dimensions.margin * 0.35,
    paddingHorizontal: StyleConfig.dimensions.margin * 0.4,
    paddingVertical: StyleConfig.dimensions.margin * 0.05,
    borderRadius: StyleConfig.dimensions.borderRadius,
  },
});

export default Settings;
