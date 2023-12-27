import {Container} from 'native-base';
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import Header from '../../components/Header';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InputField from '../../components/InputField';
import {green, primaryBGColor} from '../../utils/colors';
import {useMemo} from 'react';
import LinearGradient from 'react-native-linear-gradient';

const VerificationCode = props => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [verifyCode, setVerifyCode] = useState(null);

  const secondInput = useRef();
  const thirdInput = useRef();
  const fourthInput = useRef();

  useMemo(() => {
    setEmailError(false);
  }, [email]);

  return (
    <>
      <Container>
        <ScrollView>
          <Header />
          <View style={{paddingHorizontal: 25}}>
            <View>
              <TouchableOpacity
                style={{width: 50, marginLeft: -15, justifyContent: 'center'}}>
                <Icon name="chevron-left" size={40} color={'black'} />
              </TouchableOpacity>
              <Text style={{fontWeight: 'bold', fontSize: 24}}>
                Enter 4 - Digit recovery code
              </Text>
            </View>
            <View style={{marginTop: 15}}>
              <Text>
                The code has sent to your given email. Please enter the code.
              </Text>
            </View>
            <View style={{alignItems: 'center', paddingHorizontal: 15}}>
              <View style={{flexDirection: 'row', marginVertical: 35}}>
                <TextInput
                  style={{
                    ...styles.vierfyInput,
                    marginLeft: 12,
                    borderWidth:
                      verifyCode && String(verifyCode).length >= 1 ? 3 : 0,
                    borderColor:
                      String(verifyCode).length >= 1 ? green : 'lightgray',
                  }}
                  keyboardType={'phone-pad'}
                  maxLength={1}
                  blurOnSubmit={false}
                  onChangeText={text => {
                    setVerifyCode(text);
                    secondInput.current.focus();
                  }}
                />
                <TextInput
                  ref={secondInput}
                  style={{
                    ...styles.vierfyInput,
                    borderWidth:
                      verifyCode && String(verifyCode).length >= 2 ? 3 : 0,
                    borderColor:
                      String(verifyCode).length >= 2 ? green : 'lightgray',
                  }}
                  keyboardType={'phone-pad'}
                  maxLength={1}
                  blurOnSubmit={false}
                  onChangeText={text => {
                    var code = verifyCode + text;
                    setVerifyCode(code);
                    thirdInput.current.focus();
                  }}
                />
                <TextInput
                  ref={thirdInput}
                  style={{
                    ...styles.vierfyInput,
                    borderWidth:
                      verifyCode && String(verifyCode).length >= 3 ? 3 : 0,
                    borderColor:
                      String(verifyCode).length >= 3 ? green : 'lightgray',
                  }}
                  keyboardType={'phone-pad'}
                  maxLength={1}
                  blurOnSubmit={false}
                  onChangeText={text => {
                    var code = verifyCode + text;
                    setVerifyCode(code);
                    fourthInput.current.focus();
                  }}
                />
                <TextInput
                  ref={fourthInput}
                  style={{
                    ...styles.vierfyInput,
                    borderWidth:
                      verifyCode && String(verifyCode).length >= 4 ? 3 : 0,
                    borderColor:
                      String(verifyCode).length >= 4 ? green : 'lightgray',
                  }}
                  keyboardType={'phone-pad'}
                  maxLength={1}
                  blurOnSubmit={false}
                  onChangeText={text => {
                    var code = verifyCode + text;
                    setVerifyCode(code);
                    setTimeout(() => {
                      // alert("Submitting the code " + code);
                      handleActivation(code);
                    }, 100);
                  }}
                />
              </View>
              <View style={{marginTop: 15, alignItems: 'center'}}>
                <Text style={{fontSize: 16, marginBottom: 15}}>
                  Didn't get a code?
                </Text>
                <TouchableOpacity>
                  <Text
                    style={{color: green, fontSize: 16, fontWeight: 'bold'}}>
                    RESEND CODE
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Container>
      <View style={{backgroundColor: primaryBGColor, padding: 15}}>
        <TouchableOpacity style={{width: '100%', borderRadius: 50}}>
          <LinearGradient
            colors={['#0B7E51', '#006940']}
            style={styles.linearGradient}>
            <Text style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
              Next
            </Text>
            <View style={{position: 'absolute', right: 20}}>
              <Icon name={'chevron-right'} size={25} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  fileType: {flex: 0.4, fontSize: 12, color: 'lightgray', paddingBottom: 3},
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
  vierfyInput: {
    backgroundColor: '#ededed',
    fontSize: 20,
    fontWeight: 'bold',
    color: green,
    height: 80,
    width: 70,
    marginRight: 20,
    borderRadius: 7,
    textAlign: 'center',
  },
});

export default VerificationCode;
