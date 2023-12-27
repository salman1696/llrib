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
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import InputField from '../../../components/InputField';
import {Picker} from 'native-base';
import AddButton from '../../../components/AddButton';
import {useState} from 'react';
import Card from '../../../components/Card';
import CheckBox from '@react-native-community/checkbox';
import UploadButton from '../../../components/UploadButton';
import Header from '../../../components/Header';
import {getDetailsAction} from '../../../servercalls/admin';
import {AppContext} from '../../../context/AppContext';
import {
  getPresignedUrl,
  uploadDocumentOnPresignedUrl,
  uploadFile,
} from '../../../servercalls/uploadFiles';
import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
} from '../../../utils/strings';
import {
  createBankAccount,
  deleteCardItem,
  fetchUserBankAccount,
  updateBankAccount,
} from '../../../servercalls/profile';
import {skipAStep} from '../../../servercalls/userApplication';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import {storeBankInfo, updateReviewedStep} from '../../../slices/userSlice';
import {useDispatch, useSelector} from 'react-redux';
import EmptyContainer from '../../../components/EmptyContainer';
import BannerNotification from '../../../components/BannerNotification';
import {updateStepReviewStatus} from '../../../servercalls/user';
import GlobalStyles from '../../../GlobalStyles';

const BankAccount = props => {
  const item = props.route?.params?.item;

  const [state, dispatch] = useContext(AppContext);

  const appDispatch = useDispatch();
  const userMeta = useSelector(state => state.userMeta);

  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [bankAccount, setBankAccount] = useState([]);
  const [bankAccountTemp, setBankAccountTemp] = useState([]);
  const [type, setType] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('1');
  const [bAccount, setBAccount] = useState('1');
  const [statement, setStatement] = useState(null);

  const [errbankAccount, seterrBankAccount] = useState(false);
  const [errstatement, seterrStatement] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [upLoading, setUpLoading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [addNew, setAddNew] = useState(false);

  let scrollRef = React.useRef();
  if (!scrollRef) {
    scrollRef = React.createRef();
  }

  const [keyboardShown, setKeyboardStatus] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      // fetch current user profile information from server
      getbankDetails();
    } else {
      fetchBankDetails();
    }

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

  const fetchBankDetails = async () => {
    const response = await fetchUserBankAccount(
      state?.user?.id,
      state?.user?.accessToken,
    );
    console.log('Bank Info', response);
    if (response.status == 200) {
      setBankAccount(response.data);
      setBankAccountTemp(response?.data);
      appDispatch(storeBankInfo(response?.data));

      if (response.data.length > 0) {
        setAddNew(false);
      }
    }
  };

  const validations = () => {
    try {
      let response = true;
      if (bankName == '' || bankName == null) {
        seterrBankAccount(true);
        response = false;
      }
      if (type == '' || type == null) {
        response = false;
      }
      return response;
    } catch (err) {
      console.log('Error in validations', err);
    }
  };

  const AddBankAccount = async () => {
    try {
      setUpLoading(true);
      if (validations()) {
        if (addNew) {
          var payload = {
            accountType: type,
            // bankCode: '001',
            bankName: bankName,
            // branchCode: '12345',
            // branchName: branch,
            // accountNumber: bAccount,
            userProfile: {
              completedStepNumber:
                userMeta?.user.completedStepNumber > 5
                  ? userMeta?.user.completedStepNumber
                  : 5,
              id: state?.user?.id,
            },
          };

          if (errstatement === true) {
            Alert.alert(
              'Warning',
              "If you don't provide required documents, your profile will be incompleted.",
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Proceed',
                  onPress: async () => {
                    let response = await createBankAccount(
                      payload,
                      state?.user?.accessToken,
                    );
                    if (response.status === 200) {
                      setUpLoading(false);
                      ToastAndroid.show(
                        'Data has been successfully saved...',
                        ToastAndroid.LONG,
                      );

                      fetchBankDetails();
                      setBankName('');
                      setType(null);
                      setBranch(null);
                      setBAccount(null);
                      setShowEdit(false);
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
            let response = await createBankAccount(
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

              fetchBankDetails();
              setBankName('');
              setType(null);
              setBranch(null);
              setBAccount(null);
              setShowEdit(false);
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

  const UpdateBankAccount = async () => {
    try {
      setUpLoading(true);

      if (validations()) {
        if (showEdit) {
          var d = {};
          var d = {
            id: itemId,
            accountType: type,
            bankName: bankName,
          };

          var items = bankAccountTemp.map(bnk => {
            bnk.id === d.id ? d : bnk;
          });
          var payload = {
            id: itemId,
            accountType: type,
            // bankCode: '001',
            bankName: bankName,
            // branchCode: '12345',
            // branchName: branch,
            // accountNumber: bAccount,
            userProfile: {
              // completedStepNumber:
              //   userMeta?.user.completedStepNumber > 5
              //     ? userMeta?.user.completedStepNumber
              //     : 5,
              id: state?.user?.id,
            },
          };

          console.log(payload, state?.user?.accessToken, 'UserTOken');

          if (errstatement === true) {
            Alert.alert(
              'Warning',
              "If you don't provide required documents, your profile will be incompleted.",
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Proceed',
                  onPress: async () => {
                    let response = await updateBankAccount(
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

                      fetchBankDetails();
                      setBankName('');
                      setType(null);
                      setBranch(null);
                      setBAccount(null);
                      setShowEdit(false);
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
            let response = await updateBankAccount(
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

              fetchBankDetails();
              setBankName('');
              setType(null);
              setBranch(null);
              setBAccount(null);
              setShowEdit(false);
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

  async function getbankDetails() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'user-profile',
      '/bank-accounts',
    );
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      // Store the complete data object for future use.
      // AsyncStorage.setItem('users', response.data);
      //   setProfile(response?.data);

      setBankAccount(response?.data);
      setBankAccountTemp(response?.data);
      setShowEdit(false);

      console.log(response?.data, 'Bank Accounts data');
    } else {
      alert(response.data.title);
    }
  }

  const editItem = item => {
    setItemId(item?.id);
    setType(item?.accountType);
    setBankName(item?.bankName);
    // setBranch(item.branchName);
    // setBAccount(item.branchCode);
    setShowEdit(true);
    setBankAccount([]);
  };

  const handleSkip = async () => {
    const payload = {
      id: state?.user?.id,
      completedStepNumber:
        userMeta?.user.completedStepNumber > 5
          ? userMeta?.user.completedStepNumber
          : 5,
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
      console.log('[Bank Info updated]', payload);
      props.scrollToNext(5);
      props.jumpTo('asset');
    } else {
      console.log('**RESPONSE**', response);
      alert('Unable to skip this step, please try again.');
    }
  };

  async function deleteBnk(itemId) {
    Alert.alert('Warning', 'Do you want to delete this record?', [
      {
        text: 'No',
        onPress: () => setUpLoading(false),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          let params = {
            itemId: itemId,
            userId: state?.user?.id,
            type: 'bank-accounts',
          };
          console.log(params, 'del params');
          let response = await deleteCardItem(params, state?.user?.accessToken);
          if (response.status == 200) {
            fetchBankDetails();
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
    const payload = {isBankingAck: true};
    const response = await updateStepReviewStatus(
      {isAddressAck: true, id: userMeta?.user?.id},
      userMeta?.user?.accessToken,
      userMeta?.user?.id,
    );
    console.log('response', response);
    if (response.status === 200) {
      appDispatch(updateReviewedStep({step: 'isBankingAck', status: true}));
      setTimeout(() => {
        props.navigation.pop();
      }, 100);
    }
  };

  return (
    <KeyboardAwareView style={{flex: 1}} behavior={'padding'}>
      <ScrollView
        ref={scrollRef}
        style={{backgroundColor: primaryBGColor}}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingBottom: keyboardShown ? 40 : 0}}>
        {props.route && props.route.params.showHeader && <Header />}
        <View style={styles.container}>
          <View
            style={{
              marginBottom: 10,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            {props.route &&
              props.route?.params &&
              props.route.params?.showHeader && (
                <TouchableOpacity
                  onPress={() =>
                    !showEdit
                      ? props.navigation.pop()
                      : (setBankAccount(bankAccountTemp), setShowEdit(false))
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
              Bank Account
            </Text>
            {!isAdmin &&
              !addNew &&
              !showEdit &&
              bankAccountTemp?.length === 0 &&
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
          {bankAccount.length !== 0 || bankAccountTemp.length !== 0 ? (
            <FlatList
              data={bankAccount}
              renderItem={(item, index) => {
                console.log('ITEM ', item);
                return (
                  <TouchableOpacity key={index} style={styles.card}>
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
                        {item.item.bankName}
                      </Text>
                      <Text style={{fontSize: 12}}>
                        {item.item.accountType}
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
                            ? deleteBnk(item?.item.id)
                            : editItem(item?.item ?? item)
                        }>
                        <Icon
                          name={!isAdmin ? 'close' : 'chevron-right'}
                          size={25}
                          color={!isAdmin ? 'red' : 'green'}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : null}
          {isAdmin && !addNew && !showEdit && bankAccountTemp?.length == 0 && (
            <EmptyContainer />
          )}
          {(showEdit || addNew) && (
            <View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Bank Name <Text style={styles.labelStrick}>*</Text>
                </Text>
                <View
                  style={{
                    height: 50,
                    borderColor: errbankAccount ? 'red' : textFieldBorder,
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
                    selectedValue={bankName}
                    onValueChange={text => {
                      console.log('Bank Name', text);
                      setBankName(text);
                      seterrBankAccount(false);
                    }}>
                    <Picker.Item label="Select a Bank" value={''} />
                    <Picker.Item
                      label="Affinity Credit Union"
                      value={'AFFINITY'}
                    />
                    <Picker.Item label="ATB Financial" value={'ATB'} />
                    <Picker.Item label="Bank of Montreal" value={'BMO'} />
                    <Picker.Item label="Bank of Nova Scotia" value={'SCOTIA'} />
                    <Picker.Item
                      label="Canadian Imperial Bank of Commerce"
                      value={'CIBC'}
                    />
                    <Picker.Item label="Caisse Alliance" value={'CAISSE'} />
                    <Picker.Item
                      label="CoastCapital Savings"
                      value={'COAST_CAPITAL'}
                    />
                    <Picker.Item
                      label="Conexus Credit Union"
                      value={'CONEXUS'}
                    />
                    <Picker.Item
                      label="Desjardins Group"
                      value={'DESJARDINS'}
                    />
                    <Picker.Item label="Giant Tiger" value={'GIANT_TIGER'} />
                    <Picker.Item label="HSBC Bank of Canada" value={'HSBC'} />
                    <Picker.Item
                      label="National Bank of Canada"
                      value={'NATIONAL_BANK'}
                    />
                    <Picker.Item label="Other" value={'OTHER'} />
                    <Picker.Item label="PC Financial" value={'PC'} />
                    <Picker.Item label="Royal Bank of Canada" value={'RBC'} />
                    <Picker.Item label="Servus Credit Union" value={'SERVUS'} />
                    <Picker.Item label="Simplii Financial" value={'SIMPLII'} />
                    <Picker.Item label="Tangerine" value={'TANGERINE'} />
                    <Picker.Item label="Toronto-Dominion Bank" value={'TD'} />
                    <Picker.Item label="Walmart Financial" value={'WALMART'} />
                    <Picker.Item label="We Financial" value={'WE'} />
                  </Picker>
                </View>
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Account Type <Text style={styles.labelStrick}>*</Text>
                </Text>
                <View
                  style={{
                    height: 50,
                    borderColor: errbankAccount ? 'red' : textFieldBorder,
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
                    selectedValue={type}
                    onValueChange={text => {
                      setType(text);
                    }}>
                    <Picker.Item label="Select a Account Type" value={''} />
                    <Picker.Item label="Chequing" value={'CHEQUING'} />
                    <Picker.Item label="Savings" value={'SAVINGS'} />
                  </Picker>
                </View>
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
                      //   alert('No previous record found..');
                      setBankAccount(bankAccountTemp);
                      setShowEdit(false);
                      setAddNew(false);
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
                      AddBankAccount();
                    } else if (showEdit) {
                      UpdateBankAccount();
                    } else {
                      setAddNew(true);
                      setBankAccount([]);
                      setType('');
                      setBankName('');
                      setBranch(null);
                      setBAccount(null);
                      setStatement(null);
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
            !userMeta?.reviewedSteps?.isBankingAck && (
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
                    props.scrollToNext(3);
                    props.jumpTo('employment');
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
                        'Please save current information.',
                        'error',
                      );
                      return;
                    }

                    if (bankAccount.length === 0) {
                      BannerNotification.show(
                        '',
                        'Please add atleast one record.',
                        'error',
                      );
                      return;
                    }

                    props.scrollToNext(5);
                    props.jumpTo('asset');
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

export default BankAccount;
