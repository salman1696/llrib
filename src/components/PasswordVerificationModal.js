import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, Dimensions, Modal, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {textFieldBorder} from '../utils/colors';
import PasswordField from './PasswordField';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GlobalStyles from '../GlobalStyles';


const PasswordVerificationModal = ({show, closeModal, loading, verificationError, onSubmit}) => {
  const [password, setPassword] = useState(null);
  const [error, setError] = useState("");

  const onChange = (text) => {
    !!error && setError("")
    setPassword(text)
  }

  const handleSubmitForm = () => {
    !!error && setError("")
    if (!password) {
     return setError("Please enter the password.")
    }
    // Checking password with regex for less then 8 character
    const paRe = /^[A-Za-z\d]{8,}$/;
    if (!paRe.test(password)) {
     return setError('Password should be a minimum of 8 characters and should not take special characters, spaces, and symbols.')
    }
    onSubmit(password)
  };

  useEffect(() => {
      setError(verificationError)
  }, [verificationError])

  return(<Modal
            animationType="slide"
            transparent={true}
            visible={show}>
            <View style={{...styles.centeredView}}>
              <View style={styles.modalView}>
                <View style={{position: 'absolute', top: 7, right: 7}}>
                  <TouchableOpacity
                    style={{padding: 10}}
                    onPress={closeModal}>
                    <Icon name={'close'} color={'red'} size={23} />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    width: Dimensions.get('window').width - 40,
                    marginVertical: 40,
                    paddingHorizontal: 25,
                  }}>
                  <Text style={styles.modal_title}>Password Verification</Text>
                  <View style={styles.modal_input}>
                    <PasswordField
                          editable={true}
                          borderColor={error ? 'red' : textFieldBorder}
                          hasError={error}
                          error={'Please enter password.'}
                          value={password}
                          minLength={8}
                          placeholder={'Enter password'} 
                          onChangeText={text => onChange(text)}
                          returnKeyType={'done'}
                          blurOnSubmit={false}
                        />
                  </View>
                  {(!!error) && <Text style={styles.errorMessage}>{error}</Text>}
                  <TouchableOpacity
                    onPress={handleSubmitForm}
                    style={{
                      height: 65,
                      width: 200,
                      borderRadius: 50,
                    }}>
                    <LinearGradient
                      colors={['#0B7E51', '#006940']}
                      style={[
                        GlobalStyles.flexDirectionRow,
                        GlobalStyles.linearGradient, 
                        styles.modal_submit
                      ]}>
                      {loading ? (
                        <ActivityIndicator size={'small'} color={'#fff'} />
                      ) : (
                        <Text style={{fontSize: 18, color: 'white'}}>Submit</Text>
                      )}
                      <View style={{position: 'absolute', right: 10}}>
                        <Icon name={'chevron-right'} size={30} color="white" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
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
    height: 'auto',
    zIndex: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modal_title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 10,
  },
  modal_input: {
    width: '100%',
    marginBottom: 10,
  },
  errorMessage: {
    width: '100%',
    color: '#FF0000',
    textAlign: 'left'
  },
  modal_submit: {
    marginTop: 10
  },
});

export default PasswordVerificationModal;

