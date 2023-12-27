import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import InputField from '../../../components/InputField';
import {Body, Left, Picker, Right, Title} from 'native-base';
import AddButton from '../../../components/AddButton';
import {useState} from 'react';
import Card from '../../../components/Card';
import Header from '../../../components/Header';
import {
  AlertMessages,
  educationType,
  setEducation,
} from '../../../utils/strings';
import {AppContext} from '../../../context/AppContext';
import {
  createEducation,
  deleteCardItem,
  fetchUserEducation,
  updateEducation,
} from '../../../servercalls/profile';
import {getDetailsAction} from '../../../servercalls/admin';
import {skipAStep} from '../../../servercalls/userApplication';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import {useDispatch, useSelector} from 'react-redux';
import EmptyContainer from '../../../components/EmptyContainer';
import BannerNotification from '../../../components/BannerNotification';
import {updateStepReviewStatus} from '../../../servercalls/user';
import {updateReviewedStep} from '../../../slices/userSlice';
import GlobalStyles from '../../../GlobalStyles';

const EducationalInfo = props => {
  const item = props.route?.params?.item;

  const userMeta = useSelector(state => state.userMeta);
  const appDispatch = useDispatch();

  // Context
  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [degree, setDegree] = useState([]);
  const [degreeTemp, setDegreeTEmp] = useState([]);
  const [type, setType] = useState('');
  const [itemId, setItemId] = useState(null);
  const [ins, setIns] = useState(null);
  const [grade, setGrade] = useState('');
  const [duration, setDuration] = useState('');
  const [errtype, seterrType] = useState(false);
  const [errins, seterrIns] = useState(false);
  const [errgrade, seterrGrade] = useState(false);
  const [errduration, seterrDuration] = useState(false);
  const [upLoading, setUpLoading] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [addNew, setAddNew] = useState(isAdmin ? false : true);
  const [record, setRecord] = useState(null);

  const insRef = React.createRef();
  const [keyboardShown, setKeyboardStatus] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      // fetch current user profile information from server
      getEducation();
    } else {
      fetchEducationDetails();
    }
    setAddNew(false);
    setShowEdit(false);

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [isAdmin]);

  const fetchEducationDetails = async () => {
    const response = await fetchUserEducation(
      state?.user?.id,
      state?.user?.accessToken,
    );
    if (response.status == 200) {
      setDegree(response.data);
      setDegreeTEmp(response.data);
      if (response.data.length > 0) {
        setAddNew(false);
      }
    }
  };

  const validations = () => {
    try {
      let response = true;
      if (type == '' || type == null) {
        seterrType(true);
        response = false;
      }
      if (type == 'GRADE') {
        if (grade == '' || grade == null) {
          seterrGrade(true);
          response = false;
        }
      } else {
        if (duration == '' || duration == null) {
          seterrDuration(true);
          response = false;
        }
      }
      return response;
    } catch (err) {
      console.log('Error in validations', err);
    }
  };

  const AddDegree = async () => {
    try {
      setUpLoading(true);
      if (validations()) {
        if (showEdit) {
          var d = {};
          if (type === 'GRADE') {
            d = {
              educationType: type,
              institute: ins,
              grade: grade,
            };
          } else {
            d = {
              educationType: type,
              institute: ins,
              duration: duration,
            };
          }
          // var items = [...degreeTemp];
          // items.push(d);
          fetchEducationDetails();
          setDuration(1);
          setGrade(1);
          setIns(null);

          setShowEdit(false);
          setAddNew(false);
          setUpLoading(false);
        } else {
          var payload = {
            educationType: type,
            duration: type == 'GRADE' ? grade : duration,
            institute: ins,
            userProfile: {
              completedStepNumber:
                userMeta?.user.completedStepNumber > 3
                  ? userMeta?.user.completedStepNumber
                  : 3,
              id: state?.user?.id,
            },
          };

          let response = await createEducation(
            payload,
            state?.user?.accessToken,
          );
          if (response.status === 200) {
            setUpLoading(false);
            BannerNotification.show(
              '',
              AlertMessages.FORM_SUBMISSION_SUCCESS,
              'success',
            );

            setAddNew(false);
            var d = {};
            if (type == 'GRADE') {
              d = {
                id: response.data?.id,
                educationType: type,
                institute: ins,
                grade: grade,
              };
            } else {
              d = {
                id: response.data?.id,
                educationType: type,
                institute: ins,
                duration: duration,
              };
            }
            console.log('Item added', d);
            // var items = [...degreeTemp];
            // items.push(d);
            setDuration(1);
            setGrade(1);
            setIns(null);
            fetchEducationDetails();
            // setDegree(items);
            setShowEdit(false);
            setAddNew(false);
          } else {
            alert('Unable to create education record, please again');
            // console.log('Response from CreateEducation', response);
            setUpLoading(false);
          }
        }
      } else {
        setUpLoading(false);

        alert(AlertMessages.FILL_FIELD_VALIDATION);
      }
    } catch (err) {
      alert('Unable to add Education Information ' + err);
    }
  };
  const UpdateDegree = async () => {
    try {
      setUpLoading(true);

      if (validations()) {
        if (showEdit) {
          var d = {};
          if (type == 'GRADE') {
            d = {
              id: itemId,
              educationType: type,
              institute: ins,
              grade: grade,
            };
          } else {
            d = {
              id: itemId,
              educationType: type,
              institute: ins,
              duration: duration,
            };
          }
          var items = degreeTemp.map(degree => {
            degree.id === d.id ? d : degree;
          });

          var payload = {
            id: itemId,
            educationType: type,
            duration: type == 'GRADE' ? grade : duration,
            institute: ins,
            userProfile: {
              // completedStepNumber:
              //   userMeta?.user.completedStepNumber > 3
              //     ? userMeta?.user.completedStepNumber
              //     : 3,
              id: state?.user?.id,
            },
          };

          let response = await updateEducation(
            payload,
            state?.user?.accessToken,
          );
          if (response.status === 200) {
            BannerNotification.show(
              '',
              AlertMessages.FORM_SUBMISSION_SUCCESS,
              'success',
            );
            setUpLoading(false);
            fetchEducationDetails();
            setShowEdit(false);
            setDuration(1);
            setGrade(1);
            setIns(null);
            setShowEdit(false);
            setAddNew(false);
          } else {
            console.log('Response from CreateEducation', response);
            BannerNotification.show(
              '',
              AlertMessages.FORM_SUBMISSION_FAILED,
              'error',
            );
          }
        }
      } else {
        setUpLoading(false);

        alert(AlertMessages.FILL_FIELD_VALIDATION);
      }
    } catch (err) {
      setUpLoading(false);

      alert('Unable to add Education Information ' + err);
    }
  };

  const editItem = item => {
    setRecord(item);
    console.log("Record beofre edit",item);
    setIns(item.institute);
    setType(item.educationType);
    setItemId(item.id);
    if (item.educationType === 'GRADE') {
      // setGrade(isAdmin ? item.duration : item.grade);
      setGrade(item.duration);
    }
    else {
      setDuration(item.duration);
    }
    setDegree([]);
    setShowEdit(true);
  };

  async function deleteEdu(itemId) {
    Alert.alert('Warning', 'Do you want to delete this record?', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          let params = {
            itemId: itemId,
            userId: state?.user?.id,
            type: 'educations',
          };
          console.log(params, 'del params');
          let response = await deleteCardItem(params, state?.user?.accessToken);
          if (response.status == 200) {
            fetchEducationDetails();
            BannerNotification.show(
              '',
              'Record deleted successfully',
              'success',
            );
          } else {
            alert('err in deleted');
          }
        },
      },
    ]);
  }

  async function getEducation() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item?.id ?? state?.user?.id,
      'user-profile',
      '/educations',
    );
    // setLoading(false);
    if (response.status == 200) {
      setAddNew(false);
      setShowEdit(false);
      setDegree(response?.data);
      setDegreeTEmp(response?.data);
    } else {
      alert(response.data.title);
    }
  }

  const updateReviewStatus = async () => {
    const payload = {isEducationAck: true};
    const response = await updateStepReviewStatus(
      {isAddressAck: true, id: userMeta?.user?.id},
      userMeta?.user?.accessToken,
      userMeta?.user?.id,
    );
    console.log('response', response);
    if (response.status === 200) {
      appDispatch(updateReviewedStep({step: 'isEducationAck', status: true}));
      setTimeout(() => {
        props.navigation.pop();
      }, 100);
    }
  };

  return (
    <KeyboardAwareView style={{flex: 1}} behavior={'padding'}>
      <ScrollView
        style={{backgroundColor: primaryBGColor}}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingBottom: keyboardShown ? 40 : 0}}>
        {props.route && props.route.params.showHeader && <Header />}
        <View style={styles.container}>
          <View
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {props.route && props.route.params.showHeader && (
              <TouchableOpacity
                onPress={() =>
                  !addNew
                    ? props.navigation.pop()
                    : (setDegree(degreeTemp),
                      setShowEdit(false),
                      setAddNew(false))
                }
                style={{justifyContent: 'center'}}>
                <Icon name="arrow-left" size={25} color={green} />
              </TouchableOpacity>
            )}
            <Text
              style={{
                flex: 1,
                marginLeft: 5,
                fontWeight: 'bold',
                fontSize: 20,
              }}>
              Education
            </Text>
          </View>
          <FlatList
            data={degree}
            renderItem={(item, index) => {
              var edu = educationType.filter(
                x => x.value == item.item.educationType,
              );
              console.log(item, 'eduItem');
              return (
                <View key={index} style={styles.card}>
                  <TouchableOpacity
                    onPress={() => editItem(item?.item ?? item)}
                    style={{
                      flex: 0.85,
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        marginBottom: 4,
                      }}>
                      {edu[0].label}
                    </Text>
                    <Text style={{fontSize: 12}}>
                      {item?.item.duration}{' '}
                      <Text>
                        {item.item.educationType === 'GRADE'
                          ? 'Level'
                          : 'Years'}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      justifyContent: 'center',
                      position: 'absolute',
                      right: 15,
                      alignSelf: 'center',
                      flex: 0.15,
                    }}>
                    <TouchableOpacity
                      style={{
                        width: 25,
                        height: 25,
                      }}
                      onPress={() =>
                        !isAdmin
                          ? deleteEdu(item?.item?.id)
                          : editItem(item?.item ?? item)
                      }>
                      <Icon
                        name={!isAdmin ? 'close' : 'chevron-right'}
                        size={25}
                        color={!isAdmin ? 'red' : 'green'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
          {isAdmin && !addNew && !showEdit && degree.length == 0 && (
            <EmptyContainer />
          )}
          {(showEdit || addNew) && (
            <View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Education Type <Text style={styles.labelStrick}>*</Text>
                </Text>
                <View
                  style={{
                    height: 50,
                    borderColor: errtype ? 'red' : textFieldBorder,
                    borderWidth: 1,
                    marginTop: 7,
                    paddingHorizontal: 8,
                    paddingVertical: 1,
                    borderRadius: 5,
                  }}>
                  <Picker
                    enabled={isAdmin ? false : true}
                    mode="dropdown"
                    style={{height: 50, width: '100%'}}
                    iosIcon={
                      <Icon name="chevron-down" color={'black'} size={20} />
                    }
                    selectedValue={type}
                    onValueChange={text => {
                      setType(text);
                      seterrType(false);
                    }}>
                    <Picker.Item label="Select a Education Type" value={''} />
                    <Picker.Item label="Degree" value={'DEGREE'} />
                    <Picker.Item label="Diploma" value={'DIPLOMA'} />
                    <Picker.Item label="Grade" value={'GRADE'} />
                    <Picker.Item
                      label="Technical Training"
                      value={'TECH_TRAINING'}
                    />
                    <Picker.Item label="University" value={'UNIVERSITY'} />
                  </Picker>
                </View>
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Institute</Text>
                <InputField
                  editable={isAdmin ? false : true}
                  borderColor={errins ? 'red' : textFieldBorder}
                  hasError={errins}
                  ref={insRef}
                  value={ins}
                  placeholder={'Enter institute'}
                  onChangeText={text => {
                    setIns(text);
                    seterrIns(false);
                  }}
                />
              </View>
              {type == 'GRADE' ? (
                <View style={styles.group}>
                  <Text style={styles.label}>
                    Level<Text style={styles.labelStrick}>*</Text>
                  </Text>
                  <View
                    style={{
                      height: 50,
                      borderColor: errgrade ? 'red' : textFieldBorder,
                      borderWidth: 1,
                      marginTop: 7,
                      paddingHorizontal: 8,
                      paddingVertical: 1,
                      borderRadius: 5,
                    }}>
                    <Picker
                      enabled={isAdmin ? false : true}
                      mode="dropdown"
                      style={{width: '100%'}}
                      iosIcon={
                        <Icon name="chevron-down" color={'black'} size={20} />
                      }
                      selectedValue={grade}
                      onValueChange={text => setGrade(text)}>
                      <Picker.Item label="Select a grade..." value={''} />
                      <Picker.Item label="1" value={1} />
                      <Picker.Item label="2" value={2} />
                      <Picker.Item label="3" value={3} />
                      <Picker.Item label="4" value={4} />
                      <Picker.Item label="5" value={5} />
                      <Picker.Item label="6" value={6} />
                      <Picker.Item label="7" value={7} />
                      <Picker.Item label="8" value={8} />
                      <Picker.Item label="9" value={9} />
                      <Picker.Item label="10" value={10} />
                      <Picker.Item label="11" value={11} />
                      <Picker.Item label="12" value={12} />
                    </Picker>
                  </View>
                </View>
              ) : (
                <View style={styles.group}>
                  <Text style={styles.label}>
                    Duration <Text style={styles.labelStrick}>*</Text>
                  </Text>
                  <View
                    style={{
                      height: 50,
                      borderColor: errduration ? 'red' : textFieldBorder,
                      borderWidth: 1,
                      marginTop: 7,
                      paddingHorizontal: 8,
                      paddingVertical: 1,
                      borderRadius: 5,
                    }}>
                    <Picker
                      enabled={isAdmin ? false : true}
                      mode="dropdown"
                      selectedValue={duration}
                      style={{width: '100%'}}
                      iosIcon={
                        <Icon name="chevron-down" color={'black'} size={20} />
                      }
                      onValueChange={text => setDuration(text)}>
                      <Picker.Item label="Select a duration" value={''} />
                      <Picker.Item label="1 year" value={1} />
                      <Picker.Item label="2 years" value={2} />
                      <Picker.Item label="3 years" value={3} />
                      <Picker.Item label="4 years" value={4} />
                    </Picker>
                  </View>
                </View>
              )}
            </View>
          )}
          {!isAdmin && (
            <View style={{marginTop: 15}}>
              <View
                style={{
                  marginTop: 15,
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                {(showEdit || addNew) && (
                  <AddButton
                    // isLoading={upLoading}
                    text={'Cancel'}
                    style={{
                      width: Dimensions.get('screen').width / 2.3,
                      borderColor: 'red',
                    }}
                    textStyle={{color: 'red'}}
                    onPress={() => (
                      setDegree(degreeTemp),
                      setShowEdit(false),
                      setAddNew(false),
                      seterrType(false),
                      seterrIns(false)
                    )}
                  />
                )}
                <AddButton
                  text={showEdit ? 'Update' : addNew ? 'Save' : 'Add New'}
                  isLoading={upLoading}
                  style={{
                    width:
                      showEdit || addNew
                        ? Dimensions.get('screen').width / 2.3
                        : Dimensions.get('screen').width - 40,
                  }}
                  // text={showEdit == true && addNew ? 'Add New' : 'Save'}
                  onPress={() => {
                    if (addNew) {
                      AddDegree();
                    } else if (showEdit) {
                      UpdateDegree();
                    } else {
                      setAddNew(true);
                      setDegree([]);
                      setType('');
                      setIns('');
                      setGrade(1);
                      setDuration(1);
                    }
                  }}
                />
              </View>
              <View
                style={{
                  height: 1,
                  marginVertical: 25,
                  width: '100%',
                  backgroundColor: 'lightgray',
                }}
              />
            </View>
          )}
          {!isAdmin &&
            props.route?.params?.isReviewRequired &&
            !userMeta?.reviewedSteps?.isEducationAck && (
              <>
                <View>
                  <TouchableOpacity
                    onPress={updateReviewStatus}
                    style={{width: '100%', borderRadius: 50}}>
                    <LinearGradient
                      colors={['#0B7E51', '#006940']}
                      style={[
                        GlobalStyles.flexDirectionRow,
                        GlobalStyles.linearGradient,
                      ]}>
                      <Text
                        style={{
                          fontSize: 18,
                          color: 'white',
                          fontWeight: 'bold',
                        }}>
                        I Acknowledge
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          {!isAdmin && props?.isProfileConfig && (
            <View style={{marginBottom: 30}}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    marginRight: 12,
                    borderRadius: 50,
                  }}
                  onPress={() => {
                    props.scrollToNext(1);
                    props.jumpTo('address');
                  }}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={[
                      GlobalStyles.flexDirectionRow,
                      GlobalStyles.linearGradient,
                    ]}>
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
                    if (addNew) {
                      BannerNotification.show(
                        '',
                        'Please save current information.',
                        'error',
                      );
                      return;
                    }

                    if (degree.length === 0) {
                      BannerNotification.show(
                        '',
                        'Please add atleast one record.',
                        'error',
                      );
                      return;
                    }

                    props.scrollToNext(3);
                    props.jumpTo('employment');
                  }}
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    borderRadius: 50,
                  }}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={[
                      GlobalStyles.flexDirectionRow,
                      GlobalStyles.linearGradient,
                    ]}>
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
          )}
        </View>
      </ScrollView>
    </KeyboardAwareView>
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
    alignItems: 'center',
    borderRadius: 5,
    paddingVertical: 20,
    paddingStart: 30,
    paddingEnd: 10,
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    elevation: 5,
  },
  cardHeading: {
    flex: 0.6,
    fontSize: 18,
    fontWeight: 'bold',
  },
  fileType: {flex: 0.4, fontSize: 12, color: 'lightgray', paddingBottom: 3},
  description: {
    fontSize: 12,
    marginTop: 3,
  },
  // linearGradient: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderRadius: 40,
  //   flexDirection: 'row',
  //   height: 60,
  //   // width: '100%',
  // },
  group: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  labelStrick: {
    fontSize: 16,
    color: 'red',
    fontWeight: '100',
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

export default EducationalInfo;
