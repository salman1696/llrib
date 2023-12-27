import React, {useContext, useEffect} from 'react';
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
import {green, primaryBGColor, textFieldBorder} from '../../../../utils/colors';
import InputField from '../../../../components/InputField';
import AddButton from '../../../../components/AddButton';
import {useState} from 'react';
import UploadButton from '../../../../components/UploadButton';
import Header from '../../../../components/Header';
import {Container, Picker} from 'native-base';
import {
  skipApplicationSkep,
  submitPreEmploymentInfo,
} from '../../../../servercalls/userApplication';
import {AppContext} from '../../../../context/AppContext';
import {AlertMessages} from '../../../../utils/strings';
import BannerNotification from '../../../../components/BannerNotification';

const PreEmployment = props => {
  const appItem = props.route?.params?.item;

  const [state, dispatch] = useContext(AppContext);

  const [title, setTitle] = useState(null);
  const [training, setTraining] = useState('NONE');
  const [type, setType] = useState(null);

  // Refs
  const trainingTypeRef = React.createRef();
  console.log("==================ApplicationCompleteStepNumber===============", state?.application?.completedStepNumber)
  useEffect(() => {
    console.log(
      appItem,
      '======================================================================',
    );
    setTraining(appItem?.emp_type?.type);
    setType(appItem?.emp_type?.typeOfTraining);
    setTitle(appItem?.emp_type?.title);
  }, []);

  const createRecord = () => {
    if (training == 'OTHER') {
      if (title == '' || title == null) {
        BannerNotification.show('', 'Please provide a valid title', 'error');
      } else if (type == '' || type == null) {
        // alert('Please provide a valid training type.');
        BannerNotification.show('', 'Please select a training type.', 'error');
      } else {
        submit();
      }
    } else {
      submit();
    }
  };

  const submit = async () => {
    const payload = {
      type: training,
      title: title,
      typeOfTraining: type,
      application: {
        id: state?.applicationId,
        completedStepNumber: state?.application?.completedStepNumber >= 2 ? state?.application?.completedStepNumber : 2,
      },
    };
    let response = await submitPreEmploymentInfo(
      payload,
      state?.user?.accessToken,
    );
    console.log('Response from preemployment', response);
    if (response.status === 200) {
      props.navigation.pop();
    } else {
      BannerNotification.show(
        '',
        AlertMessages.FORM_SUBMISSION_FAILED,
        'success',
      );
    }
  };

  return (
    <>
      <Container>
        <Header />
        <ScrollView style={styles.container}>
          <View
            style={{
              marginVertical: 13,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => props.navigation.pop()}
              style={{justifyContent: 'center'}}>
              <Icon name="arrow-left" size={30} color={green} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                fontSize: 20,
                marginLeft: 10,
              }}>
              Pre-Employment Supports
            </Text>
          </View>
          <View style={styles.group}>
            <Text style={{...styles.label, fontWeight: 'normal'}}>
              Please select the training type
            </Text>
            <View style={styles.dropdown}>
              <Picker
                style={{width: '100%'}}
                iosIcon={<Icon name="chevron-down" color={'black'} size={20} />}
                mode="dropdown"
                selectedValue={training}
                onValueChange={text => setTraining(text)}>
                <Picker.Item label="None" value={'NONE'} />
                <Picker.Item
                  label="Budget Workshop"
                  value={'BUDGETING_WORKSHOP'}
                />
                <Picker.Item
                  label="Chainsaw Safety"
                  value={'CHAINSAW_SAFETY'}
                />
                <Picker.Item
                  label="First-Aid Training"
                  value={'FIRST_DAY_TRAINING'}
                />
                <Picker.Item
                  label="High School Upgrade"
                  value={'HIGH_SCHOOL_UPGRADE'}
                />
                <Picker.Item
                  label="Life Skills Program"
                  value={'LIFE_SKILLS_PROGRAM'}
                />
                <Picker.Item label="Safety Tickets" value={'SAFETY_TICKET'} />
                <Picker.Item label="Other" value={'OTHER'} />
              </Picker>
            </View>
          </View>
          {training == 'OTHER' && (
            <View>
              <View style={styles.group}>
                <Text style={styles.label}>Training Title</Text>
                <InputField
                  // borderColor={usernameError ? 'red' : textFieldBorder }
                  placeholder={'Enter title here'}
                  value={title}
                  onChangeText={text => {
                    setTitle(text);
                  }}
                  returnKeyType={'next'}
                  onSubmitEditing={() => {
                    trainingTypeRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Training Type</Text>
                <InputField
                  // borderColor={usernameError ? 'red' : textFieldBorder }
                  ref={trainingTypeRef}
                  value={type}
                  placeholder={'Enter type here'}
                  onChangeText={text => {
                    setType(text);
                  }}
                />
              </View>
              <View
                style={{
                  paddingVertical: 20,
                  backgroundColor: primaryBGColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() => props.navigation.pop()}
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
                    onPress={createRecord}
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
          )}
        </ScrollView>
      </Container>
      {training != 'OTHER' && (
        <View
          style={{
            paddingVertical: 20,
            backgroundColor: primaryBGColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => props.navigation.pop()}
              style={{
                width: Dimensions.get('screen').width / 2.3,
                marginRight: 12,
                borderRadius: 50,
              }}>
              <LinearGradient
                colors={['#0B7E51', '#006940']}
                style={styles.linearGradient}>
                <Text
                  style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
                  Back
                </Text>
                <View style={{position: 'absolute', left: 20}}>
                  <Icon name={'chevron-left'} size={25} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={createRecord}
              style={{
                width: Dimensions.get('screen').width / 2.3,
                borderRadius: 50,
              }}>
              <LinearGradient
                colors={['#0B7E51', '#006940']}
                style={styles.linearGradient}>
                <Text
                  style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
                  Next
                </Text>
                <View style={{position: 'absolute', right: 20}}>
                  <Icon name={'chevron-right'} size={25} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryBGColor,
    paddingHorizontal: 20,
  },
  card: {
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
  cardHeading: {
    flex: 0.85,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileType: {flex: 0.2, fontSize: 12, color: 'lightgray', paddingBottom: 3},
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

export default PreEmployment;
