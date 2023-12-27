import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  ToastAndroid,
  View,
  Keyboard,
  Platform,
} from 'react-native';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import InputField from '../../../components/InputField';
import {Picker} from 'native-base';
import AddButton from '../../../components/AddButton';
import {useState} from 'react';
import Card from '../../../components/Card';
import ContactField from '../../../components/ContactField';
import DatePicker from '../../../components/CustomDatePicker';
import PasswordField from '../../../components/PasswordField';
import Header from '../../../components/Header';
import {AppContext} from '../../../context/AppContext';
import {getDetailsAction} from '../../../servercalls/admin';
import moment from 'moment';
import {AlertMessages} from '../../../utils/strings';
import {
  createDependent,
  createSpouse,
  deleteCardItem,
  fetchUserDependent,
  fetcUserSpouse,
  updateDependent,
  updateSpouse,
  removeSpouse,
} from '../../../servercalls/profile';
import {skipAStep} from '../../../servercalls/userApplication';
import {isEmailValid} from '../../../helpers/Utils';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import {useDispatch, useSelector} from 'react-redux';
import {storeUserProfile, updateReviewedStep} from '../../../slices/userSlice';
import BannerNotification from '../../../components/BannerNotification';
import {updateStepReviewStatus} from '../../../servercalls/user';
import GlobalStyles from '../../../GlobalStyles';

const FamilyInfo = props => {
  const item = props.route?.params?.item;

  const userMeta = useSelector(state => state.userMeta);
  const appDispatch = useDispatch();

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [spouse, setSpouse] = useState('');
  const [isSpouseUpdated, setSpouseUpdated] = useState(false);

  const [dependents, setDependents] = useState([]);
  const [dependentsTemp, setDependentsTemp] = useState([]);

  const [view, setView] = useState(0);
  const [sPhone, setSPhone] = useState(null);
  const [sPhoneCode, setSPhoneCode] = useState('+1');
  const [sEmail, setSEmail] = useState(null);
  const [sFullName, setSFullName] = useState(null);
  const [sTreatyCard, setSTreatyCard] = useState(null);

  const [errsEmail, seterrSEmail] = useState(false);
  const [errsFullName, seterrSFullName] = useState(false);
  const [errsTreatyCard, seterrSTreatyCard] = useState(false);

  const [dob, setDOB] = useState(null);
  const [dFullName, setDFullName] = useState(null);
  const [dRelationship, setDRelationship] = useState('');
  const [healthCard, setHealthCard] = useState(null);
  const [treatyCard, setTreatyCard] = useState(null);

  const [errdob, seterrDOB] = useState(false);
  const [errdFullName, seterrDFullName] = useState(false);
  const [errdRelationship, seterrDRelationship] = useState(false);
  const [errhealthCard, seterrHealthCard] = useState(false);
  const [errtreatyCard, seterrTreatyCard] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [addNew, setAddNew] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [upLoading, setUpLoading] = useState(false);
  const hasSpouse = ['COMMON_LAW', 'MARRIED']?.includes(
    state?.profile?.maritalStatus
  );
  console.log("============================familyInfo==========================", hasSpouse, state?.profile?.maritalStatus)
  // Refs
  const spouseEmailRef = React.createRef();
  const spousePhoneRef = React.createRef();

  const depHealthRef = React.createRef();
  const depTreatyRef = React.createRef();
  let scrollRef = React.useRef();
  if (!scrollRef) {
    scrollRef = React.createRef();
  }

  const [keyboardShown, setKeyboardStatus] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    console.log(state?.user);
    if (state?.profile?.maritalStatus === 'SINGLE') {
      getDependentsDetail('/dependents', isAdmin ? item : state?.user); // Get Dependent info.
    } else {
      // Get Spouse information from server.
      getDependentsDetail('', isAdmin ? item : state?.user);
      view == 0
        ? item?.invitedSpouseName === null // Spouse is already not added
          ? getDependentsDetail('', isAdmin ? item : state?.user) // Fetch spouse info
          : (setSFullName(item?.invitedSpouseName),
            setSEmail(item?.invitedSpouseEmail),
            setSTreatyCard(item?.invitedSpouseTreatyNumber),
            setSpouseUpdated(item?.data?.isInvitedSpouse))
        : getDependentsDetail('/dependents', isAdmin ? item : state?.user); // Get Dependent info.
    }
  }, [view]);

  async function getDependentsDetail(endpoint2, item) {
    console.log('endpoint', endpoint2);
    let response = '';
    if (isAdmin) {
      response = await getDetailsAction(
        state?.user?.accessToken,
        item.id,
        'user-profile',
        endpoint2,
      );
    } else {
      if (endpoint2 === '/dependents') {
        console.log('fetching dependent');
        response = await fetchUserDependent(item.id, state?.user?.accessToken);
      }
      if (endpoint2 === '') {
        console.log('Fethcing spouse');
        response = await fetcUserSpouse(item.id, state?.user?.accessToken);
      }
      console.log('Response', response);
    }

    // setLoading(false);
    if (response.status == 200) {
      if (endpoint2 === '') {
        console.log('user spouse Response => ', response.data);
        var sp = {
          invitedSpouseName: response.data.invitedSpouseName,
          invitedSpouseEmail: response?.data.invitedSpouseEmail,
          invitedSpouseTreatyNumber: response?.data.invitedSpouseTreatyNumber,
        };
        setSpouseUpdated(response?.data?.isInvitedSpouse)
        setSFullName(response?.data.invitedSpouseName);
        setSEmail(response?.data.invitedSpouseEmail);
        setSTreatyCard(response?.data.invitedSpouseTreatyNumber);

        if (!userMeta?.profile) {
          appDispatch(storeUserProfile(response?.data));
        }
      } else {
        setDependents(response?.data);
        setDependentsTemp(response?.data);
        if (response.data.length > 0) {
          setAddNew(false);
        }
      }
    } else {
      alert(response.data.title);
    }
  }

  const validationSpouse = () => {
    try {
      let response = true;
      if (sFullName == '' || sFullName == null) {
        seterrSFullName(true);
        response = false;
      }
      if (sEmail == '' || sEmail == null) {
        if (!isEmailValid(sEmail)) {
          seterrSEmail(true);
          response = false;
        }
      }
      if (
        sTreatyCard == '' ||
        sTreatyCard == null ||
        sTreatyCard.length !== 10
      ) {
        seterrSTreatyCard(true);
        response = false;
      }

      return response;
    } catch (err) {
      console.log('Error in validations', err);
    }
  };

  const validationDependent = () => {
    try {
      let response = true;
      if (dFullName == '' || dFullName == null) {
        seterrDFullName(true);
        response = false;
      }
      if (dRelationship == '' || dRelationship == null) {
        seterrDRelationship(true);
        response = false;
      }
      if (treatyCard == '' || treatyCard == null || treatyCard.length !== 10) {
        seterrTreatyCard(true);
        response = false;
      }
      if (dob == '' || dob == null) {
        seterrDOB(true);
        response = false;
      }
      if (healthCard == '' || healthCard == null || healthCard.length !== 9) {
        seterrHealthCard(true);
        response = false;
      }

      return response;
    } catch (err) {
      console.log('Error in validations', err);
    }
  };

  const uploadspouseInfo = async () => {
    setUpLoading(true);
    try {
      const payload = {
        id: state?.user?.id,
        completedStepNumber: userMeta?.user.completedStepNumber > 7
        ? userMeta?.user.completedStepNumber
        : 7,
        isInvitedSpouse: true,
        invitedSpouseName: sFullName,
        invitedSpouseEmail: sEmail,
        invitedSpouseTreatyNumber: sTreatyCard,
      };
      console.log(payload, state?.user?.accessToken, 'Token-user');
      let response = await createSpouse(
        payload,
        state?.user?.accessToken,
        state?.user?.id,
      );
      console.log(response, '[REsposnseF]');
      if (response.status === 200) {
        setTimeout(() => {
          setUpLoading(false);
          setSpouseUpdated(true);

          BannerNotification.show(
            '',
            AlertMessages.FORM_SUBMISSION_SUCCESS,
            'success',
          );
        }, 2000);
      } else {
        setUpLoading(false);
        BannerNotification.show(
          '',
          AlertMessages.FORM_SUBMISSION_FAILED,
          'error',
        );
      }
      setUpLoading(false);
    } catch (err) {
      setUpLoading(false);

      console.log('Unable to upload spouse information', err);
    }
  };

  const AddDependentInfo = async () => {
    try {
      setUpLoading(true);
      if (validationDependent()) {
        const payload = {
          fullName: dFullName,
          relationship: dRelationship,
          dateOfBirth: dob,
          treatyNumber: treatyCard,
          healthCardNumber: healthCard,
          userProfile: {
            completedStepNumber:
              userMeta?.user.completedStepNumber > 8
                ? userMeta?.user.completedStepNumber
                : 8,
            id: state?.user?.id,
          },
        };

        let response = await createDependent(payload, state?.user?.accessToken);
        console.log('Response from CreateDependent', response);
        if (response.status === 200) {
          setUpLoading(false);

          BannerNotification.show(
            '',
            AlertMessages.FORM_SUBMISSION_SUCCESS,
            'success',
          );
          getDependentsDetail('/dependents', state?.user);
          setDRelationship('');
          setDFullName(null);
          setDOB(null);
          setHealthCard(null);
          setTreatyCard(null);
          setAddNew(false);
        } else {
          setUpLoading(false);
          BannerNotification.show(
            '',
            AlertMessages.FORM_SUBMISSION_FAILED,
            'error',
          );
        }
      } else {
        setUpLoading(false);
      }
    } catch (err) {
      alert('Unable to add Education Information ' + err);
    }
  };

  const updateDependentInfo = async () => {
    try {
      if (validationDependent()) {
        const payload = {
          id: itemId,
          fullName: dFullName,
          relationship: dRelationship,
          dateOfBirth: dob,
          treatyNumber: treatyCard,
          healthCardNumber: healthCard,
          userProfile: {
            // completedStepNumber:
            //   userMeta?.user.completedStepNumber > 8
            //     ? userMeta?.user.completedStepNumber
            //     : 8,
            id: state?.user?.id,
          },
        };

        let response = await updateDependent(payload, state?.user?.accessToken);
        console.log('Response from CreateBankAccount', response);
        if (response.status === 200) {
          BannerNotification.show(
            '',
            AlertMessages.FORM_SUBMISSION_SUCCESS,
            'success',
          );
          getDependentsDetail('/dependents', state?.user);
          setDRelationship('');
          setDFullName(null);
          setDOB(null);
          setHealthCard(null);
          setTreatyCard(null);
          // setDependents(items);
          setShowEdit(false);
          // setAddNew(false);
        } else {
          BannerNotification.show(
            '',
            AlertMessages.FORM_SUBMISSION_FAILED,
            'error',
          );
        }
      }
    } catch (err) {
      alert('Unable to add Education Information ' + err);
    }
  };

  const handleSkip = async () => {
    const payload = {
      id: state?.user?.id,
      completedStepNumber: userMeta?.user.completedStepNumber > 8
      ? userMeta?.user.completedStepNumber
      : 8,
      userProfile: {
        id: state?.user?.id,
      },
    };
    let response = await skipAStep(
      payload,
      state?.user?.id,
      state?.user?.accessToken,
    );
    if (response.status === 200) {
      props.scrollToNext(8);
      props.jumpTo('documents');
    } else {
      console.log('**RESPONSE**', response);
      alert('Unable to skip this step, please try again.');
    }
  };

  function showSpouseView() {
    return (
      <>
        <View>
          <View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Full name <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                borderColor={errsFullName ? 'red' : textFieldBorder}
                placeholder={'Enter full name of spouse'}
                editable={isAdmin ? false : true}
                onChangeText={text => {
                  setSFullName(text);
                  seterrSFullName(false);
                }}
                value={sFullName}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  spouseEmailRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Email <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                editable={isAdmin ? false : true}
                borderColor={errsEmail ? 'red' : textFieldBorder}
                ref={spouseEmailRef}
                keyboardType={'email-address'}
                placeholder={"Enter spouse's email"}
                onChangeText={text => {
                  setSEmail(text);
                  seterrSEmail(false);
                }}
                returnKeyType={'next'}
                value={sEmail}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  depTreatyRef.current.focus();
                }}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Treaty Number <Text style={styles.labelStrick}>*</Text>
              </Text>
              <PasswordField
                borderColor={errsTreatyCard ? 'red' : textFieldBorder}
                ref={depTreatyRef}
                editable={isAdmin ? false : true}
                value={sTreatyCard}
                maxLength={10}
                placeholder={"Enter 10 digit Treaty number"}
                keyboardType={'number-pad'}
                onChangeText={text => {
                  setSTreatyCard(text);
                  seterrSTreatyCard(false);
                }}
              />
            </View>
          </View>

          <View style={{marginTop: 30}}>
            {!isAdmin &&  (
              <View  
                style={{
                  marginBottom:15,
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
              <AddButton
                isLoading={upLoading}
                text={!isSpouseUpdated ? 'save' : 'update'}
                style={{
                  width: Dimensions.get('screen').width / 2.3,
               
                }}
                onPress={() => {
                  if (validationSpouse()) {
                    uploadspouseInfo();
                  }
                  // if (spouse !== '') {
                  //   updateSpouse();
                  // } else {
                  //   alert(AlertMessages.FILL_FIELD_VALIDATION);
                  // }
                }}
              />
              {isSpouseUpdated && <AddButton
                  isLoading={upLoading}
                  text={'Remove'}
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    borderColor: 'red',
                  }}
                  textStyle={{color: 'red'}}
                  onPress={handleRemoveSpouse}
                />}
            </View>
            )}
            {!isAdmin && (
              <View
                style={{
                  height: 1,
                  marginBottom: 25,
                  width: '100%',
                  backgroundColor: 'lightgray',
                }}
              />
            )}
          </View>
        </View>
      </>
    );
  }

  const editItem = item => {
    setItemId(item.id);
    setDOB(item.dateOfBirth);
    setDFullName(item.fullName);
    setHealthCard(item.healthCardNumber);
    setDRelationship(item.relationship);
    setTreatyCard(item.treatyNumber);
    setDependents([]);
    setShowEdit(true);
  };
  const updateSpouse = () => {};

  async function deleteDependent(itemId) {
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
            type: 'dependents',
          };
          console.log(params, 'del params');
          let response = await deleteCardItem(params, state?.user?.accessToken);
          if (response.status == 200) {
            getDependentsDetail('/dependents', state?.user);
            BannerNotification.show(
              '',
              AlertMessages.FORM_UPDATED_SUCCESSFUL,
              'error',
            );
          } else {
            alert('err in deleted');
          }
        },
      },
    ]);
  }
  const handleRemoveSpouse = async () => {
    setUpLoading(true);
    const payloadData = {
      id: state?.profile?.id,
      isInvitedSpouse: false,
    };
    try {
      const response = await  removeSpouse(payloadData, state?.user?.accessToken)
      setSEmail(null);
      setSFullName(null);
      setSTreatyCard(null);
      setUpLoading(false);
      setSpouseUpdated(false);
      seterrSFullName(false)
      seterrSEmail(false);
      seterrSTreatyCard(false);
      BannerNotification.show(
        '',
        "Spouse info deleted",
        'success',
      );
    } catch (error) {
      console.log("========================SpouseRemoveError==============", error)
      setUpLoading(false);
      BannerNotification.show(
        '',
        "Spouse info not deleted",
        'error',
      );
    }  
  };

  function showDependentView() {
    return (
      <View>
        {dependents && !showEdit && (
          <FlatList
            data={dependents}
            renderItem={(item, index) => {
              console.log(item);
              return (
                <View key={index} style={styles.card}>
                  <TouchableOpacity
                    onPress={() => editItem(item?.item ?? item)}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        marginBottom: 4,
                      }}>
                      {item.item.fullName}
                    </Text>
                    <Text style={{fontSize: 12}}>{item.item.relationship}</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 20,
                      bottom: 0,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        isAdmin
                          ? editItem(item?.item ?? item)
                          : deleteDependent(item?.item.id);
                      }}
                      style={{padding: 15}}>
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
        )}
        {(state?.profile?.maritalStatus === 'SINGLE' || view == 1) &&
          (showEdit || addNew) && (
            <View style={{marginBottom: isAdmin ? 20 : 0}}>
              {isAdmin && (
                <TouchableOpacity
                  onPress={() => (
                    setShowEdit(false), setDependents(dependentsTemp)
                  )}
                  style={{flex: 0.2, paddingHorizontal: 10}}>
                  <Text
                    style={{color: green, fontSize: 16, fontWeight: 'bold'}}>
                    {'<< Back'}
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.group}>
                <Text style={styles.label}>
                  Full Name <Text style={styles.labelStrick}>*</Text>
                </Text>
                <InputField
                  borderColor={errdFullName ? 'red' : textFieldBorder}
                  editable={isAdmin ? false : true}
                  placeholder={'Enter dependent full name'}
                  onChangeText={text => {
                    setDFullName(text);
                    seterrDFullName(false);
                  }}
                  value={dFullName}
                  returnKeyType={'next'}
                  onSubmitEditing={() => {
                    depHealthRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Relationship to Applicant{' '}
                  <Text style={styles.labelStrick}>*</Text>
                </Text>
                <View
                  style={{
                    height: 50,
                    borderColor: errdRelationship ? 'red' : textFieldBorder,
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
                    selectedValue={dRelationship}
                    onValueChange={text => {
                      setDRelationship(text);
                      seterrDRelationship(false);
                    }}>
                    <Picker.Item label="Select a Relationship" value={''} />
                    <Picker.Item label="Son" value={'Son'} />
                    <Picker.Item label="Daughter" value={'Daughter'} />
                    <Picker.Item label="Grand Son" value={'Grand Son'} />
                    <Picker.Item
                      label="Grand Daughter"
                      value={'Grand Daughter'}
                    />
                    <Picker.Item label="Nephew" value={'Nephew'} />
                    <Picker.Item label="Niece" value={'Niece'} />
                  </Picker>
                </View>
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Date of Birth <Text style={styles.labelStrick}>*</Text>
                </Text>

                <DatePicker
                  init={dob === null ? true : false}
                  editable={isAdmin ? false : true}
                  value={dob}
                  hasError={errdob}
                  onChange={date => {
                    console.log('DOB', date);
                    if (date != '' && date != null) {
                      seterrDOB(false);
                      setDOB(date);
                      // setShowDatePicker(false);
                    }
                  }}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Health Card Number <Text style={styles.labelStrick}>*</Text>
                </Text>
                <PasswordField
                  borderColor={errhealthCard ? 'red' : textFieldBorder}
                  ref={depHealthRef}
                  maxLength={9}
                  editable={isAdmin ? false : true}
                  placeholder={'Enter dependent health card number'}
                  onChangeText={text => {
                    setHealthCard(text);
                    seterrHealthCard(false);
                  }}
                  value={healthCard}
                  keyboardType={'number-pad'}
                  returnKeyType={'done'}
                  onSubmitEditing={() => {
                    depTreatyRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Treaty Number <Text style={styles.labelStrick}>*</Text>
                </Text>
                <PasswordField
                  borderColor={errtreatyCard ? 'red' : textFieldBorder}
                  ref={depTreatyRef}
                  editable={isAdmin ? false : true}
                  value={treatyCard}
                  maxLength={10}
                  placeholder={"Enter 10 digit Treaty number"}
                  keyboardType={'number-pad'}
                  returnKeyType={'done'}
                  onChangeText={text => {
                    setTreatyCard(text);
                    seterrTreatyCard(false);
                  }}
                />
              </View>
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
                  text={'Cancel'}
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    borderColor: 'red',
                  }}
                  textStyle={{color: 'red'}}
                  onPress={() => {
                    // bankAccountTemp.length === 0 &&

                    setDependents(dependentsTemp);
                    seterrDFullName(false);
                    seterrDOB(false);
                    seterrDRelationship(false);
                    seterrHealthCard(false);
                    seterrTreatyCard(false);
                    setAddNew(false);
                    setShowEdit(false);
                  }}
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
                    AddDependentInfo();
                  } else if (showEdit) {
                    updateDependentInfo();
                  } else {
                    setAddNew(true);
                    setDependents([]);
                    setDRelationship('');
                    setDFullName(null);
                    setDOB(null);
                    setHealthCard(null);
                    setTreatyCard(null);
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
      </View>
    );
  }

  const updateReviewStatus = async () => {
    const payload = {isSpouseAck: true, isDependentsAck: true};
    const response = await updateStepReviewStatus(
      {isAddressAck: true, id: userMeta?.user?.id},
      userMeta?.user?.accessToken,
      userMeta?.user?.id,
    );
    console.log('response', response);
    if (response.status === 200) {
      appDispatch(updateReviewedStep({step: 'isSpouseAck', status: true}));
      appDispatch(updateReviewedStep({step: 'isDependentsAck', status: true}));
      setTimeout(() => {
        props.navigation.pop();
      }, 100);
    }
  };

  return (
    <KeyboardAwareView style={{flex: 1}} behavior={'padding'}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        style={{backgroundColor: primaryBGColor}}
        contentContainerStyle={{paddingBottom: keyboardShown ? 120 : 0}}>
        {props.route && props.route?.params?.showHeader && <Header />}
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            {props.route &&
              props.route?.params &&
              props.route?.params?.showHeader && (
                <TouchableOpacity
                  onPress={() => props.navigation.pop()}
                  style={{justifyContent: 'center'}}>
                  <Icon name="arrow-left" size={25} color={green} />
                </TouchableOpacity>
              )}
            <View
              style={{
                marginLeft: 5,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontWeight: 'bold',
                  fontSize: 20,
                }}>
                {state?.profile?.maritalStatus !== 'SINGLE'
                  ? 'Family'
                  : 'Dependents'}{' '}
                Information
              </Text>
              {!isAdmin && dependents?.length === 0 && props?.isProfileConfig && (
                <TouchableOpacity
                  onPress={handleSkip}
                  style={{
                    flex: 0.2,
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    style={{
                      color: green,
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                    {'Skip >>'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {state?.profile?.maritalStatus !== 'SINGLE' && (
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                padding: 7,
                backgroundColor: '#ededed',
                width: '100%',
                marginVertical: 15,
              }}>
             {hasSpouse && <View style={{flex: 0.5}}>
                <TouchableWithoutFeedback
                  style={{
                    backgroundColor: view == 0 ? 'white' : '#ededed',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 15,
                  }}
                  onPress={() => setView(0)}>
                  <Text
                    style={{
                      color: view == 0 ? green : 'lightgray',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                    Spouse
                  </Text>
                </TouchableWithoutFeedback>
              </View>}
              <View style={{flex: 0.5}}>
                <TouchableWithoutFeedback
                  style={{
                    backgroundColor: view == 1 ? 'white' : '#ededed',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 15,
                  }}
                  onPress={() => setView(1)}>
                  <Text
                    style={{
                      color: view == 1 ? green : 'lightgray',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                    Dependent
                  </Text>
                </TouchableWithoutFeedback>
              </View>
            </View>
          )}
          {state?.profile?.maritalStatus !== 'SINGLE' && hasSpouse && view === 0
            ? showSpouseView()
            : showDependentView()}
          {!isAdmin &&
            props.route?.params?.isReviewRequired &&
            !userMeta?.reviewedSteps?.isDependentsAck && (
              <>
                <View
                  style={{
                    height: 1,
                    marginVertical: 25,
                    width: '100%',
                    backgroundColor: 'lightgray',
                  }}
                />
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
          {!isAdmin &&  props?.isProfileConfig && (
            <View style={{marginBottom: 30}}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={() => {
                    props.scrollToNext(5);
                    props.jumpTo('asset');
                  }}
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    marginRight: 12,
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
                        AlertMessages.SAVE_CURRENT_INFO,
                        'error',
                      );
                      return;
                    }

                    props.scrollToNext(7);
                    props.jumpTo('documents');
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
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 30,
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
  contact: {
    flexDirection: 'row',
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 5,
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
    marginTop: 25,
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

export default FamilyInfo;
