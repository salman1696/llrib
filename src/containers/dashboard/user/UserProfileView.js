import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import InputField from '../../../components/InputField';
import {useState} from 'react';
import ContactField from '../../../components/ContactField';
import {Container, Picker} from 'native-base';
import CheckBox from '@react-native-community/checkbox';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from '../../../components/CustomDatePicker';
import PasswordField from '../../../components/PasswordField';
import Header from '../../../components/Header';

function UserProfileView(props) {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState(null);
  const [phone, setPhone] = useState(null);
  const [martial, setMartial] = useState(null);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [profileImg, setProfileImg] = useState(null);
  const [dob, setDOB] = useState(null);

  const [em_phoneCode, setEmPhoneCode] = useState(null);
  const [em_phone, setEmPhone] = useState(null);

  const [fullnameError, setFullnameError] = useState(false);
  const [emailError, setemailError] = useState(false);
  const [phoneError, setphoneError] = useState(false);
  const [em_phoneError, setEmphoneError] = useState(false);

  function openGallery() {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      console.log(image);

      setProfileImg(image.path);

      // const source = { uri: image.path };
      // this.setState({avatarSource: source, img: image.path});
    });
  }

  return (
    <Container>
      <Header />
      <ScrollView>
        <View style={styles.container}>
          <View style={{}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => props.navigation.pop()}
                style={{marginLeft: -10, justifyContent: 'center'}}>
                <Icon name="chevron-left" size={40} color={'black'} />
              </TouchableOpacity>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name="account-outline" size={25} />
                <Text style={{fontWeight: 'bold', fontSize: 20, width: '60%'}}>
                  Personal Information
                </Text>
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 150,
                marginTop: 10,
              }}>
              <TouchableOpacity
                style={styles.btnUpload}
                onPress={() => openGallery()}>
                <Icon name="account-circle" color={'lightgray'} size={120} />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 25,
                    right: 20,
                    backgroundColor: 'white',
                    padding: 7,
                    borderRadius: 20,
                    borderColor: 'lightgray',
                    borderWidth: 1,
                  }}>
                  <Icon name={'camera-outline'} color={green} size={20} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{paddingBottom: 40, marginTop: -30}}>
            <View style={styles.group}>
              <Text style={styles.label}>First name</Text>
              <InputField
                // borderColor={usernameError ? 'red' : textFieldBorder }
                placeholder={'Enter your first name'}
                onChangeText={text => setFirstName(text)}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Last name</Text>
              <InputField
                // borderColor={usernameError ? 'red' : textFieldBorder }
                placeholder={'Enter your last name'}
                onChangeText={text => setLastName(text)}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Email</Text>
              <InputField
                // borderColor={usernameError ? 'red' : textFieldBorder }
                placeholder={'Enter your email address'}
                onChangeText={text => setEmail(text)}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Phone Number</Text>
              <ContactField
                borderColor={phoneError == true ? 'red' : textFieldBorder}
                selectedValue={phoneCode}
                value={phone}
                keyboardType={'number-pad'}
                onValueChange={code => setPhoneCode(code)}
                onChangeText={text => setPhone(text)}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Martial Status</Text>
              <View style={styles.martialStatus}>
                <Picker
                  style={{height: 50, width: '100%'}}
                  mode="dropdown"
                  iosIcon={
                    <Icon name="chevron-down" color={'black'} size={20} />
                  }
                  selectedValue={martial}
                  onValueChange={text => setMartial(text)}>
                  <Picker.Item value={'COMMON_LAW'} label={'Common Law'} />
                  <Picker.Item
                    value="DIVORCED"
                    label="Divorced or legally separated"
                  />
                  <Picker.Item value={'MARRIED'} label={'Married'} />
                  <Picker.Item value={'SEPARATED'} label={'Separated'} />
                  <Picker.Item value={'SINGLE'} label={'Single'} />
                  <Picker.Item value={'WIDOW'} label={'Widow'} />
                </Picker>
              </View>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Date of Birth</Text>
              {/* <View style={styles.martialStatus}>
                            <TouchableOpacity style={{
                            flexDirection: 'row', height: 50, alignItems:'center'}}>
                                <Text style={{fontSize: 14, color: 'gray', marginLeft:5}}>03/21/2021</Text>
                                <View style={{position:'absolute', right: 15}}>
                                    <Icon name="calendar" size={25} color={"black"} />
                                </View>
                            </TouchableOpacity>
                        </View> */}
              <DatePicker onChange={date => setDOB(date)} />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Treaty Number</Text>
              <PasswordField
                // borderColor={usernameError ? 'red' : textFieldBorder }
                placeholder={'Enter Treaty number'}
                onChangeText={text => {}}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Social Insurance Number</Text>
              <PasswordField
                // borderColor={usernameError ? 'red' : textFieldBorder }
                placeholder={'Enter SI number'}
                onChangeText={text => {}}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Health Card Number</Text>
              <PasswordField
                // borderColor={usernameError ? 'red' : textFieldBorder }
                placeholder={'Enter HC number'}
                onChangeText={text => {}}
              />
            </View>
            <View style={{marginTop: 30}}>
              <Text style={{fontWeight: 'bold', fontSize: 20}}>
                Emergency Information
              </Text>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Full name <Text style={{color: 'lightgray'}}>(Optional)</Text>
              </Text>
              <InputField
                // borderColor={usernameError ? 'red' : textFieldBorder }
                placeholder={'Enter full number'}
                onChangeText={text => {}}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Email <Text style={{color: 'lightgray'}}>(Optional)</Text>
              </Text>
              <InputField
                // borderColor={usernameError ? 'red' : textFieldBorder }
                placeholder={'Enter your email address'}
                onChangeText={text => {}}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Phone Number</Text>
              <ContactField
                borderColor={em_phoneError == true ? 'red' : textFieldBorder}
                selectedValue={em_phoneCode}
                placeholder={'xx xxx xxxx'}
                value={em_phone}
                keyboardType={'number-pad'}
                onValueChange={code => setEmPhoneCode(code)}
                onChangeText={text => setEmPhone(text)}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 20,
                marginRight: 30,
              }}>
              <CheckBox
                value={policyAgreed}
                onValueChange={status => {
                  setPolicyAgreed(status);
                }}
                style={styles.checkbox}
              />
              <Text style={{fontSize: 12}}>
                Yes, I understand and agree to LLRIB Terms & conditions,
                including the Privacy policy.
              </Text>
            </View>
            <View style={{marginTop: 15}}>
              <TouchableOpacity style={{width: '100%', borderRadius: 50}}>
                <LinearGradient
                  colors={['#0B7E51', '#006940']}
                  style={styles.linearGradient}>
                  <Text
                    style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
                    Update
                  </Text>
                  <View style={{position: 'absolute', right: 20}}>
                    <Icon name={'chevron-right'} size={25} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryBGColor,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  btnUpload: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  group: {
    marginTop: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  martialStatus: {
    borderWidth: 1,
    marginTop: 7,
    paddingLeft: 12,
    paddingRight: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  checkbox: {
    borderRadius: 4,
    marginLeft: -6,
    marginRight: 6,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    flexDirection: 'row',
    height: 65,
    width: '100%',
  },
});

export default UserProfileView;
