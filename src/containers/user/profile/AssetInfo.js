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
import Header from '../../../components/Header';
import {getDetailsAction} from '../../../servercalls/admin';
import {AppContext} from '../../../context/AppContext';
import {AlertMessages, assertType} from '../../../utils/strings';
import {
  createAssets,
  deleteCardItem,
  fetchUserAssets,
  updateAssets,
} from '../../../servercalls/profile';
import {skipAStep} from '../../../servercalls/userApplication';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import {useDispatch, useSelector} from 'react-redux';
import EmptyContainer from '../../../components/EmptyContainer';
import BannerNotification from '../../../components/BannerNotification';
import {updateStepReviewStatus} from '../../../servercalls/user';
import {updateReviewedStep} from '../../../slices/userSlice';
import GlobalStyles from '../../../GlobalStyles';
import StyleConfig from '../../../StyleConfig';

const AssetInfo = props => {
  const item = props.route?.params?.item;

  // redux
  const userMeta = useSelector(state => state.userMeta);
  const appDispatch = useDispatch();

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [assets, setAssets] = useState([]);
  const [assetsTemp, setAssetsTemp] = useState([]);
  const [model, setModel] = useState(null);
  const [type, setType] = useState('');
  const [manufacture, setManufacture] = useState(null);

  const [errmodel, seterrModel] = useState(false);
  const [errtype, seterrType] = useState(false);
  const [errmanufacture, seterrManufacture] = useState(false);
  const [erramount, seterrAmount] = useState(false);
  const [errreg, seterrReg] = useState(false);

  const [reg, setReg] = useState(2000);
  const [amount, setAmount] = useState(0);

  const [showEdit, setShowEdit] = useState(false);
  const [addNew, setAddNew] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [upLoading, setUpLoading] = useState(false);

  // Refs
  const manuRef = React.createRef();
  const regRef = React.createRef();
  const amountRef = React.createRef();
  let scrollRef = React.useRef();
  if (!scrollRef) {
    scrollRef = React.createRef();
  }

  const [keyboardShown, setKeyboardStatus] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      // fetch current user profile information from server
      getAssertsDetail();
    } else {
      fetchAssetDetails();
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

  const fetchAssetDetails = async () => {
    const response = await fetchUserAssets(
      state?.user?.id,
      state?.user?.accessToken,
    );
    if (response.status == 200) {
      setAssets(response.data);
      setAssetsTemp(response.data);
      if (response.data?.length > 0) {
        setAddNew(false);
      }
    }
  };

  async function getAssertsDetail() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'user-profile',
      '/assets',
    );
    if (response.status == 200) {
      setAssets(response?.data);
      setAssetsTemp(response?.data);
      setShowEdit(false);

      console.log(response?.data, 'Asserts Detail data');
    } else {
      alert(response.data.title);
    }
  }

  const editItem = item => {
    setManufacture(item.details);
    setModel(item.model);
    setReg(item.year);
    setType(item.assetType);
    setAmount(`${item.amount}`);
    setAssets([]);
    setItemId(item.id);
    setShowEdit(true);
  };

  const validations = () => {
    try {
      let response = true;
      if (type == '' || type == null) {
        seterrType(true);
        response = false;
      }
      if (type === 'VEHICLE') {
        if (manufacture == '' || manufacture == null) {
          seterrManufacture(true);
          response = false;
        }
        if (reg == '' || reg == null) {
          seterrReg(true);
          response = false;
        }
        if (amount == '' || amount == null) {
          seterrAmount(true);
          response = false;
        }
      } else {
        if (amount == '' || amount == null || amount <= 0) {
          seterrAmount(true);
          response = false;
        }
      }

      return response;
    } catch (err) {
      console.log('Error in validations', err);
    }
  };

  const AddAssets = async () => {
    try {
      setUpLoading(true);
      if (validations()) {
        if (amount <= 0) {
          BannerNotification.show(
            '',
            AlertMessages.AMOUNT_LESS_THEN_ONE,
            'error',
          );
          return;
        }
        var payload = {
          assetType: type,
          details: manufacture ?? ' ',
          year: reg ?? ' ',
          amount: amount,
          userProfile: {
            completedStepNumber:
              userMeta?.user.completedStepNumber > 6
                ? userMeta?.user.completedStepNumber
                : 6,
            id: state?.user?.id,
          },
        };
        console.log('[Assert Info updated]', payload);

        let response = await createAssets(payload, state?.user?.accessToken);
        if (response.status === 200) {
          setUpLoading(false);
          BannerNotification.show(
            '',
            AlertMessages.FORM_SUBMISSION_SUCCESS,
            'success',
          );
          var d = {
            type: type,
            model: model,
            manufacture: manufacture,
            registeration: reg,
          };
          fetchAssetDetails();
          setModel(null);
          setReg(null);
          setManufacture(null);
          setType('');
          setAmount(0);
          setAddNew(false);
        } else {
          setUpLoading(false);
          BannerNotification.show(
            '',
            AlertMessages.FORM_SUBMISSION_FAILED,
            'error',
          );
        }
        // }
      } else {
        setUpLoading(false);
        alert(AlertMessages.FILL_FIELD_VALIDATION);
      }
    } catch (err) {
      alert('Unable to add Assets Information ' + err);
    }
  };

  const UpdateAsserts = async () => {
    try {
      setUpLoading(true);
      if (validations()) {
        if (amount <= 0) {
          BannerNotification.show(
            '',
            AlertMessages.AMOUNT_LESS_THEN_ONE,
            'error',
          );
          setUpLoading(false);
          return;
        }
        if (showEdit) {
          var payload = {
            id: itemId,
            assetType: type,
            details: manufacture,
            year: reg,
            amount: amount,
            userProfile: {
              // completedStepNumber:
              //   userMeta?.user.completedStepNumber > 6
              //     ? userMeta?.user.completedStepNumber
              //     : 6,
              id: state?.user?.id,
            },
          };

          let response = await updateAssets(payload, state?.user?.accessToken);
          if (response.status === 200) {
            setUpLoading(false);

            BannerNotification.show(
              '',
              AlertMessages.FORM_UPDATED_SUCCESSFUL,
              'success',
            );

            fetchAssetDetails();
            setModel(null);
            setReg(null);
            setManufacture(null);
            setType('');
            setAmount(0);
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
      } else {
        setUpLoading(false);
        alert(AlertMessages.FILL_FIELD_VALIDATION);
      }
    } catch (err) {
      alert('Unable to add Education Information ' + err);
    }
  };

  const handleSkip = async () => {
    const payload = {
      id: state?.user?.id,
      completedStepNumber: userMeta?.user.completedStepNumber > 6
      ? userMeta?.user.completedStepNumber
      : 6,
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
      if(state?.profile?.maritalStatus === "SINGLE") {
        props.scrollToNext(6);
        props.jumpTo('documents');
      }
      else {
        props.scrollToNext(6);
        props.jumpTo('familyInfo');
      }
    
    } else {
      console.log('**RESPONSE**', response);
      alert('Unable to skip this step, please try again.');
    }
  };

  async function deleteAssert(itemId) {
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
            type: 'assets',
          };
          let response = await deleteCardItem(params, state?.user?.accessToken);
          if (response.status == 200) {
            fetchAssetDetails();
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

  const updateReviewStatus = async () => {
    const payload = {isAssetsAck: true};
    const response = await updateStepReviewStatus(
      {isAddressAck: true, id: userMeta?.user?.id},
      userMeta?.user?.accessToken,
      userMeta?.user?.id,
    );
    if (response.status === 200) {
      appDispatch(updateReviewedStep(payload));
      setTimeout(() => {
        props.navigation.pop();
      }, 100);
    }
  };

  return (
    <KeyboardAwareView animated={true} style={{flex: 1}} behavior={'padding'}>
      <ScrollView
        style={{backgroundColor: primaryBGColor}}
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingBottom: keyboardShown ? 60 : 0}}>
        {props.route && props.route.params.showHeader && <Header />}
        <View style={styles.container}>
          <View
            style={[
              GlobalStyles.flexDirectionRow,
              GlobalStyles.alignItemsCenter,
              {
                marginBottom: StyleConfig.dimensions.margin * 0.5,
              },
            ]}>
            {props.route && props.route.params.showHeader && (
              <TouchableOpacity
                onPress={() =>
                  !showEdit
                    ? props.navigation.pop()
                    : (setAssets(assetsTemp), setShowEdit(false))
                }
                style={GlobalStyles.justifyContentCenter}>
                <Icon name="arrow-left" size={25} color={green} />
              </TouchableOpacity>
            )}
            <Text
              style={[
                GlobalStyles.flexOne,
                {
                  marginLeft: StyleConfig.dimensions.margin * 0.25,
                  fontWeight: 'bold',
                  fontSize: StyleConfig.fontSize.heading,
                },
              ]}>
              Assets Information
            </Text>
            {!isAdmin &&
              !addNew &&
              !showEdit &&
              assetsTemp?.length === 0 &&
              props?.isProfileConfig && (
                <TouchableOpacity
                  onPress={handleSkip}
                  style={{
                    flex: 0.2,
                    paddingHorizontal: StyleConfig.dimensions.margin * 0.5,
                  }}>
                  <Text
                    style={{
                      color: StyleConfig.colors.green,
                      fontSize: StyleConfig.fontSize.medium,
                      fontWeight: 'bold',
                    }}>
                    {'Skip >>'}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
          {assets.length !== 0 || assetsTemp.length !== 0 ? (
            <FlatList
              data={assets}
              renderItem={(item, index) => {
                var asser = assertType.filter(
                  x => x.value == item.item.assetType,
                );

                return (
                  <TouchableOpacity key={index} style={styles.card}>
                    <TouchableOpacity
                      onPress={() => editItem(item?.item ?? item)}
                      style={{
                        flex: 0.85,
                      }}>
                      <Text style={styles.labelAsset}>{asser[0].label}</Text>
                      <Text style={{fontSize: StyleConfig.fontSize.small}}>
                        {`$ ${item.item.amount}`}
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
                            ? deleteAssert(item?.item.id)
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
          {isAdmin && addNew == false && assetsTemp?.length == 0 && (
            <EmptyContainer />
          )}
          {(showEdit || addNew) && (
            <View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  Asset Type <Text style={styles.labelStrick}>*</Text>
                </Text>
                <View
                  style={{
                    borderColor: errtype ? 'red' : textFieldBorder,
                    borderWidth: 1,
                    marginTop: 7,
                    paddingHorizontal: 8,
                    paddingVertical: 1,
                    borderRadius: 5,
                  }}>
                  <Picker
                    style={{height: 50, width: '100%'}}
                    enabled={isAdmin ? false : true}
                    mode="dropdown"
                    iosIcon={
                      <Icon name="chevron-down" color={'black'} size={20} />
                    }
                    selectedValue={type}
                    onValueChange={text => {
                      setType(text);
                      seterrType(false);
                    }}>
                    <Picker.Item label="Select a Asset Type" value={''} />
                    <Picker.Item label="Vehicle" value={'VEHICLE'} />
                    <Picker.Item label="House/Farm" value={'PROPERTY'} />
                    <Picker.Item label="Savings" value={'SAVINGS'} />
                    <Picker.Item label="Insurance" value={'INSURANCE'} />
                  </Picker>
                </View>
              </View>
              {type === 'VEHICLE' && (
                <View style={styles.group}>
                  <Text style={styles.label}>
                    Make <Text style={styles.labelStrick}>*</Text>
                  </Text>
                  <InputField
                    borderColor={errmanufacture ? 'red' : textFieldBorder}
                    ref={manuRef}
                    editable={isAdmin ? false : true}
                    placeholder={'Toyota'}
                    onChangeText={text => {
                      setManufacture(text);
                      seterrManufacture(false);
                    }}
                    value={manufacture}
                    returnKeyType={'next'}
                    onSubmitEditing={() => {
                      regRef.current.focus();
                    }}
                    blurOnSubmit={false}
                  />
                </View>
              )}
              {/* {type === 'VEHICLE' && (
              <View style={styles.group}>
                <Text style={styles.label}>
                  Car Model <Text style={styles.labelStrick}>*</Text>
                </Text>
                <InputField
                  borderColor={errmodel ? 'red' : textFieldBorder}
                  ref={carModelRef}
                  editable={isAdmin ? false : true}
                  placeholder={'Corolla'}
                  value={model}
                  onChangeText={text => {
                    setModel(text);
                    seterrModel(false);
                  }}
                  returnKeyType={'next'}
                  onSubmitEditing={() => {
                    regRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              </View>
            )} */}
              {type === 'VEHICLE' && (
                <View style={styles.group}>
                  <Text style={styles.label}>
                    Year <Text style={styles.labelStrick}>*</Text>
                  </Text>
                  <InputField
                    editable={isAdmin ? false : true}
                    borderColor={errreg ? 'red' : textFieldBorder}
                    ref={regRef}
                    value={`${reg}`}
                    placeholder={'2015'}
                    returnKeyType={'next'}
                    onChangeText={text => {
                      setReg(text);
                      seterrReg(false);
                    }}
                    onSubmitEditing={() => {
                      amountRef.current.focus();
                    }}
                    blurOnSubmit={false}
                  />
                </View>
              )}
              <View style={styles.group}>
                <Text style={styles.label}>
                  Amount ($)<Text style={styles.labelStrick}>*</Text>
                </Text>
                <InputField
                  borderColor={erramount ? 'red' : textFieldBorder}
                  editable={isAdmin ? false : true}
                  ref={amountRef}
                  value={amount}
                  placeholder={'Enter amount'}
                  onChangeText={text => {
                    setAmount(text.replace('$', ''));
                    seterrAmount(false);
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
                      setAssets(assetsTemp);
                      seterrModel(false);
                      seterrReg(false);
                      seterrManufacture(false);
                      seterrType(false);
                      setShowEdit(false);
                      setAddNew(false);
                    }}
                  />
                )}
                <AddButton
                  isLoading={upLoading}
                  text={showEdit ? 'Update' : addNew ? 'Save' : 'Add New'}
                  style={{
                    width:
                      showEdit || addNew
                        ? Dimensions.get('screen').width / 2.3
                        : Dimensions.get('screen').width - 40,
                  }}
                  onPress={() => {
                    if (addNew) {
                      AddAssets();
                    } else if (showEdit) {
                      UpdateAsserts();
                    } else {
                      setAddNew(true);
                      setAssets([]);
                      setModel(null);
                      setReg(2000);
                      setManufacture(null);
                      setType('');
                      setAmount(0);
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
            !userMeta?.reviewedSteps?.isAssetsAck && (
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
          {!isAdmin && props?.isProfileConfig && (
            <View style={{marginBottom: 30}}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={() => {
                    props.scrollToNext(4);
                    props.jumpTo('bank');
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

                    if (assets.length === 0) {
                      BannerNotification.show(
                        '',
                        'Please add atleast one record.',
                        'error',
                      );
                      return;
                    }
                    if(state?.profile?.maritalStatus === "SINGLE") {
                      props.scrollToNext(6);
                      props.jumpTo('documents');
                    }
                    else {
                      props.scrollToNext(6);
                      props.jumpTo('familyInfo');
                    }

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
  //   borderRadius: StyleConfig.dimensions.borderRadius * 8,
  //   flexDirection: 'row',
  //   height: 60,
  // },
  group: {
    marginTop: StyleConfig.dimensions.margin * 1.25,
  },
  label: {
    fontSize: StyleConfig.fontSize.medium,
    fontWeight: 'bold',
    marginBottom: StyleConfig.dimensions.margin * 0.25,
  },
  labelStrick: {
    fontSize: StyleConfig.fontSize.medium,
    color: StyleConfig.colors.red,
    fontWeight: '100',
  },
  dropdown: {
    borderColor: StyleConfig.colors.textFieldBorder,
    borderWidth: StyleConfig.dimensions.borderWidth,
    marginTop: StyleConfig.dimensions.margin * 0.35,
    paddingHorizontal: StyleConfig.dimensions.margin * 0.4,
    paddingVertical: StyleConfig.dimensions.margin * 0.05,
    borderRadius: StyleConfig.dimensions.borderRadius,
  },
  labelAsset: {
    fontWeight: 'bold',
    fontSize: StyleConfig.fontSize.large,
    marginBottom: StyleConfig.dimensions.margin * 0.2,
  },
});

export default AssetInfo;
