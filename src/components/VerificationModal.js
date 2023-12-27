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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import StyleConfig from '../StyleConfig';
import { activateAccount } from '../servercalls/auth';
import { AlertMessages } from '../utils/strings';
import GlobalStyles from '../GlobalStyles';
import BannerNotification from './BannerNotification';

const VerificationModal = props => {
  const { email, showModal, onClose, onDismiss } = props;
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

  const handleActivation = async () => {
    try {
      let code = '';
      verifyCode.map(item => {
        code += item.value;
      });
      let response = await activateAccount(email, code);
      if (response.status == 200) {
        BannerNotification.show(
          '',
          AlertMessages.USER_REGISTERED_SUCCESS,
          'success',
        );
        setTimeout(() => {
          onDismiss();
        }, 100);
      } else {
        // alert(AlertMessages.INVALID_ACTIVATION_NUMBER);
        BannerNotification.show(
          '',
          AlertMessages.INVALID_ACTIVATION_NUMBER,
          'error',
        );
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
          <View style={{position: 'absolute', top: 7, right: 7}}>
            <TouchableOpacity
              style={{padding: 10}}
              onPress={onClose}>
              <Icon name={'close'} color={'red'} size={23} />
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
            <Text style={styles.modal_title}>Email verification</Text>
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
                      handleActivation();
                    }, 100);
                  }
                }}
              />
            </View>
            <View
              style={[
                GlobalStyles.alignItemsCenter,
                styles.resendCodeContainer,
              ]}>
              <Text style={styles.labelDidntGetCode}>Didn't get a code?</Text>
              <TouchableOpacity onPress={() => { }}>
                <Text style={styles.labelResendCode}>RESEND CODE</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  modal_title: {
    color: StyleConfig.colors.black,
    fontSize: StyleConfig.fontSize.heading,
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

export default VerificationModal;
