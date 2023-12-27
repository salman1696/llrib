import React, {useContext, useEffect, useRef} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Keyboard,
  Pressable,
  Modal,
} from 'react-native';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Switch, TouchableOpacity} from 'react-native-gesture-handler';
import InputField from '../../../components/InputField';
import {useState} from 'react';
import ContactField from '../../../components/ContactField';
import {Picker} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from '../../../components/CustomDatePicker';
import PasswordField from '../../../components/PasswordField';
import PasswordVerificationModal from '../../../components/PasswordVerificationModal';
import SensitiveInfoField from '../../../components/SensitiveInfoField';
import Header from '../../../components/Header';

// Server calls
import {
  fetchUserProfile,
  updateProfile,
  showSensitiveInfo,
} from '../../../servercalls/profile';
import {AppContext} from '../../../context/AppContext';
import {getDetailsAction} from '../../../servercalls/admin';
import {
  getFileExtension,
  getFileName,
  getPathFromUrl,
  isEmailValid,
  isValidName,
} from '../../../helpers/Utils';

import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
  setUserProfile,
} from '../../../utils/strings';
import {
  fetchS3Image,
  presignedUrl,
  uploadDocumentOnPresignedUrl,
} from '../../../servercalls/uploadFiles';
import AddButton from '../../../components/AddButton';
import {
  getPresignedUrl,
  getPresignedUrlToGetDocuments,
} from '../../../servercalls/fetchFiles';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import {storeUserProfile, updateReviewedStep} from '../../../slices/userSlice';
import BannerNotification from '../../../components/BannerNotification';
import {useDispatch, useSelector} from 'react-redux';
import {updateStepReviewStatus} from '../../../servercalls/user';
import GlobalStyles from '../../../GlobalStyles';
import StyleConfig from '../../../StyleConfig';

function PersonalInfo(props) {
  // redux slice
  const userMeta = useSelector(state => state.userMeta);
  const appDispatch = useDispatch();

  // Context
  const item = props.route?.params?.item;

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;
  let img = '';
  if (!isAdmin) {
    img = props.route?.params?.img;
  }
  const [profile, setProfile] = useState('');

  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phone, setPhone] = useState(null);
  const [martial, setMartial] = useState(null);
  const [profileImg, setProfileImg] = useState(img ?? null);
  const [dob, setDOB] = useState(null);
  const [treatyNumber, setTreatyNumber] = useState(null);
  const [IsTreaty, setTreaty] = useState(false);
  const [showTreatyNumber, setShowTreatyNumber] = useState(false);
  const [treatyNumberVerify, setTreatyNumberVerify] = useState(false);
  const [insuranceNumber, setInsuranceNumber] = useState(null);
  const [showInsuranceNumber, setShowInsuranceNumber] = useState(false);
  const [insuranceNumberVerify, setInsuranceNumberVerify] = useState(false);
  const [skipInsuranceNumberVerify, setSkipInsuranceNumberVerify] =
    useState(false);
  const [skipHealthCardVerify, setSkipHealthCardVerify] = useState(false);
  const [healthCard, setHealthCard] = useState(null);
  const [showHealthCardNumber, setShowHealthCardNumber] = useState(false);
  const [cardNumberVerify, setCardNumberVerify] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [upLoading, setUpLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordVerificationLoading, setPasswordVerificationLoading] =
    useState(false);
  const [passwordVerificationError, setPasswordVerificationError] =
    useState(null);

  const [em_fullname, setEmFullName] = useState(null);
  const [em_email, setEmEmail] = useState(null);
  const [em_phoneCode, setEmPhoneCode] = useState(null);
  const [em_phone, setEmPhone] = useState(null);

  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [emailError, setemailError] = useState(false);
  const [phoneError, setphoneError] = useState(false);
  const [martialError, setMartialError] = useState(false);
  const [dobError, setDobError] = useState(false);
  const [treatyError, setTreatyError] = useState(false);
  const [insuranceNumberError, setInsuranceNumberError] = useState(false);
  const [healthCardError, setHealthCardError] = useState(false);
  const [em_fullnameError, setEmFullNameError] = useState(false);
  const [em_emailError, setEmEmailError] = useState(false);
  const [em_phoneError, setEmphoneError] = useState(false);

  const firstnameRef = React.createRef();
  const lastnameRef = React.createRef();
  const emailRef = React.createRef();
  const contactRef = React.createRef();
  const treatRef = React.createRef();
  const socialRef = React.createRef();
  const healthRef = React.createRef();
  const statusRef = React.useRef();
  const scrollRef = React.useRef();
  const fbRef = React.useRef();

  const showInputField = useRef('');
  const treatyNumberRef = useRef('');
  const insuranceNumberRef = useRef('');
  const healthCardNumberRef = useRef('');

  const emgFullNameRef = React.createRef();
  const emgEmailRef = React.createRef();
  const emgContactRef = React.createRef();

  const [keyboardShown, setKeyboardStatus] = useState(false);

  useEffect(() => {
    // fetch current user profile information from server
    if (!isAdmin) {
      fetchUserInfo();
      getDocument(state?.user?.imageUrl);
    } else {
      getProfile();
      getDocument(item.imageUrl);
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

  function openGallery() {
    ImagePicker.openPicker({
      width: 400,
      height: 300,
      cropping: true,
      includeBase64: true,
    }).then(image => {
      console.log(image);
      setShowModal(false);
      setProfileImg(image.path);
      uploadImage(image);
    });
  }

  function openCamera() {
    ImagePicker.openCamera({
      width: 400,
      height: 300,
      cropping: true,
      includeBase64: true,
    }).then(image => {
      setShowModal(false);
      setProfileImg(image.path);
      uploadImage(image);
    });
  }

  const uploadImage = async image => {
    const filename = getFileName(image?.path);
    const extension = getFileExtension(filename);
    const payload = {
      type: DocumentType.PROFILE_PICTURE,
      category: DocumentCategory.PROFILE,
      mimeType: image.mime ?? 'image/jpeg',
      name: DocumentName.profileImage + '.' + extension,
    };

    console.log(image, '----Image binary---- ');
    const presignedUrl = await getPresignedUrl(
      payload,
      state?.user?.accessToken,
    );

    if (presignedUrl.status == 200) {
      const filePathUrl = getPathFromUrl(
        presignedUrl?.data?.url,
        'user_profile',
      );

      const path = await uploadDocumentOnPresignedUrl(
        presignedUrl.data?.url,
        image?.path,
      );
      if (path.status == 200) {
        uploadImageToServer(payload, image.path, presignedUrl.data?.url);
      } else {
        alert(
          path?.data?.detail ?? 'Unable to upload document to presigned url.',
        );
      }
    } else {
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }
  };
  const uploadImageToServer = async (image, path, url = null) => {
    const payload = {
      id: state?.user?.id,
      profilePicture: {
        name: image.name,
        category: image.category,
        type: image.type,
      },
    };
    const response = await updateProfile(
      state?.user?.id,
      payload,
      state?.user?.accessToken,
    );
    if (response.status === 200) {
      console.log('Image uploaded successfully');
      BannerNotification.show(
        '',
        'Profile image uploaded successfully.',
        'success',
      );
    } else {
      BannerNotification.show('', 'Failed to upload profile image.', 'error');
      console.log('Unable to upload image', response.data);
    }
  };
  const getDocument = async path => {
    console.log(state?.user, 'userr======.>');

    let response = await getPresignedUrlToGetDocuments(
      {
        file: path,
      },
      state.user?.accessToken,
    );
    if (response.status === 200) {
      console.log(response, 'url fetched');
      setProfileImg(response.data.url);
    } else {
      console.log(response, 'url fetched err');
    }
  };
  const fetchUserInfo = async () => {
    const response = await fetchUserProfile(
      state?.user?.id,
      state?.user?.accessToken,
    );
    console.log('Profile Info', response);
    if (response.status == 200) {
      setFirstName(response.data?.firstName);
      setLastName(response.data?.lastName);
      setEmail(response.data?.email);
      setMartial(response.data?.maritalStatus);
      setDOB(response.data?.dateOfBirth ?? null);
      setTreaty(response.data?.treatyNumber ? true : false);
      setInsuranceNumber(response.data?.socialInsuranceNumber);
      setPhone(response.data?.phone);
      setHealthCard(response.data?.healthCardNumber);
      setEmEmail(response.data?.emergencyContactEmail);
      setEmFullName(response.data?.emergencyContactName);
      setEmPhone(response.data?.emergencyContactPhone);
      if (!response.data?.socialInsuranceNumber) {
        setInsuranceNumberVerify(true);
        setSkipInsuranceNumberVerify(true);
      }
      if (!response?.data?.treatyNumber) {
        setSkipHealthCardVerify(true);
      }
    }
  };

  function validations() {
    let response = true;
    try {
      if (firstname == '' || firstname == null || !isValidName(firstname)) {
        setFirstNameError(true);
        response = false;
      }
      if (lastname == '' || lastname == null || !isValidName(lastname)) {
        setLastNameError(true);
        response = false;
      }
      if (email == '' || email == null || !isEmailValid(email)) {
        setemailError(true);
        response = false;
      }
      if (phone == '' || phone == null) {
        setphoneError(true);
        response = false;
      }
      if (martial == '' || martial == null) {
        setMartialError(true);
        response = false;
      }
      if (dob == '' || dob == null) {
        setDobError(true);
        response = false;
      }
      if (
        treatyNumber == '' ||
        treatyNumber == null ||
        treatyNumber.length !== 10
      ) {
        setTreatyError(true);
        response = false;
      }
      if (
        insuranceNumber == '' ||
        insuranceNumber == null ||
        insuranceNumber.length !== 9
      ) {
        setInsuranceNumberError(true);
        response = false;
      }
      if (healthCard == '' || healthCard == null || healthCard.length !== 9) {
        setHealthCardError(true);
        response = false;
      }
      if (
        em_fullname == '' ||
        em_fullname == null ||
        !isValidName(em_fullname)
      ) {
        setEmFullNameError(true);
        response = false;
      }
      if (em_email !== null && !isEmailValid(em_email)) {
        setEmEmailError(true);
        response = false;
      }
      if (em_phone == '' || em_phone == null || em_phone.length !== 10) {
        setEmphoneError(true);
        response = false;
      }
    } catch (err) {
      response = false;
      console.log('Error in validations', err);
    }
    return response;
  }
  const closePasswordVerifyModal = () => {
    setPasswordVerificationError(null);
    setShowPasswordModal(false);
    showInputField.current = '';
  };

  const showPasswordVerifyModal = () => {
    setShowPasswordModal(!showPasswordModal);
  };

  const onShowingTreatyNumber = value => {
    if (treatyNumberVerify) {
      if (showTreatyNumber) {
        treatyNumberRef.current = treatyNumber;
        const newTreatyNumber = treatyNumber
          ?.slice(-3)
          ?.padStart(treatyNumber?.length, '*');
        setTreatyNumber(newTreatyNumber);
      } else {
        setTreatyNumber(treatyNumberRef.current);
        treatyNumberRef.current = '';
      }
      setShowTreatyNumber(!showTreatyNumber);
    } else {
      showInputField.current = value;
      showPasswordVerifyModal();
    }
  };

  const onShowingInsuranceNumber = value => {
    if (insuranceNumberVerify) {
      if (showInsuranceNumber) {
        insuranceNumberRef.current = insuranceNumber;
        const newInsuranceNumber = insuranceNumber
          ?.slice(-3)
          ?.padStart(insuranceNumber?.length, '*');
        setInsuranceNumber(newInsuranceNumber);
      } else {
        setInsuranceNumber(insuranceNumberRef.current);
        insuranceNumberRef.current = '';
      }
      setShowInsuranceNumber(!showInsuranceNumber);
    } else {
      showInputField.current = value;
      showPasswordVerifyModal();
    }
  };

  const onShowingHealthCardNumber = value => {
    if (cardNumberVerify) {
      if (showHealthCardNumber) {
        healthCardNumberRef.current = healthCard;
        const newHealthCard = healthCard
          ?.slice(-3)
          ?.padStart(healthCard?.length, '*');
        setHealthCard(newHealthCard);
      } else {
        setHealthCard(healthCardNumberRef.current);
        healthCardNumberRef.current = '';
      }
      showHealthCardNumber(!showHealthCardNumber);
    } else {
      showInputField.current = value;
      showPasswordVerifyModal();
    }
  };

  const onPasswordVerify = async password => {
    setPasswordVerificationLoading(true);
    try {
      const payload = {
        userId: state?.user?.id,
        fieldName: showInputField.current,
        password: password,
      };
      const resData = await showSensitiveInfo(
        payload,
        state?.user?.accessToken,
      );

      setPasswordVerificationLoading(false);
      if (showInputField.current === 'treaty-number') {
        setTreatyNumber(resData?.toString());
        setShowTreatyNumber(!showTreatyNumber);
        setTreatyNumberVerify(true);
      }
      if (showInputField.current === 'social-insurance-number') {
        setInsuranceNumber(resData?.toString());
        setShowInsuranceNumber(!showInsuranceNumber);
        setInsuranceNumberVerify(true);
      }
      if (showInputField.current === 'health-card-number') {
        setHealthCard(resData?.toString());
        setShowHealthCardNumber(!showHealthCardNumber);
        setCardNumberVerify(true);
      }
      setPasswordVerificationError(null);
      return closePasswordVerifyModal();
    } catch (error) {
      setPasswordVerificationError(error);
      console.log('Error in password validation');
    }
  };
  const handleSubmit = async () => {
    try {
      let isFormValid = validations();
      console.log('Response from validation', isFormValid);
      setUpLoading(true);
      if (isFormValid) {
        const payload = getPayload();
        let newUserData = payload;
        if (payload?.completedStepNumber >= 1) {
          delete newUserData.completedStepNumber;
        }
        if (treatyNumberRef.current) {
          newUserData = {
            ...newUserData,
            treatyNumber: treatyNumberRef.current,
          };
        }
        if (insuranceNumberRef.current) {
          newUserData = {
            ...newUserData,
            socialInsuranceNumber: insuranceNumberRef.current,
          };
        }
        if (healthCardNumberRef.current) {
          newUserData = {
            ...newUserData,
            healthCardNumber: healthCardNumberRef.current,
          };
        }
        if (newUserData?.treatyNumber?.includes('*')) {
          delete newUserData?.treatyNumber;
        }
        if (newUserData?.socialInsuranceNumber?.includes('*')) {
          delete newUserData?.socialInsuranceNumber;
        }
        if (newUserData?.healthCardNumber?.includes('*')) {
          delete newUserData?.healthCardNumber;
        }
        console.log(
          '=========================Update-Profile====================',
          newUserData,
        );
        let response = await updateProfile(
          state?.user?.id,
          newUserData,
          state?.user?.accessToken,
        );
        if (response.status === 200) {
          BannerNotification.show(
            '',
            AlertMessages.FORM_UPDATED_SUCCESSFUL,
            'success',
          );
          dispatch({
            type: setUserProfile,
            payload: newUserData,
          });
          dispatch(storeUserProfile(newUserData));
        } else {
          alert(response.data.detail);
        }
        setUpLoading(false);
      } else {
        BannerNotification.show(
          '',
          AlertMessages.FILL_FIELD_VALIDATION,
          'error',
        );
        setUpLoading(false);
      }
    } catch (err) {
      console.log('Error in handle submit', err);
    }
  };

  const getPayload = () => {
    const payload = {
      id: state?.user?.id,
      completedStepNumber: 1,
      dateOfBirth: dob,
      firstName: firstname,
      lastName: lastname,
      email: email,
      phone: phone,
      maritalStatus: martial,
      socialInsuranceNumber: insuranceNumber,
      treatyNumber: treatyNumber,
      healthCardNumber: healthCard,
      emergencyContactName: em_fullname,
      emergencyContactPhone: em_phone,
      emergencyContactEmail: em_email,
    };
    return payload;
  };

  async function getProfile() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'user-profile',
      '',
    );
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      // Store profile redux slice.
      dispatch(storeUserProfile(response.data));

      setProfile(response?.data);
      setFirstName(response.data?.firstName);
      setLastName(response.data?.lastName);
      setEmail(response.data?.email);
      setMartial(response.data?.maritalStatus);
      setDOB(response.data?.dateOfBirth);
      setTreatyNumber(response.data?.treatyNumber);
      setInsuranceNumber(response.data?.socialInsuranceNumber);
      setPhone(response.data?.phone);
      setHealthCard(response.data?.healthCardNumber);
      setEmEmail(response.data?.emergencyContactEmail);
      setEmFullName(response.data?.emergencyContactName);
      setEmPhone(response.data?.emergencyContactPhone);

      console.log(response?.data, 'profile data');
      console.log(phone, 'profile data');
    } else {
      alert(response.data.title);
    }
  }

  const updateReviewStatus = async () => {
    const payload = {isPersonalInfoAck: true};
    const response = await updateStepReviewStatus(
      {isPersonalInfoAck: true, id: userMeta?.user?.id},
      userMeta?.user?.accessToken,
      userMeta?.user?.id,
    );
    console.log('response', response);
    if (response.status === 200) {
      appDispatch(
        updateReviewedStep({step: 'isPersonalInfoAck', status: true}),
      );
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
        contentContainerStyle={{paddingBottom: keyboardShown ? 40 : 0}}>
        {props?.route && props?.route?.params?.showHeader && <Header />}
        <View style={styles.container}>
          <View style={{marginTop: 13}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {props.route && props?.route?.params?.showHeader && (
                <TouchableOpacity
                  onPress={() => props.navigation.pop()}
                  style={{justifyContent: 'center'}}>
                  <Icon name="arrow-left" size={25} color={green} />
                </TouchableOpacity>
              )}
              <View
                style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                {/* <Icon name="account-outline" size={25} /> */}
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                    flex: 1,
                  }}>
                  Personal Information
                </Text>
              </View>
            </View>
            <View style={styles.profileParentView}>
              <TouchableOpacity
                style={styles.btnUpload}
                onPress={() => (!isAdmin ? setShowModal(true) : null)}>
                {profileImg ? (
                  <>
                    <Image
                      source={{uri: profileImg}}
                      style={{width: 120, height: 120, borderRadius: 65}}
                    />
                    <View style={styles.profileContainer}>
                      <Icon name={'camera-outline'} color={green} size={20} />
                    </View>
                  </>
                ) : (
                  <>
                    <Icon
                      name="account-circle"
                      color={'lightgray'}
                      size={120}
                    />
                    <View style={styles.profileContainer}>
                      <Icon name={'camera-outline'} color={green} size={20} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={{paddingBottom: 40, marginTop: -30}}>
            <View style={styles.group}>
              <Text style={styles.label}>
                First name <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                editable={isAdmin ? false : true}
                hasError={firstNameError}
                error={'Please provide a valid first name.'}
                borderColor={firstNameError ? 'red' : textFieldBorder}
                ref={firstnameRef}
                placeholder={'Enter first name'}
                value={firstname}
                onChangeText={text => {
                  setFirstNameError(false);
                  setFirstName(text);
                }}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  lastnameRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Last name <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                editable={isAdmin ? false : true}
                hasError={lastNameError}
                error={'Please provide a valid last name.'}
                ref={lastnameRef}
                borderColor={lastNameError ? 'red' : textFieldBorder}
                placeholder={'Enter last name'}
                value={lastname}
                onChangeText={text => {
                  setLastNameError(false);
                  setLastName(text);
                }}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  contactRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Email <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                borderColor={emailError ? 'red' : textFieldBorder}
                editable={false}
                hasError={emailError}
                error={'Please provide a valid email address.'}
                value={email}
                ref={emailRef}
                keyboardType={'email-address'}
                placeholder={'Enter email address'}
                onChangeText={text => {
                  setemailError(false);
                  setEmail(text);
                }}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  contactRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Phone Number<Text style={styles.labelStrick}>*</Text>
              </Text>
              <ContactField
                editable={isAdmin ? false : true}
                ref={contactRef}
                borderColor={phoneError == true ? 'red' : textFieldBorder}
                selectedValue={phoneCode}
                placeholder={'(xxx) xxx-xxxx'}
                onValueChange={code => setPhoneCode(code)}
                onChangeText={text => {
                  setphoneError(false);
                  setPhone(text);
                }}
                keyboardType={'number-pad'}
                value={`${phone}`}
                returnKeyType={'done'}
                onSubmitEditing={() => {
                  treatRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Marital Status <Text style={styles.labelStrick}>*</Text>
              </Text>
              <View style={styles.martialStatus}>
                <Picker
                  enabled={isAdmin ? false : true}
                  ref={statusRef}
                  style={{height: 50, width: '100%'}}
                  iosIcon={
                    <Icon name="chevron-down" color={'black'} size={20} />
                  }
                  mode="dropdown"
                  selectedValue={martial}
                  onValueChange={text => {
                    setMartial(text);
                    setMartialError(false);
                  }}>
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
              <Text style={styles.label}>
                Date of Birth <Text style={styles.labelStrick}>*</Text>{' '}
                <Text style={{fontSize: 10}}>(Age limit 18-65 years)</Text>
              </Text>
              <DatePicker
                init={dob === null ? true : false}
                editable={isAdmin ? false : true}
                value={dob}
                hasError={dobError}
                onChange={date => {
                  console.log('DOB', date);
                  setDobError(false);
                  setDOB(date);
                  setShowDatePicker(false);
                }}
              />
            </View>
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
                Treaty status
              </Text>
              <Switch
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setTreaty(!IsTreaty)}
                value={IsTreaty}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
              />
            </View>
            {IsTreaty && (
              <View style={styles.group}>
                <Text style={styles.label}>
                  Treaty Number <Text style={styles.labelStrick}>*</Text>
                </Text>
                {skipHealthCardVerify ? (
                  <PasswordField
                    editable={true}
                    borderColor={treatyError ? 'red' : textFieldBorder}
                    hasError={treatyError}
                    error={'Please provide a valid 10-digit treaty number.'}
                    ref={treatRef}
                    value={treatyNumber}
                    maxLength={9}
                    placeholder={'Enter 10 digit Treaty number'}
                    onChangeText={text => {
                      setTreatyNumber(text);
                      setTreatyError(false);
                    }}
                    keyboardType={'number-pad'}
                    returnKeyType={'done'}
                    onSubmitEditing={() => {
                      emgFullNameRef.current.focus();
                    }}
                    blurOnSubmit={false}
                  />
                ) : (
                  <SensitiveInfoField
                    editable={isAdmin || !showTreatyNumber ? false : true}
                    borderColor={treatyError ? 'red' : textFieldBorder}
                    hasError={treatyError}
                    error={'Please provide a valid 10-digit treaty number.'}
                    ref={treatRef}
                    value={treatyNumber}
                    maxLength={10}
                    placeholder={'Enter 10 digit Treaty number'}
                    keyboardType={'number-pad'}
                    onChangeText={text => {
                      setTreatyNumber(text);
                      setTreatyError(false);
                    }}
                    show={showTreatyNumber}
                    setShow={() => onShowingTreatyNumber('treaty-number')}
                    returnKeyType={'done'}
                    onSubmitEditing={() => {
                      socialRef.current.focus();
                    }}
                    blurOnSubmit={false}
                  />
                )}
              </View>
            )}

            <View style={styles.group}>
              <Text style={styles.label}>
                Social Insurance Number{' '}
                <Text style={styles.labelStrick}>*</Text>
              </Text>
              {skipInsuranceNumberVerify ? (
                <PasswordField
                  editable={true}
                  borderColor={insuranceNumberError ? 'red' : textFieldBorder}
                  hasError={insuranceNumberError}
                  error={'Please provide a valid 9-digit SIN'}
                  ref={socialRef}
                  value={insuranceNumber}
                  maxLength={9}
                  placeholder={'Enter 9 digit SIN'}
                  onChangeText={text => {
                    setInsuranceNumberError(false);
                    setInsuranceNumber(text);
                  }}
                  keyboardType={'number-pad'}
                  returnKeyType={'done'}
                  onSubmitEditing={() => {
                    healthRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              ) : (
                <SensitiveInfoField
                  editable={isAdmin || !showInsuranceNumber ? false : true}
                  borderColor={insuranceNumberError ? 'red' : textFieldBorder}
                  hasError={insuranceNumberError}
                  error={'Please provide a valid 9-digit SIN'}
                  ref={socialRef}
                  value={insuranceNumber}
                  maxLength={9}
                  placeholder={'Enter 9 digit SIN'}
                  onChangeText={text => {
                    setInsuranceNumberError(false);
                    setInsuranceNumber(text);
                  }}
                  show={showInsuranceNumber}
                  setShow={() =>
                    onShowingInsuranceNumber('social-insurance-number')
                  }
                  keyboardType={'number-pad'}
                  returnKeyType={'done'}
                  onSubmitEditing={() => {
                    healthRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              )}
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Health Card Number <Text style={styles.labelStrick}>*</Text>
              </Text>
              {
                <SensitiveInfoField
                  editable={isAdmin || !showHealthCardNumber ? false : true}
                  borderColor={healthCardError ? 'red' : textFieldBorder}
                  hasError={healthCardError}
                  error={'Please provide a valid 9-digit health card number.'}
                  ref={healthRef}
                  value={healthCard}
                  maxLength={9}
                  placeholder={'Enter 9 digit Health Card number'}
                  onChangeText={text => {
                    setHealthCard(text);
                    setHealthCardError(false);
                  }}
                  show={showHealthCardNumber}
                  setShow={() =>
                    onShowingHealthCardNumber('health-card-number')
                  }
                  keyboardType={'number-pad'}
                  returnKeyType={'done'}
                  onSubmitEditing={() => {
                    emgFullNameRef.current.focus();
                  }}
                  blurOnSubmit={false}
                />
              }
            </View>
            <View style={{marginTop: 30}}>
              <Text style={{fontWeight: 'bold', fontSize: 20}}>
                Emergency Information
              </Text>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Full name <Text style={styles.labelStrick}>*</Text>
              </Text>
              <InputField
                cap={'sentences'}
                editable={isAdmin ? false : true}
                // borderColor={usernameError ? 'red' : textFieldBorder }
                hasError={em_fullnameError}
                error={'Please provide a valid emergency contact name.'}
                ref={emgFullNameRef}
                placeholder={'Enter emergency contact full name'}
                value={em_fullname}
                onChangeText={text => {
                  setEmFullNameError(false);
                  setEmFullName(text);
                }}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  emgEmailRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Email</Text>
              <InputField
                editable={isAdmin ? false : true}
                hasError={em_emailError}
                error={
                  'Please provide a valid emergency contact email address.'
                }
                ref={emgEmailRef}
                placeholder={'Enter emergency contact email address'}
                value={em_email}
                onChangeText={text => {
                  setEmEmail(text);
                  setEmEmailError(false);
                }}
                keyboardType={'email-address'}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  emgContactRef.current.focus();
                }}
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Emergency Contact <Text style={styles.labelStrick}>*</Text>
              </Text>
              <ContactField
                editable={isAdmin ? false : true}
                ref={emgContactRef}
                borderColor={em_phoneError === true ? 'red' : textFieldBorder}
                selectedValue={em_phoneCode}
                value={em_phone}
                placeholder={'xx xxx xxxx'}
                keyboardType={'number-pad'}
                onValueChange={code => {
                  setEmPhoneCode(code);
                }}
                onChangeText={text => {
                  setEmPhone(text);
                  setEmphoneError(false);
                }}
                returnKeyType={'done'}
                // onSubmitEditing={() => { emailRef.current.focus(); }}
              />
            </View>

            <AddButton
              text={em_fullname !== null ? 'Update' : 'Save'}
              style={{
                width: Dimensions.get('screen').width - 40,
                marginTop: 25,
              }}
              isLoading={upLoading}
              // text={showEdit == true && addNew ? 'Add New' : 'Save'}
              onPress={handleSubmit}
            />
            {!isAdmin &&
              props.route?.params?.isReviewRequired &&
              !userMeta?.reviewedSteps?.isPersonalInfoAck && (
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

                <View>
                  <TouchableOpacity
                    onPress={() => {
                      if (validations()) {
                        props.jumpTo('address');
                      } else {
                        BannerNotification.show(
                          '',
                          AlertMessages.FILL_FIELD_VALIDATION,
                          'error',
                        );
                      }
                    }}
                    style={{width: '100%', borderRadius: 50}}>
                    <LinearGradient
                      colors={['#0B7E51', '#006940']}
                      style={[
                        GlobalStyles.flexDirectionRow,
                        GlobalStyles.linearGradient,
                        {width: '100%'},
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

        {showPasswordModal && (
          <PasswordVerificationModal
            show={showPasswordModal}
            closeModal={closePasswordVerifyModal}
            isLoading={passwordVerificationLoading}
            verificationError={passwordVerificationError}
            onSubmit={onPasswordVerify}
          />
        )}
        <Modal animationType="fade" transparent={true} visible={showModal}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modal_title}>Upload Profile Photo</Text>
              </View>
              <Pressable style={styles.modalButton} onPress={openCamera}>
                <Text style={styles.textStyle}>Take a photo</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={openGallery}>
                <Text style={styles.textStyle}>Choose from gallery</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, {borderBottomWidth: 0}]}
                onPress={() => setShowModal(false)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    borderRadius: 5,
    marginLeft: -6,
    paddingLeft: -20,
    marginRight: 20,
  },
  // linearGradient: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderRadius: 40,
  //   flexDirection: 'row',
  //   height: 65,
  //   width: '100%',
  // },
  marginTop13: {
    marginTop: 13,
  },
  profileParentView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    marginTop: 10,
  },
  profileContainer: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: 'white',
    padding: 7,
    borderRadius: 20,
    borderColor: 'lightgray',
    borderWidth: 1,
  },

  button: {
    borderRadius: 6,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: green,
  },
  buttonText: {
    fontSize: 16,
    color: green,
    fontWeight: 'bold',
  },
  modalTitleContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#BABABB',
    borderBottomWidth: 1,
  },
  modal_title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  modalButton: {
    width: '100%',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomColor: '#BABABB',
    borderBottomWidth: 1,
  },
  centeredView: {
    flex: 1,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  modalView: {
    width: 300,
    zIndex: 4,
    backgroundColor: '#CDCDCD',
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
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: '#007aff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default PersonalInfo;
