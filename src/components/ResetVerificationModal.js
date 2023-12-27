import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ToastAndroid,
  StyleSheet,
  Dimensions,
} from 'react-native';
import StyleConfig from '../StyleConfig';
import { activateAccount, ResetPassword } from '../servercalls/auth';
import { AlertMessages } from '../utils/strings';
import GlobalStyles from '../GlobalStyles';
import PasswordField from './PasswordField';
import ErrorText from './ErrorText';
import LinearGradient from 'react-native-linear-gradient';
import { getGradientColors } from '../helpers/Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ResetVerificationModal = props => {
  const { email, showModal, onDismiss, setShowModal } = props;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const [passwordError, setpasswordError] = useState(false);
  const [confirmPasswordError, setconfirmPasswordError] = useState(false);
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

  // Verify code refs
  const firstInput = React.createRef();
  const secondInput = React.createRef();
  const thirdInput = React.createRef();
  const fourthInput = React.createRef();
  const fifthInput = React.createRef();
  const sixInput = React.createRef();


  const passRef = React.createRef();
  const confirmpassRef = React.createRef();

  function validations() {
    let response = false;
    try {
      if (
        password === '' ||
        confirmPassword === ''
      ) {

        if (password == '' || password == null || password.length < 8) {
          setpasswordError(true);
        }
        if (
          confirmPassword == '' ||
          confirmPassword == null ||
          confirmPassword.length < 8
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


  const setPasswordAction = async () => {
    try {
      let code = '';
      verifyCode.map(item => {
        code += item.value;
      });
      if (validations() && code.length == 6) {
        let params = {
          key: code,
          newPassword: password
        }
        let response = await ResetPassword(params);
        if (response.status == 200) {
          if (Platform.OS === 'ios') {
            alert(AlertMessages.PASSWORD_RESET_SUCCESS);
          } else {
            ToastAndroid.show(
              AlertMessages.PASSWORD_RESET_SUCCESS,
              ToastAndroid.LONG,
            );
          }
          setTimeout(() => {
            onDismiss();
          }, 100);
        } else {
          alert(AlertMessages.INVALID_ACTIVATION_NUMBER);
        }
      }
    } catch (err) {
      console.log('Error in handleActivation', err);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={showModal}>
      <View
        style={{
          ...styles.centeredView,
          paddingBottom: StyleConfig.dimensions.margin,
        }}>
        <View style={styles.modalView}>
          <View style={{ position: 'absolute', top: 7, right: 7 }}>
            <TouchableOpacity
              style={styles.btnClose}
              onPress={setShowModal}>
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
                paddingHorizontal: StyleConfig.dimensions.margin * 1.25,
                marginVertical: StyleConfig.dimensions.margin * 2,
              },
            ]}>
            <Text style={styles.modal_title}>Set Password</Text>
            <Text style={styles.modal_sub}>
              6 Digit has been sent to your given email address. Please verify.
            </Text>
            <View
              style={[
                GlobalStyles.flexDirectionRow,
                {
                  marginVertical: StyleConfig.dimensions.margin * 1.25,
                  zIndex: 2,
                },
              ]}>
              <TextInput
                ref={firstInput}
                style={{
                  ...styles.verifyInput,
                  marginLeft: StyleConfig.dimensions.margin * 0.25,
                  borderWidth: verifyCode[0].empty
                    ? StyleConfig.dimensions.borderWidth - 1
                    : StyleConfig.dimensions.borderWidth * 3,
                  borderColor: verifyCode[0].empty
                    ? StyleConfig.colors.borderColor
                    : StyleConfig.colors.green,
                }}
                keyboardType={'phone-pad'}
                maxLength={1}
                blurOnSubmit={false}
                onChangeText={text => {
                  const code = [...verifyCode];
                  const index = 0;
                  code[index].value = text ?? '';
                  if (text) {
                    code[index].empty = false;
                  } else {
                    code[index].empty = true;
                  }
                  setVerifyCode(code);
                  if (text != '') {
                    secondInput.current.focus();
                  }
                }}
              />
              <TextInput
                ref={secondInput}
                style={{
                  ...styles.verifyInput,
                  borderWidth: verifyCode[1].empty
                    ? StyleConfig.dimensions.borderWidth - 1
                    : StyleConfig.dimensions.borderWidth * 3,
                  borderColor: verifyCode[1].empty
                    ? StyleConfig.colors.borderColor
                    : StyleConfig.colors.green,
                }}
                keyboardType={'phone-pad'}
                maxLength={1}
                blurOnSubmit={false}
                onChangeText={text => {
                  const code = [...verifyCode];
                  const index = 1;
                  code[index].value = text ?? '';
                  if (text) {
                    code[index].empty = false;
                  } else {
                    code[index].empty = true;
                  }
                  setVerifyCode(code);
                  if (text === '' || text === null) {
                    firstInput.current.focus();
                    return;
                  }
                  if (text != '') {
                    thirdInput.current.focus();
                  }
                }}
              />
              <TextInput
                ref={thirdInput}
                style={{
                  ...styles.verifyInput,
                  borderWidth: verifyCode[2].empty
                    ? StyleConfig.dimensions.borderWidth - 1
                    : StyleConfig.dimensions.borderWidth * 3,
                  borderColor: verifyCode[2].empty
                    ? StyleConfig.colors.borderColor
                    : StyleConfig.colors.green,
                }}
                keyboardType={'phone-pad'}
                maxLength={1}
                blurOnSubmit={false}
                onChangeText={text => {
                  const code = [...verifyCode];
                  const index = 2;
                  code[index].value = text ?? '';
                  if (text) {
                    code[index].empty = false;
                  } else {
                    code[index].empty = true;
                  }
                  setVerifyCode(code);
                  if (text === '' || text === null) {
                    secondInput.current.focus();
                    return;
                  }
                  if (text != '') {
                    fourthInput.current.focus();
                  }
                }}
              />
              <TextInput
                ref={fourthInput}
                style={{
                  ...styles.verifyInput,
                  borderWidth: verifyCode[3].empty
                    ? StyleConfig.dimensions.borderWidth - 1
                    : StyleConfig.dimensions.borderWidth * 3,
                  borderColor: verifyCode[3].empty
                    ? StyleConfig.colors.borderColor
                    : StyleConfig.colors.green,
                }}
                keyboardType={'phone-pad'}
                maxLength={1}
                blurOnSubmit={false}
                onChangeText={text => {
                  const code = [...verifyCode];
                  const index = 3;
                  code[index].value = text ?? '';
                  if (text) {
                    code[index].empty = false;
                  } else {
                    code[index].empty = true;
                  }
                  setVerifyCode(code);
                  if (text === '' || text === null) {
                    thirdInput.current.focus();
                    return;
                  }
                  if (text != '') {
                    fifthInput.current.focus();
                  }
                }}
              />
              <TextInput
                ref={fifthInput}
                style={{
                  ...styles.verifyInput,
                  borderWidth: verifyCode[4].empty
                    ? StyleConfig.dimensions.borderWidth - 1
                    : StyleConfig.dimensions.borderWidth * 3,
                  borderColor: verifyCode[4].empty
                    ? StyleConfig.colors.borderColor
                    : StyleConfig.colors.green,
                }}
                keyboardType={'phone-pad'}
                maxLength={1}
                blurOnSubmit={false}
                onChangeText={text => {
                  const code = [...verifyCode];
                  const index = 4;
                  code[index].value = text ?? '';
                  if (text) {
                    code[index].empty = false;
                  } else {
                    code[index].empty = true;
                  }
                  setVerifyCode(code);
                  if (text === '' || text === null) {
                    fourthInput.current.focus();
                    return;
                  }
                  if (text != '') {
                    sixInput.current.focus();
                  }
                }}
              />
              <TextInput
                ref={sixInput}
                style={{
                  ...styles.verifyInput,
                  borderWidth: verifyCode[5].empty
                    ? StyleConfig.dimensions.borderWidth - 1
                    : StyleConfig.dimensions.borderWidth * 3,
                  borderColor: verifyCode[5].empty
                    ? StyleConfig.colors.borderColor
                    : StyleConfig.colors.green,
                }}
                keyboardType={'phone-pad'}
                maxLength={1}
                blurOnSubmit={false}
                onChangeText={text => {
                  const code = [...verifyCode];
                  const index = 5;
                  code[index].value = text ?? '';
                  if (text) {
                    code[index].empty = false;
                  } else {
                    code[index].empty = true;
                  }
                  setVerifyCode(code);
                  if (text === '' || text === null) {
                    fifthInput.current.focus();

                    return;
                  }
                  if (text) {
                    setTimeout(() => {
                      console.log(verifyCode, 'text recevices');

                    }, 100);
                  }
                }}
              />
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
            <View
              style={[
                GlobalStyles.alignItemsCenter,
                styles.resendCodeContainer,
              ]}>

            </View>
          </View>
          <TouchableOpacity
            onPress={() => setPasswordAction()}
            style={{
              marginBottom: 20,
              alignSelf: "center",
              height: StyleConfig.dimensions.height,
              width: StyleConfig.dimensions.height * 3.077,
              borderRadius: StyleConfig.dimensions.borderRadius * 10,
            }}>
            <LinearGradient
              colors={getGradientColors()}
              style={styles.linearGradient}>
              <Text style={styles.labelSignup}>Sumbit</Text>
              <View style={{ position: 'absolute', right: 10 }}>
                <Icon name={'chevron-right'} size={30} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    shadowColor: StyleConfig.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modal_title: {
    color: StyleConfig.colors.black,
    fontSize: StyleConfig.fontSize.heading,
    bottom: 15,
    fontWeight: '800'
  },
  group: {
    marginTop: StyleConfig.dimensions.margin,
    width: '100%',
  },
  groupInner: {
    alignItems: 'center',
    marginTop: StyleConfig.dimensions.margin,
  },
  label: {
    fontSize: StyleConfig.fontSize.medium,
    fontWeight: 'bold',
  },
  labelSignup: {
    fontSize: StyleConfig.fontSize.large,
    color: StyleConfig.colors.white,
  },
  checkbox: {
    borderRadius: StyleConfig.dimensions.borderRadius,
    marginLeft: StyleConfig.dimensions.margin * -0.3,
    paddingLeft: StyleConfig.dimensions.margin * -1,
    marginRight: StyleConfig.dimensions.margin * 0.75,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: StyleConfig.dimensions.borderRadius * 8,
    height: StyleConfig.dimensions.height,
  },
  verifyInput: {
    zIndex: 4,
    backgroundColor: '#ededed',
    fontSize: StyleConfig.fontSize.large,
    fontWeight: 'bold',
    color: StyleConfig.colors.green,
    height: StyleConfig.dimensions.height * 0.9235,
    width: Dimensions.get('window').width / 8.5,
    marginRight: StyleConfig.dimensions.margin * 0.25,
    borderRadius: StyleConfig.dimensions.borderRadius * 1.4,
    textAlign: 'center',
  },
});

export default ResetVerificationModal;
