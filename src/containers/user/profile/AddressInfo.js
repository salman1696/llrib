import React, {useContext, useEffect, useRef, createRef} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Keyboard,
} from 'react-native';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import InputField from '../../../components/InputField';
import {useState} from 'react';
import {Switch} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../../components/Header';
import {AlertMessages} from '../../../utils/strings';
import {
  createAddress,
  fetchUserAddress,
  updateAddress,
} from '../../../servercalls/profile';
import {AppContext} from '../../../context/AppContext';
import {getDetailsAction} from '../../../servercalls/admin';
import {isPostalCodeValid, normalizePostCode} from '../../../helpers/Utils';
import AddButton from '../../../components/AddButton';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import GlobalStyles from '../../../GlobalStyles';
import StyleConfig from '../../../StyleConfig';
import {useDispatch, useSelector} from 'react-redux';
import BannerNotification from '../../../components/BannerNotification';
import {updateStepReviewStatus} from '../../../servercalls/user';
import {updateReviewedStep} from '../../../slices/userSlice';

const getFormattedPostCode = postCode => {
  if (postCode) {
    let newPostCode = normalizePostCode(postCode);
    return (
      newPostCode.substring(0, 3)?.toUpperCase() +
      ' ' +
      newPostCode.substring(3, newPostCode.length)?.toUpperCase()
    );
  }
};

function AddressInfo(props) {
  const item = props.route?.params?.item;

  const userMeta = useSelector(state => state.userMeta);
  const appDispatch = useDispatch();

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [houseNo, setHouseNo] = useState(null);
  const [address, setAddress] = useState(null);
  const [street, setStreet] = useState(null);
  const [box, setBox] = useState(null);
  const [city, setCity] = useState(null);
  const [postCode, setPostCode] = useState(null);
  const [isOnReserved, setIsOnReserved] = useState(false);

  const [houseError, setHouseError] = useState(false);
  const [streetError, setStreetError] = useState(false);
  const [boxError, setBoxError] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [postCodeError, setPostCodeError] = useState(false);
  const [upLoading, setUpLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [addressId, setAddressId] = useState(null);

  // Refs
  const houseRef = React.createRef();
  const addressRef = React.createRef();
  const streetRef = React.createRef();
  const boxRef = React.createRef();
  const cityRef = React.createRef();
  const PostalRef = React.createRef();
  let scrollRef = React.useRef();
  if (!scrollRef) {
    scrollRef = createRef();
  }

  const [keyboardShown, setKeyboardStatus] = useState(false);

  useEffect(() => {
    if (state?.user?.role == 'ROLE_ADMIN') {
      // fetch current user profile information from server
      getAddresses();
    } else {
      mFetchUserAddress();
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
  }, []);

  const mFetchUserAddress = async () => {
    const response = await fetchUserAddress(
      state?.user?.id,
      state?.user?.accessToken,
    );
    if (response.status == 200) {
      setHouseNo(response?.data[0].house);
      setAddress(response?.data[0].addressLine);
      setStreet(response?.data[0].street);
      setBox(response?.data[0].box);
      setCity(response?.data[0].city);
      setPostCode(
        response?.data[0].postalCode
          ? normalizePostCode(response?.data[0].postalCode)
          : '',
      );
      setAddressId(response?.data[0].id);
      setSubmitted(true);
    }
  };

  function validations() {
    let response = true;
    try {
      if (houseNo == '' || houseNo == null) {
        setHouseError(true);
        response = false;
      }
      if (street == '' || street == null) {
        setStreetError(true);
        response = false;
      }
      if (city == '' || city == null) {
        setCityError(true);
        response = false;
      }
      if (postCode.length !== 6 || postCode == null) {
        setPostCodeError(true);
        response = false;
      }
    } catch (err) {
      response = false;
      console.log('Error in validations', err);
    }
    return response;
  }

  const handleSubmit = async () => {
    try {
      setUpLoading(true);
      if (validations()) {
        if (postCode?.length < 5) {
          setPostCodeError(true);
          BannerNotification.show('', AlertMessages.INVALDE_POSTCODE, 'error');
          setUpLoading(false);
          return;
        }
        const payload = {
          isOnReserved: isOnReserved,
          box: box,
          city: city,
          // community: community,
          house: houseNo,
          postalCode: getFormattedPostCode(postCode),
          id: null,
          street: street,
          userProfile: {
            completedStepNumber: 2,
            id: state.user?.id,
          },
        };

        // Incase of Updating the address.
        if (addressId) {
          // Update
          payload.id = addressId;
          // payload.userProfile.completedStepNumber =
          //   userMeta?.user?.completedStepNumber;
        } else {
          // Add Record
          payload.userProfile.completedStepNumber = 2;
        }
        // Check if the address variable is not empty, implying that we need to execute update method.
        let response =
          addressId !== null
            ? await updateAddress(addressId, payload, state?.user?.accessToken)
            : await createAddress(payload, state?.user?.accessToken);
        if (response.status === 200) {
          setUpLoading(false);
          setSubmitted(true);
          setPostCodeError(false);
          BannerNotification.show(
            '',
            'Address information updated.',
            'success',
          );
        } else {
          console.log('Error in handle submit', response.data);
          const error =
            response.data?.fieldErrors[0].field +
            ' ' +
            response.data?.fieldErrors[0].message;
          BannerNotification.show('', error, 'error');
        }
        setUpLoading(false);
      } else {
        // show error
        setUpLoading(false);
        alert(AlertMessages.FILL_FIELD_VALIDATION);
      }
    } catch (err) {
      console.log('Error in handle submit', err);
      setUpLoading(false);
    }
  };

  async function getAddresses() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'user-profile',
      '/addresses',
    );
    if (response.status == 200) {
      setHouseNo(response?.data[0].house);
      setAddress(response?.data[0].addressLine);
      setStreet(response?.data[0].street);
      setBox(response?.data[0].box);
      setCity(response?.data[0].city);
      setPostCode(response?.data[0].postalCode ?? '');
    } else {
      alert(response.data.title);
    }
  }

  const updateReviewStatus = async () => {
    const response = await updateStepReviewStatus(
      {isAddressAck: true, id: userMeta?.user?.id},
      userMeta?.user?.accessToken,
      userMeta?.user?.id,
    );
    if (response.status === 200) {
      appDispatch(updateReviewedStep({step: 'isAddressAck', status: true}));
      setTimeout(() => {
        props.navigation.pop();
      }, 100);
    }
  };

  return (
    <KeyboardAwareView animated={true} style={{flex: 1}} behavior={'padding'}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingBottom: keyboardShown ? 40 : 0}}>
        {props.route && props.route.params.showHeader && <Header />}
        <View style={styles.container}>
          <View style={{flexDirection: 'row', marginBottom: 10}}>
            {props.route &&
              props.route.params &&
              props.route.params.showHeader && (
                <TouchableOpacity
                  onPress={() => props.navigation.pop()}
                  style={{justifyContent: 'center'}}>
                  <Icon name="arrow-left" size={25} color={green} />
                </TouchableOpacity>
              )}
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                fontSize: 20,
              }}>
              Address
            </Text>
          </View>
          <View style={{paddingBottom: 40}}>
            <View
              style={[
                GlobalStyles.flexDirectionRow,
                GlobalStyles.alignItemsCenter,
                {marginTop: StyleConfig.dimensions.margin * 0.5},
              ]}>
              <Text
                style={[
                  GlobalStyles.flexOne,
                  {
                    fontSize: StyleConfig.fontSize.medium,
                    fontWeight: 'bold',
                  },
                ]}>
                On Reserve
              </Text>
              <Switch
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setIsOnReserved(!isOnReserved)}
                value={isOnReserved}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                House # <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                editable={isAdmin ? false : true}
                borderColor={houseError ? 'red' : textFieldBorder}
                placeholder={'Enter your house #'}
                onChangeText={text => {
                  if (text != '' && text != null) {
                    setHouseError(false);
                  }
                  setHouseNo(text);
                }}
                returnKeyType={'next'}
                value={houseNo}
                onSubmitEditing={() => {
                  streetRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Street <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                editable={isAdmin ? false : true}
                borderColor={streetError ? 'red' : textFieldBorder}
                ref={streetRef}
                placeholder={'Enter street line'}
                onChangeText={text => {
                  if (text != '' && text != null) {
                    setStreetError(false);
                  }
                  setStreet(text);
                }}
                value={street}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  boxRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Box</Text>
              <InputField
                editable={isAdmin ? false : true}
                borderColor={boxError ? 'red' : textFieldBorder}
                ref={boxRef}
                placeholder={'Enter the P.O Box'}
                onChangeText={text => {
                  if (text != '' && text != null) {
                    setBoxError(false);
                  }
                  setBox(text);
                }}
                value={box}
                maxLength={10}
                keyboardType={'number-pad'}
                returnKeyType={'done'}
                onSubmitEditing={() => {
                  cityRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                City/Town <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                editable={isAdmin ? false : true}
                borderColor={cityError ? 'red' : textFieldBorder}
                ref={cityRef}
                placeholder={'Enter City/Town'}
                onChangeText={text => {
                  if (text != '' && text != null) {
                    setCityError(false);
                  }
                  setCity(text);
                }}
                value={city}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  PostalRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Postal Code <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                maxLength={6}
                editable={isAdmin ? false : true}
                borderColor={postCodeError ? 'red' : textFieldBorder}
                ref={PostalRef}
                placeholder={'Enter Postal code e.g A1A 1A1'}
                onChangeText={text => {
                  if (text !== '' && text != null) {
                    setPostCodeError(false);
                  }
                  setPostCode(text);
                }}
                value={postCode}
                onBlur={() => {
                  if (postCode) {
                    setPostCode(postCode?.toUpperCase());
                  }
                }}
              />
            </View>

            <AddButton
              text={address !== null ? 'Update' : 'Save'}
              style={{
                width: Dimensions.get('screen').width - 40,
                marginTop: 25,
              }}
              isLoading={upLoading}
              onPress={handleSubmit}
            />
            {!isAdmin &&
              props.route?.params?.isReviewRequired &&
              !userMeta?.reviewedSteps?.isAddressAck && (
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
              <>
                <View
                  style={{
                    height: 1,
                    marginVertical: 25,
                    width: '100%',
                    backgroundColor: 'lightgray',
                  }}
                />

                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    style={{
                      width: Dimensions.get('screen').width / 2.3,
                      marginRight: 12,
                      borderRadius: 50,
                    }}
                    onPress={() => {
                      props.scrollToNext(0);
                      props.jumpTo('personal');
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
                      if (submitted) {
                        props.scrollToNext(2);
                        props.jumpTo('education');
                      } else {
                        BannerNotification.show(
                          '',
                          'Please update information before proceeding.',
                          'error',
                        );
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
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAwareView>
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
  labelStrick: {
    fontSize: 16,
    color: 'red',
    fontWeight: '100',
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
  // linearGradient: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderRadius: 40,
  //   flexDirection: 'row',
  //   height: 60,
  //   // width: '100%',
  // },
});

export default AddressInfo;
