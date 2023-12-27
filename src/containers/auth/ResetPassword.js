import { Container } from 'native-base';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Header from '../../components/Header';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InputField from '../../components/InputField';
import { primaryBGColor } from '../../utils/colors';
import { useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { forgotPassword, forgotVerifyingOtp } from '../../servercalls/auth';
import StyleConfig from '../../StyleConfig';
import { isEmailValid } from '../../helpers/Utils';
import VerificationModal from '../../components/VerificationModal';
import ResetVerificationModal from '../../components/ResetVerificationModal';

const ResetPassword = props => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);



  useMemo(() => {
    setEmailError(false);
  }, [email]);

  const redirectToSignIn = () => {
    setShowModal(false);
    props.navigation.replace('login');
  };


  const forgotPasswordAction = async () => {
    if (isEmailValid(email)) {
      setLoading(true);
      const params = { email: email };
      let response = await forgotPassword(params);
      console.log('response after OTP request ', response);
      if (response.status == 200) {
        setLoading(false);
        console.log(response);
        setShowModal(true)
      } else {
        setLoading(false);
        alert("Email address does't exist...");
      }
    } else {
      setEmailError(true)
    }
  }

  return (
    <>
      <Container>
        <Header />
        <View style={{ paddingHorizontal: 25 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.pop();
              }}
              style={{ width: 50, marginLeft: -15, justifyContent: 'center' }}>
              <Icon name="chevron-left" size={40} color={'black'} />
            </TouchableOpacity>
            <Text style={{ fontWeight: 'bold', fontSize: 24 }}>
              Reset Password
            </Text>
          </View>
          <View style={{ marginTop: 15 }}>
            <Text>Please enter your email to reset the password.</Text>
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Email</Text>
            <InputField
              borderColor={
                emailError
                  ? StyleConfig.colors.error
                  : StyleConfig.colors.textFieldBorder
              }
              // borderColor={usernameError ? 'red' : textFieldBorder }
              placeholder={'Enter email here'}
              onChangeText={text => (setEmail(text), setEmailError(false))}
            />
            {emailError && (
              <Text style={styles.error}>Please provide a valid email address</Text>
            )}
          </View>
        </View>
      </Container>
      <View style={{ backgroundColor: primaryBGColor, padding: 15 }}>
        <TouchableOpacity onPress={() => forgotPasswordAction()} style={{ width: '100%', borderRadius: 50 }}>
          <LinearGradient
            colors={['#0B7E51', '#006940']}
            style={styles.linearGradient}>
            {loading ? <ActivityIndicator
              color={StyleConfig.colors.white}
              size="large"
            />
              : <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>
                Next
              </Text>}
            <View style={{ position: 'absolute', right: 20 }}>
              <Icon name={'chevron-right'} size={25} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <ResetVerificationModal
        showModal={showModal}
        onDismiss={redirectToSignIn}
        email={email}
        setShowModal={() => setShowModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryBGColor,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  error: {
    color: StyleConfig.colors.error,
    fontSize: StyleConfig.fontSize.base,
  },
  fileType: { flex: 0.4, fontSize: 12, color: 'lightgray', paddingBottom: 3 },
  description: {
    fontSize: 12,
    marginTop: 3,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    flexDirection: 'row',
    height: 55,
  },
  group: {
    marginTop: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default ResetPassword;
