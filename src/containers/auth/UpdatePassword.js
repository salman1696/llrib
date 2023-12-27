import {Container} from 'native-base';
import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Header from '../../components/Header';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InputField from '../../components/InputField';
import {useMemo} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import PasswordField from '../../components/PasswordField';
import StyleConfig from '../../StyleConfig';

const UpdatePassword = props => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState(false);

  // Refs
  const confirmPassRef = React.createRef();

  useMemo(() => {
    setEmailError(false);
  }, [email]);

  return (
    <>
      <Container>
        <Header />
        <View style={{paddingHorizontal: 25}}>
          <View>
            <TouchableOpacity
              style={{width: 50, marginLeft: -15, justifyContent: 'center'}}>
              <Icon name="chevron-left" size={40} color={'black'} />
            </TouchableOpacity>
            <Text style={{fontWeight: 'bold', fontSize: 24}}>
              Reset Password
            </Text>
          </View>
          <View style={{marginTop: 15}}>
            <Text>Please enter carefully.</Text>
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Password</Text>
            <PasswordField
              // borderColor={usernameError ? 'red' : textFieldBorder }
              placeholder={'Password'}
              onChangeText={text => setPassword(text)}
              returnKeyType={'next'}
              onSubmitEditing={() => {
                confirmPassRef.current.focus();
              }}
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>Confirm Password</Text>
            <PasswordField
              // borderColor={usernameError ? 'red' : textFieldBorder }
              ref={confirmPassRef}
              placeholder={'Confirm Password'}
              onChangeText={text => setConfirmPassword(text)}
            />
          </View>
        </View>
      </Container>
      <View
        style={{backgroundColor: StyleConfig.colors.primaryColor, padding: 15}}>
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
    backgroundColor: StyleConfig.colors.primaryColor,
    paddingHorizontal: StyleConfig.dimensions.margin,
    paddingTop: StyleConfig.dimensions.margin,
  },
  fileType: {
    flex: 0.4,
    fontSize: 12,
    color: 'lightgray',
    paddingBottom: 3,
  },
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

export default UpdatePassword;
