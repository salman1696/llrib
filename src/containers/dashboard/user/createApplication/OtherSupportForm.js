import React, {useContext} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  green,
  primaryBGColor,
  textColor,
  textFieldBorder,
} from '../../../../utils/colors';
import InputField from '../../../../components/InputField';
import AddButton from '../../../../components/AddButton';
import {useState} from 'react';
import UploadButton from '../../../../components/UploadButton';
import Header from '../../../../components/Header';
import {Container, Picker, Switch} from 'native-base';
import DatePicker from '../../../../components/CustomDatePicker';
import {AppContext} from '../../../../context/AppContext';
import {useEffect} from 'react/cjs/react.development';
import Toast from 'react-native-simple-toast';

const OtherSupportForm = props => {
  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [amount, setAmount] = useState(0);
  const [community, setCommunity] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date());

  const [cpp, setCpp] = useState(false);
  const [childMaintenance, setChildMaintenance] = useState(false);
  const [school, setSchool] = useState(false);
  const [other, setOther] = useState(false);

  const step = 4;
  let mApplication = '';
  let nextCompleted = true;
  useEffect(() => {
    state.applicationData.map(elm => {
      if (elm.step_id === step) {
        mApplication = elm;
      }
      if (elm.step_id === step + 1) {
        nextCompleted = elm?.completed;
      }
    });
    setAmount(state?.application.otherSupportAmount);
    setCpp(state?.application.isOtherSupportCpp);
    setChildMaintenance(state?.application.isOtherSupportChildCare);
    console.log(amount);
  }, []);

  return (
    <Container style={{}}>
      <ScrollView>
        <Header />
        <View style={styles.container}>
          <View
            style={{
              marginVertical: 13,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => props.navigation.pop()}
              style={{
                justifyContent: 'center',
              }}>
              <Icon name="arrow-left" size={25} color={green} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                marginLeft: 5,
                fontWeight: 'bold',
                fontSize: 20,
              }}>
              Other Supports
            </Text>
            <TouchableOpacity style={{paddingHorizontal: 10}}>
              {!isAdmin && (
                <Text style={{color: green, fontSize: 16, fontWeight: 'bold'}}>
                  {'Skip >>'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <View
              style={{
                marginRight: 5,
                width: 7,
                height: 7,
                backgroundColor: 'black',
                borderRadius: 10,
              }}></View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>CPP</Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#E5E5E5', true: '#006940'}}
                thumbColor={cpp ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => !isAdmin && setCpp(!cpp)}
                value={state.application.isOtherSupportCpp}
              />
            </View>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <View
              style={{
                marginRight: 5,
                width: 7,
                height: 7,
                backgroundColor: 'black',
                borderRadius: 10,
              }}></View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                Child Maintenace
              </Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#E5E5E5', true: '#006940'}}
                thumbColor={childMaintenance ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() =>
                  !isAdmin && setChildMaintenance(!childMaintenance)
                }
                value={state.application.isOtherSupportChildCare}
              />
            </View>
          </View>
          <View>
            <View style={styles.group}>
              <Text style={styles.label}>Amount</Text>
              {/* <InputField 
                            // borderColor={usernameError ? 'red' : textFieldBorder }
                            placeholder={"Enter your amount"} 
                            keyboardType={"number-pad"}
                            onChangeText={(text) => { setAmount(text) } }
                        /> */}
              <View
                style={{
                  ...styles.textfield,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name="currency-usd"
                  color={'black'}
                  size={25}
                  style={{marginHorizontal: 7}}
                />
                <TextInput
                  editable={isAdmin ? false : true}
                  placeholder={!isAdmin ? 'Enter your amount' : 'Amount'}
                  // secureTextEntry={props.secureTextEntry ? true : false}
                  keyboardType={'number-pad'}
                  defaultValue={`${amount}`}
                  style={{color: textColor}}
                  onChangeText={text => {
                    isAdmin && setAmount(text);
                  }}
                />
              </View>
            </View>
            <View style={styles.group}>
              <Text style={{...styles.label, fontWeight: 'normal'}}>
                {!isAdmin
                  ? 'Please upload related document'
                  : 'View related document'}
              </Text>
            </View>
            <View style={{marginTop: 10}}>
              <View style={styles.card}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                  }}>
                  <Text style={styles.cardHeading}>Verification Document</Text>
                  <Text style={styles.fileType}>*png, jpg or pdf</Text>
                </View>
                <View style={{marginTop: 15}}>
                  <UploadButton
                    text={!isAdmin ? 'Upload' : 'View'}
                    onPress={() => {
                      alert('Uploading...');
                    }}
                  />
                </View>
              </View>
            </View>
            <View
              style={{
                paddingVertical: 20,
                backgroundColor: primaryBGColor,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate(
                      state.applicationData[step - 1]?.back_nav,
                    )
                  }
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    marginRight: 12,
                    borderRadius: 50,
                  }}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={styles.linearGradient}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                      Back
                    </Text>
                    <View style={{position: 'absolute', left: 20}}>
                      <Icon name={'chevron-left'} size={25} color="white" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    state.applicationData[step].completed
                      ? props.navigation.navigate(
                          state.applicationData[step - 1].next_nav,
                        )
                      : Toast.show('Next step is incompleted ', Toast.LONG);
                  }}
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    borderRadius: 50,
                  }}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={styles.linearGradient}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                      Next
                    </Text>
                    <View style={{position: 'absolute', right: 20}}>
                      <Icon name={'chevron-right'} size={25} color="white" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryBGColor,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 70,
    borderColor: '#ededed',
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  textArea: {
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    height: 100,
    textAlignVertical: 'top',
  },
  textfield: {
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    borderRadius: 5,
    color: 'black',
  },
  cardHeading: {
    flex: 0.6,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileType: {
    flex: 0.4,
    fontSize: 12,
    color: 'lightgray',
    paddingBottom: 3,
    textAlign: 'right',
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
    height: 60,
    // width: '100%',
  },
  group: {
    marginTop: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dropdown: {
    height: 50,
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 5,
  },
});

export default OtherSupportForm;
