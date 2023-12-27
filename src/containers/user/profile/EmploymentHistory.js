import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import AddButton from '../../../components/AddButton';
import {useState} from 'react';
import DatePicker from '../../../components/CustomDatePicker';
// import CheckBox from '@react-native-community/checkbox';
import UploadButton from '../../../components/UploadButton';
import {Picker} from 'native-base';
import Header from '../../../components/Header';
import {CheckBox} from 'native-base';
import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
} from '../../../utils/strings';
import {
  createEmployment,
  deleteCardItem,
  fetchUserEmployment,
  updateEmployment,
} from '../../../servercalls/profile';
import {AppContext} from '../../../context/AppContext';
import {getDetailsAction} from '../../../servercalls/admin';
import {
  getPresignedUrl,
  uploadDocumentOnPresignedUrl,
  uploadFile,
} from '../../../servercalls/uploadFiles';
import {skipAStep} from '../../../servercalls/userApplication';
import {
  getFileExtension,
  getFileName,
  getPathFromUrl,
  scrollDown,
} from '../../../helpers/Utils';
import ErrorText from '../../../components/ErrorText';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import {useDispatch, useSelector} from 'react-redux';
import EmptyContainer from '../../../components/EmptyContainer';
import BannerNotification from '../../../components/BannerNotification';
import {updateStepReviewStatus} from '../../../servercalls/user';
import {updateReviewedStep} from '../../../slices/userSlice';
import GlobalStyles from '../../../GlobalStyles';

const EmploymentHistory = props => {
  const item = props.route?.params?.item;

  // redux
  const userMeta = useSelector(state => state.userMeta);
  const appDispatch = useDispatch();

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [employment, setEmployment] = useState([]);
  const [employmentTemp, setEmploymentTemp] = useState([]);

  const [employer, setEmployer] = useState(null);
  const [position, setPosition] = useState(null);
  const [reasonType, setReasonType] = useState('');
  const [reason, setReason] = useState(null);
  const [itemId, setItemId] = useState(null);

  const [erremployer, seterrEmployer] = useState(false);
  const [errposition, seterrPosition] = useState(false);
  const [errreasonType, seterrReasonType] = useState(false);
  const [errreason, seterrReason] = useState(false);
  const [errpayslip, seterrPaySlip] = useState(false);
  const [errstartDate, seterrStartDate] = useState(false);
  const [errendDate, seterrEndDate] = useState(false);
  const [proceed, setProceed] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isPresentlyEmployed, setIsPersonatlyEmployed] = useState(true);
  const [letter, setLetter] = useState(null);
  const [payslip, setPaySlip] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [addNew, setAddNew] = useState(false);
  const [record, setRecord] = useState(null);

  const [upLoading, setUpLoading] = useState(false);

  // Ref
  const PositionRef = React.createRef();
  let scrollRef = React.useRef();
  if (!scrollRef) {
    scrollRef = React.createRef();
  }

  const [keyboardShown, setKeyboardStatus] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      // fetch current user profile information from server
      getEmploymentDetails();
    } else {
      fetchEmploymentDetails();
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

  const fetchEmploymentDetails = async () => {
    console.log('**USER**', state?.user);
    const response = await fetchUserEmployment(
      state?.user?.id,
      state?.user?.accessToken,
    );
    console.log('Profile Info', response);
    if (response.status === 200) {
      setEmployment(response.data);
      setEmploymentTemp(response?.data);
      if (response.data.length > 0) {
        setAddNew(false);
        setReasonType(response?.data[0].reasonForLeavingCode);
      }
    }
  };

  const validations = () => {
    try {
      let response = true;
      if (employer == '' || employer == null) {
        seterrEmployer(true);
        response = false;
      }

      if (reasonType == '') {
        seterrReasonType(true);
        response = false;
      } else {
        if (reasonType == 'K') {
          if (reason == '' || reason == null) {
            seterrReason(true);
            response = false;
          }
        }
      }
      if (endDate == '' || endDate == null) {
        seterrEndDate(true);
        response = false;
      }
      if (endDate < startDate) {
        seterrEndDate(true);
        response = false;
      }
      console.log(payslip, 'payslip');
      if (payslip === null) {
        // seterrPaySlip(true);
      }
      return response;
    } catch (err) {
      console.log('Error in validations', err);
    }
  };

  const AddEmployment = async () => {
    try {
      setUpLoading(true);
      if (validations()) {
        // alert('no document');

        var payload = {
          employerName: employer,
          jobPosition: position,
          startDate: startDate,
          endDate: endDate,
          reasonForLeavingCode: reasonType,
          isPresentJob: isPresentlyEmployed,
          userProfile: {
            completedStepNumber:
              userMeta?.user.completedStepNumber > 4
                ? userMeta?.user.completedStepNumber
                : 4,
            id: state?.user?.id,
          },
        };

        if (errpayslip === true) {
          Alert.alert(
            'Warning',
            "If you don't provide required documents, your profile will be incompleted.",
            [
              {
                text: 'Cancel',
                onPress: () => setUpLoading(false),
                style: 'cancel',
              },
              {
                text: 'Proceed',
                onPress: async () => {
                  let response = await createEmployment(
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
                    var d = {
                      employerName: employer,
                      jobPosition: position,
                      reasonForLeavingCode: reasonType,
                      reason: reason,
                      isPresentJob: isPresentlyEmployed,
                      startDate: startDate,
                      endDate: endDate,
                    };
                    // var items = [...employmentTemp];
                    // items.push(d);
                    fetchEmploymentDetails();
                    setEmployer(null);
                    setPosition(null);
                    setReasonType('');
                    setReason(null);
                    setEmployment(items);
                    setShowEdit(false);
                    setAddNew(false);
                  } else {
                    setUpLoading(false);
                    BannerNotification.show(
                      '',
                      AlertMessages.FORM_SUBMISSION_FAILED,
                      'error',
                    );
                  }
                },
              },
            ],
          );
        } else {
          console.log('Payload for Employment', payload);

          let response = await createEmployment(
            payload,
            state?.user?.accessToken,
          );
          if (response.status === 200) {
            setUpLoading(false);
            var d = {
              employerName: employer,
              jobPosition: position,
              reasonForLeavingCode: reasonType,
              reason: reason,
              isPresentJob: isPresentlyEmployed,
              startDate: startDate,
              endDate: endDate,
            };
            // var items = [...employmentTemp];
            // items.push(d);
            fetchEmploymentDetails();
            setEmployer(null);
            setPosition(null);
            setReasonType('');
            setReason(null);
            // setEmployment(items);
            setShowEdit(false);
            setAddNew(false);
          } else {
            setUpLoading(false);
            BannerNotification.show(
              '',
              AlertMessages.FORM_SUBMISSION_FAILED,
              'error',
            );
          }
        }

        if (proceed) {
        }
      } else {
        setUpLoading(false);

        alert(AlertMessages.FILL_FIELD_VALIDATION);
      }
    } catch (err) {
      // alert('Unable to add Employment Information ' + err);
    }
  };

  const UpdateEmployment = async () => {
    try {
      setUpLoading(true);
      if (validations()) {
        if (showEdit) {
          var d = {};
          var d = {
            id: itemId,
            employerName: employer,
            jobPosition: position,
            reasonForLeavingCode: reasonType,
            reason: reason,
            isPresentJob: isPresentlyEmployed,
            startDate: startDate,
            endDate: endDate,
          };

          var items = employmentTemp.map(emp => {
            emp.id === d.id ? d : emp;
          });

          var payload = {
            id: itemId,
            employerName: employer,
            jobPosition: position,
            startDate: startDate,
            isPresentJob: isPresentlyEmployed,
            userProfile: {
              // completedStepNumber:
              //   userMeta?.user.completedStepNumber > 4
              //     ? userMeta?.user.completedStepNumber
              //     : 4,
              id: state?.user?.id,
            },
          };

          if (!isPresentlyEmployed) {
            payload.endDate = endDate;
            payload.reasonForLeavingCode = reasonType;
          }
          console.log('Payload for Employment', payload);

          if (errpayslip) {
            Alert.alert(
              'Warning',
              "If you don't provide required documents, your profile will be incompleted.",
              [
                {
                  text: 'Cancel',
                  onPress: () => setUpLoading(false),
                  style: 'cancel',
                },
                {
                  text: 'Proceed',
                  onPress: async () => {
                    let response = await updateEmployment(
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
                      var d = {
                        employerName: employer,
                        jobPosition: position,
                        reasonForLeavingCode: reasonType,
                        reason: reason,
                        isPresentJob: isPresentlyEmployed,
                        startDate: startDate,
                        endDate: endDate,
                      };
                      // var items = [...employmentTemp];
                      // items.push(d);
                      fetchEmploymentDetails();
                      setEmployer(null);
                      setPosition(null);
                      setReasonType('');
                      setReason(null);
                      // setEmployment(items);
                      setShowEdit(false);
                      setAddNew(false);
                    } else {
                      setUpLoading(false);
                      BannerNotification.show(
                        '',
                        AlertMessages.FORM_SUBMISSION_FAILED,
                        'error',
                      );
                    }
                  },
                },
              ],
            );
          } else {
            let response = await updateEmployment(
              payload,
              state?.user?.accessToken,
            );
            if (response.status === 200) {
              setUpLoading(false);
              var d = {
                employerName: employer,
                jobPosition: position,
                reasonForLeavingCode: reasonType,
                reason: reason,
                isPresentJob: isPresentlyEmployed,
                startDate: startDate,
                endDate: endDate,
              };
              fetchEmploymentDetails();
              // var items = [...employmentTemp];
              // items.push(d);
              setEmployer(null);
              setPosition(null);
              setReasonType('');
              setReason(null);
              setShowEdit(false);
              setAddNew(false);
            } else {
              setUpLoading(false);
              BannerNotification.show(
                '',
                AlertMessages.FORM_SUBMISSION_FAILED,
                'error',
              );
            }
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

  async function getEmploymentDetails() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'user-profile',
      '/employments',
    );
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      setEmployment(response?.data);
      setEmploymentTemp(response?.data);
      if (response.data.length > 0) {
        setAddNew(false);
      } else {
        setAddNew(true);
      }

      console.log(response?.data, 'Employment data');
    } else {
      alert(response.data.title);
    }
  }

  const editItem = item => {
    console.log(item.reasonForLeavingCode, 'reason type');
    setEmployer(item.employerName);
    setPosition(item.jobPosition);
    setReasonType(item.reasonForLeavingCode);
    setStartDate(item.startDate);
    console.log('Start Date', item.startDate);
    console.log('Start Date', new Date());
    setEndDate(item.endDate);

    // setPaySlip(item.payslip);
    // setAddNew(true);
    setItemId(item.id);
    setEmployment([]);
    setShowEdit(true);
  };

  const handleDismiss = async (type, image) => {
    const filename = getFileName(image?.path);
    const extension = getFileExtension(filename);
    const payload = {
      type: '',
      category: '',
      mimeType: image.mime ?? 'image/jpeg',
      name: '',
    };

    payload.category = DocumentCategory.EMPLOYMENT;
    if (type == 'letter') {
      payload.type = DocumentType.ROE;
      payload.name = DocumentName.employmentLetter + '.' + extension;
      setLetter('Uploading...');
    } else {
      payload.type = DocumentType.PAY_STUB;
      payload.name = DocumentName.paystub + '.' + extension;
      setPaySlip('Uploading...');
    }

    let binary = image?.data;

    const presignedUrl = await getPresignedUrl(
      payload,
      state?.user?.accessToken,
    );

    console.log('["presigned upload response"]', presignedUrl.status == 200);

    if (presignedUrl.status == 200) {
      const filePathUrl = getPathFromUrl(
        presignedUrl?.data?.url,
        'user_profile',
      );

      const path = await uploadDocumentOnPresignedUrl(
        presignedUrl.data?.url,
        binary,
      );
      if (path.status == 200) {
        if (type == 'letter') {
          setLetter(DocumentName.employmentLetter);
        } else {
          setPaySlip(DocumentName.paystub);
        }
      } else {
        if (type == 'letter') {
          setLetter(null);
        } else {
          setPaySlip(null);
        }
        alert(
          path?.data?.detail ?? 'Unable to upload document to presigned url.',
        );
      }
    } else {
      if (type == 'letter') {
        setLetter(null);
      } else {
        setPaySlip(null);
      }
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }
  };

  const handleSkip = async () => {
    const payload = {
      id: state?.user?.id,
      completedStepNumber: userMeta?.user.completedStepNumber > 4
      ? userMeta?.user.completedStepNumber
      : 4,
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
      console.log('[Employment Info updated]', payload);
      props.scrollToNext(4);
      props.jumpTo('bank');
    } else {
      console.log('**RESPONSE**', response);
      alert('Unable to skip this step, please try again.');
    }
  };

  async function deleteEmp(itemId) {
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
            type: 'employments',
          };
          console.log(params, 'del params');
          let response = await deleteCardItem(params, state?.user?.accessToken);
          if (response.status == 200) {
            fetchEmploymentDetails();
            ToastAndroid.show(
              'Record deleted successfully..',
              ToastAndroid.LONG,
            );
          } else {
            alert('err in deleted');
          }
        },
      },
    ]);
  }

  const updateReviewStatus = async () => {
    const payload = {isEmploymentAck: true};
    const response = await updateStepReviewStatus(
      {isAddressAck: true, id: userMeta?.user?.id},
      userMeta?.user?.accessToken,
      userMeta?.user?.id,
    );
    console.log('response', response);
    if (response.status === 200) {
      appDispatch(updateReviewedStep({step: 'isEmploymentAck', status: true}));
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
        contentContainerStyle={{paddingBottom: keyboardShown ? 40 : 0}}>
        {props.route && props.route.params.showHeader && <Header />}
        <View style={styles.container}>
          <View
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {props.route &&
              props.route.params &&
              props.route.params.showHeader && (
                <TouchableOpacity
                  onPress={() =>
                    !addNew
                      ? props.navigation.pop()
                      : (setEmployment(employmentTemp), setAddNew(false))
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
              Employment History
            </Text>
            {!isAdmin &&
              !addNew &&
              !showEdit &&
              employment.length === 0 &&
              props?.isProfileConfig && (
                <TouchableOpacity
                  onPress={handleSkip}
                  style={{flex: 0.2, paddingHorizontal: 10}}>
                  <Text
                    style={{color: green, fontSize: 16, fontWeight: 'bold'}}>
                    {'Skip >>'}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
          <FlatList
            data={employment}
            renderItem={(item, index) => {
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
                      {item.item.employerName ?? item.item.employer}
                    </Text>
                    <Text style={{fontSize: 12}}>
                      {item?.item?.endDate.toString() ?? ''}
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
                          ? deleteEmp(item?.item.id ?? item?.id)
                          : editItem(item?.item)
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
          {isAdmin && !addNew && !showEdit && employment?.length == 0 && (
            <EmptyContainer />
          )}
          {(showEdit == true || addNew == true) && (
            <View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Employer <Text style={styles.labelStrick}>*</Text>
                </Text>
                <InputField
                  editable={isAdmin ? false : true}
                  borderColor={erremployer ? 'red' : textFieldBorder}
                  placeholder={'Employer name'}
                  onChangeText={text => {
                    setEmployer(text);
                    seterrEmployer(false);
                  }}
                  returnKeyType={'next'}
                  onSubmitEditing={() => {
                    PositionRef.current.focus();
                    scrollDown(scrollRef, 1.2);
                  }}
                  blurOnSubmit={false}
                  value={employer}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Job Position</Text>
                <InputField
                  editable={isAdmin ? false : true}
                  borderColor={errposition ? 'red' : textFieldBorder}
                  ref={PositionRef}
                  placeholder={'Job Position'}
                  value={position}
                  onChangeText={text => {
                    setPosition(text);
                    seterrPosition(false);
                  }}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Start Date</Text>
                <DatePicker
                  init={startDate === null ? true : false}
                  editable={isAdmin ? false : true}
                  value={startDate}
                  // hasError={errstartDate}
                  borderColor={errstartDate ? 'red' : textFieldBorder}
                  onChange={date => {
                    setStartDate(date);
                    seterrStartDate(false);
                  }}
                />
              </View>

              <View style={styles.group}>
                <Text style={styles.label}>
                  End Date <Text style={styles.labelStrick}>*</Text>
                </Text>
                <DatePicker
                  init={endDate === null ? true : false}
                  editable={isAdmin ? false : true}
                  hasError={errendDate}
                  value={endDate}
                  borderColor={errendDate ? 'red' : textFieldBorder}
                  onChange={date => {
                    setEndDate(date);
                    seterrEndDate(false);
                  }}
                />
                {errendDate && (
                  <ErrorText
                    error={'End date should be greater than Started date'}
                  />
                )}
              </View>

              <View style={styles.group}>
                <Text style={styles.label}>
                  Reason for leaving <Text style={styles.labelStrick}>*</Text>
                </Text>
                <View
                  style={{
                    height: 50,
                    borderColor: errreasonType ? 'red' : textFieldBorder,
                    borderWidth: 1,
                    marginTop: 7,
                    paddingHorizontal: 8,
                    paddingVertical: 1,
                    borderRadius: 5,
                  }}>
                  <Picker
                    style={{width: '100%'}}
                    iosIcon={
                      <Icon name="chevron-down" color={'black'} size={20} />
                    }
                    enabled={isAdmin ? false : true}
                    mode="dropdown"
                    selectedValue={reasonType}
                    onValueChange={text => {
                      setReasonType(text);
                      seterrReasonType(false);
                    }}>
                    <Picker.Item label="Select a Reason..." value={''} />
                    <Picker.Item
                      label="A-Shortage of work (layoff)"
                      value={'A'}
                    />
                    <Picker.Item label="B-Strike or lockout" value={'B'} />
                    <Picker.Item label="C-Return to school" value={'C'} />
                    <Picker.Item label="D-Illness or injury" value={'D'} />
                    <Picker.Item label="E-Quit" value={'E'} />
                    <Picker.Item label="F-Maternity" value={'F'} />
                    <Picker.Item label="G-Retirement" value={'G'} />
                    <Picker.Item label="H-Work-Sharing" value={'H'} />
                    <Picker.Item label="J-Apprentice training" value={'J'} />
                    <Picker.Item label="M-Dismissal" value={'M'} />
                    <Picker.Item label="N-Leave of absence" value={'N'} />
                    <Picker.Item label="P-Parental" value={'P'} />
                    <Picker.Item
                      label="Z-Compassionate care/Family Caregiver"
                      value={'Z'}
                    />
                    <Picker.Item label="K-Other" value={'K'} />
                  </Picker>
                </View>
                {reasonType == 'K' && (
                  <TextInput
                    multiline={true}
                    placeholder={'Enter the Other reason for leaving'}
                    style={{
                      borderColor: errreason ? 'red' : textFieldBorder,
                      borderWidth: 1,
                      marginTop: 15,
                      paddingHorizontal: 15,
                      paddingVertical: 12,
                      borderRadius: 5,
                      height: 80,
                      textAlignVertical: 'top',
                    }}
                    onChangeText={text => {
                      setReason(text);
                    }}
                  />
                )}
              </View>
              <View style={{height: isAdmin ? 10 : 0}} />
            </View>
          )}
          {!isAdmin && (
            <View style={{marginTop: 20}}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                {(showEdit || addNew) && (
                  <AddButton
                    text={'Cancel'}
                    // text={showEdit == true && addNew ? 'Add New' : 'Save'}
                    style={{
                      width: Dimensions.get('screen').width / 2.3,
                      borderColor: 'red',
                    }}
                    textStyle={{color: 'red'}}
                    onPress={() => {
                      setEmployment(employmentTemp);
                      setShowEdit(false);
                      setAddNew(false);
                      seterrEmployer(false);
                      seterrEndDate(false);
                      seterrPaySlip(false);
                      seterrPosition(false);
                      seterrReason(false);
                      seterrReasonType(false);
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
                      AddEmployment();
                    } else if (showEdit) {
                      UpdateEmployment();
                    } else {
                      setAddNew(true);
                      setEmployment([]);
                      setEmployer(null);
                      setPosition(null);
                      setReasonType('');
                      setStartDate(null);
                      setEndDate(null);
                      setPaySlip(null);
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
            !userMeta?.reviewedSteps?.isEmploymentAck && (
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
                  onPress={() => {
                    props.scrollToNext(2);
                    props.jumpTo('education');
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

                    if (employment.length === 0) {
                      BannerNotification.show(
                        '',
                        AlertMessages.ATLEAST_ONE_RECORD,
                        'error',
                      );
                      return;
                    }

                    props.scrollToNext(4);
                    props.jumpTo('bank');
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
    // flex: 1,
    // backgroundColor: 'white',
    // justifyContent: 'center',
    // alignItems: 'center',
    // borderRadius: 5,
    // paddingVertical: 20,
    // paddingStart: 30,
    // paddingEnd: 10,
    // minHeight: 70,
    // borderColor: '#ededed',
    // borderWidth: 1,
    // marginBottom: 10,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // justifyContent: 'space-between',
    // flexDirection: 'row',
    // elevation: 5,
  },
  textArea: {
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    height: 80,
    textAlignVertical: 'top',
  },
  cardHeading: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkbox: {
    borderRadius: 5,
    marginLeft: -6,
    paddingLeft: -20,
    marginRight: 15,
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

export default EmploymentHistory;
