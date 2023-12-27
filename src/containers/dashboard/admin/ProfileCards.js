import React, {useContext, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  Switch,
  View,
  TextInput,
  Modal,
  Pressable,
  ToastAndroid,
} from 'react-native';
import {State, TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntoIcon from 'react-native-vector-icons/Entypo';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {setUserProfile} from '../../../utils/strings';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import {Container, Picker} from 'native-base';
import {useState} from 'react';
import Toast from 'react-native-simple-toast';
import Header from '../../../components/Header';
import {AppContext} from '../../../context/AppContext';
import {
  getDetailsAction,
  setUserStatusAction,
} from '../../../servercalls/admin';
import {fetchUserProfile} from '../../../servercalls/profile';
import {getPresignedUrlToGetDocuments} from '../../../servercalls/fetchFiles';
import {getUserReviewedStatus} from '../../../servercalls/user';
import {useDispatch, useSelector} from 'react-redux';
import {storeReviewSteps} from '../../../slices/userSlice';
import ReviewStatusIcon from './components/reviewStatusIcon';
// import Modal, { ModalButton, ModalContent, ModalTitle, SlideAnimation } from 'react-native-modals';

const ProfileCards = props => {
  const item = props.route.params.item;

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;
  const [isSingle, setIsSingle] = useState(false);
  const [active, setActive] = useState(item.isUserLocked);
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState('');
  const [profileImg, setProfileImg] = useState('');

  const appDispatch = useDispatch();
  const userMeta = useSelector(state => state.userMeta);

  useEffect(() => {
    if (isAdmin) {
      getProfileById();
      getDocument(item.imageUrl);
    } else {
      console.log('=====================HHHHHHHH=========================');
      fetchProfilebyId();
      getDocument(state?.user?.imageUrl);

      if (props.route.params?.isReviewRequired) {
        getReviewStepsStatus();
      }
    }
  }, []);

  const getReviewStepsStatus = async () => {
    let response = await getUserReviewedStatus(item?.id, item?.accessToken);
    if (response.status === 200) {
      appDispatch(storeReviewSteps(response.data));
    }
  };

  async function setProfileStatus(profileStatus, reason) {
    let response = await setUserStatusAction(
      state?.user?.accessToken,
      item.id,
      profileStatus,
      reason,
      'users',
    );
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      // setApplication(response?.data);
      setShowModal(false);
      setActive(!active);
      console.log(response?.data, 'User status call');
    } else {
      // alert(response.data.title, 'prfile status');
    }
  }

  async function getProfileById() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'user-profile',
      '',
    );
    console.log('Response=====>>>', response);
    // setLoading(false);
    if (response.status == 200) {
      setProfile(response?.data);
      setActive(response?.data?.isUserLocked);
      console.log(response?.data, ' response profile by Id');
    } else {
      // alert(response.data.title, 'getprofilebyId');
    }
  }
  console.log(
    '==============================Response-Status=============================',
    state,
  );
  async function fetchProfilebyId() {
    let response = await fetchUserProfile(item.id, state?.user?.accessToken);

    // setLoading(false);
    if (response.status == 200) {
      dispatch({
        type: setUserProfile,
        payload: response?.data,
      });
      setProfile(response?.data);
      setActive(response?.data?.isUserLocked);
      console.log(response?.data, ' response profile by Id');
    } else {
      // alert(response.data.title, 'fetch profilee by id');
    }
  }

  const getDocument = async path => {
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

  return (
    <>
      <Container>
        <ScrollView>
          <Header />
          <View style={styles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => props.navigation.pop()}
                style={{justifyContent: 'center'}}>
                <Icon name="arrow-left" size={25} color={green} />
              </TouchableOpacity>
              <View
                style={{
                  flex: 1,
                  marginVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1, marginLeft: 5}}>
                  <Text style={{fontWeight: 'bold', fontSize: 22}}>
                    Profile
                  </Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {profileImg ? (
                      <Image
                        source={{uri: profileImg}}
                        resizeMode={'cover'}
                        style={{
                          width: 27,
                          height: 27,
                          right: 5,
                          borderRadius: 65,
                        }}
                      />
                    ) : (
                      <Icon
                        name="account-circle"
                        size={30}
                        color={'lightgray'}
                      />
                    )}
                    <Text style={{color: 'black'}}>
                      {profile?.firstName === null
                        ? 'john Doe'
                        : profile?.firstName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {props.route.params && props.route.params.showStatus && (
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'black', fontSize: 18, marginRight: 5}}>
                  State:{' '}
                  <Text style={{color: active ? 'green' : 'gray'}}>
                    {active ? 'Active' : 'Disabled'}
                  </Text>
                </Text>
                <Switch
                  trackColor={{false: '#E5E5E5', true: '#006940'}}
                  thumbColor={active ? '#f4f3f4' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    // setActive(!active);
                  }}
                  value={active}
                />
              </TouchableOpacity>
            )}
            <View style={{paddingVertical: 10}}>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 0.5, padding: 10}}>
                  <View style={styles.card}>
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate('profile_info', {
                          showHeader: true,
                          item: item,
                          isReviewRequired:
                            props.route.params?.isReviewRequired ?? false,
                        });
                      }}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: Dimensions.get('screen').width / 3.5,
                      }}>
                      <Icon name="account" size={40} color={green} />
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: 'center',
                          marginTop: 10,
                        }}>
                        Personal Information
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {props.route.params?.isReviewRequired &&
                    userMeta.reviewedSteps && (
                      <ReviewStatusIcon
                        status={
                          userMeta.reviewedSteps?.isPersonalInfoAck ?? false
                        }
                      />
                    )}
                </View>
                <View style={{flex: 0.5, padding: 10}}>
                  <View style={styles.card}>
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate('address_info', {
                          showHeader: true,
                          item: item,
                          isReviewRequired:
                            props.route.params?.isReviewRequired ?? false,
                        });
                      }}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: Dimensions.get('screen').width / 3.5,
                      }}>
                      <Icon name="home" size={40} color={green} />
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: 'center',
                          marginTop: 10,
                        }}>
                        Address
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {props.route.params?.isReviewRequired &&
                    userMeta.reviewedSteps && (
                      <ReviewStatusIcon
                        status={userMeta.reviewedSteps?.isAddressAck ?? false}
                      />
                    )}
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 0.5, padding: 10}}>
                  <View style={styles.card}>
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate('educational_info', {
                          showHeader: true,
                          item: props.route.params.item,
                          isReviewRequired:
                            props.route.params?.isReviewRequired ?? false,
                        });
                      }}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: Dimensions.get('screen').width / 3.5,
                      }}>
                      <EntoIcon name="graduation-cap" size={40} color={green} />
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: 'center',
                          marginTop: 10,
                        }}>
                        Education
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {props.route.params?.isReviewRequired &&
                    userMeta.reviewedSteps && (
                      <ReviewStatusIcon
                        status={userMeta.reviewedSteps?.isEducationAck ?? false}
                      />
                    )}
                </View>
                <View style={{flex: 0.5, padding: 10}}>
                  <View style={styles.card}>
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate('employment_info', {
                          showHeader: true,
                          item: props.route.params.item,
                          isReviewRequired:
                            props.route.params?.isReviewRequired ?? false,
                        });
                      }}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: Dimensions.get('screen').width / 3.5,
                      }}>
                      <Icon name="briefcase" size={40} color={green} />
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: 'center',
                          marginTop: 10,
                        }}>
                        {'Employment History'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {props.route.params?.isReviewRequired &&
                    userMeta.reviewedSteps && (
                      <ReviewStatusIcon
                        status={
                          userMeta.reviewedSteps?.isEmploymentAck ?? false
                        }
                      />
                    )}
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 0.5, padding: 10}}>
                  <View style={styles.card}>
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate('bank_account_info', {
                          showHeader: true,
                          item: props.route.params.item,
                          isReviewRequired:
                            props.route.params?.isReviewRequired ?? false,
                        });
                      }}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: Dimensions.get('screen').width / 3.5,
                      }}>
                      <Icon name="bank" size={40} color={green} />
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: 'center',
                          marginTop: 10,
                        }}>
                        Bank Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {props.route.params?.isReviewRequired &&
                    userMeta.reviewedSteps && (
                      <ReviewStatusIcon
                        status={userMeta.reviewedSteps?.isBankingAck ?? false}
                      />
                    )}
                </View>
                <View style={{flex: 0.5, padding: 10}}>
                  <View style={styles.card}>
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate('asset_info', {
                          showHeader: true,
                          item: props.route.params.item,
                          isReviewRequired:
                            props.route.params?.isReviewRequired ?? false,
                        });
                      }}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: Dimensions.get('screen').width / 3.5,
                      }}>
                      <Icon
                        name="currency-usd-circle"
                        size={40}
                        color={green}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: 'center',
                          marginTop: 10,
                        }}>
                        Assets
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {props.route.params?.isReviewRequired &&
                    userMeta.reviewedSteps && (
                      <ReviewStatusIcon
                        status={userMeta.reviewedSteps?.isAssetsAck ?? false}
                      />
                    )}
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                {state?.profile?.maritalStatus !== 'SINGLE' && (
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={() => {
                          props.navigation.navigate('family_info', {
                            showHeader: true,
                            item: props.route.params.item,
                            isReviewRequired:
                              props.route.params?.isReviewRequired ?? false,
                          });
                        }}
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: Dimensions.get('screen').width / 3.5,
                        }}>
                        <MatIcon
                          name="family-restroom"
                          size={40}
                          color={green}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          Family Information
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {props.route.params?.isReviewRequired &&
                      userMeta.reviewedSteps && (
                        <ReviewStatusIcon
                          status={
                            userMeta.reviewedSteps?.isDependentsAck ?? false
                          }
                        />
                      )}
                  </View>
                )}
                <View style={{flex: 0.5, padding: 10}}>
                  <View style={styles.card}>
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate('upload_document_info', {
                          showHeader: true,
                          item: item,
                          isReviewRequired:
                            props.route.params?.isReviewRequired ?? false,
                        });
                      }}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: Dimensions.get('screen').width / 3.5,
                      }}>
                      <Icon
                        name={isAdmin ? 'file' : 'upload'}
                        size={40}
                        color={green}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          textAlign: 'center',
                          marginTop: 10,
                        }}>
                        {isAdmin ? 'View Documents' : 'Upload Documents'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {props.route.params?.isReviewRequired &&
                    userMeta.reviewedSteps && (
                      <ReviewStatusIcon
                        status={
                          userMeta.reviewedSteps?.isRequiredDocumentsAck ??
                          false
                        }
                      />
                    )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        {showModal && (
          <Modal animationType="slide" transparent visible={showModal}>
            <View style={styles.centeredView}>
              <View style={{...styles.modalView, backgroundColor: '#F5F5F5'}}>
                <View style={{}}>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 15,
                      borderBottomColor: 'gray',
                      borderBottomWidth: 1,
                    }}>
                    <Text
                      style={{
                        paddingHorizontal: 20,
                        fontSize: 14,
                        lineHeight: 20,
                        textAlign: 'center',
                      }}>
                      {` Do you want to ${
                        active ? 'block' : 'unblock'
                      } this member? Give us a reason.`}
                    </Text>
                  </View>
                  <View style={{backgroundColor: 'white', padding: 15}}>
                    <Text>Reason</Text>
                    <TextInput
                      style={{
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                      }}
                      onChangeText={text => {
                        setReason(text);
                      }}
                    />
                  </View>
                  <Pressable
                    style={styles.modalButton}
                    onPress={() => {
                      {
                        reason !== ''
                          ? setProfileStatus(!active, reason)
                          : Toast.show('Please enter reason...', Toast.LONG);
                      }
                    }}>
                    <Text style={styles.textStyle}>
                      {active ? 'Block' : 'Unblock'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={{...styles.modalButton, borderBottomWidth: 0}}
                    onPress={() => {
                      setShowModal(false);
                    }}>
                    <Text style={styles.textStyle}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </Container>
    </>
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
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: Dimensions.get('screen').width / 2.5,
    borderColor: '#ededed',
    borderWidth: 1,
    // marginBottom: 10,
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
  centeredView: {
    flex: 1,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalView: {
    width: 300,
    zIndex: 4,
    backgroundColor: '#fff',
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dropdown: {
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 5,
  },
  textStyle: {
    color: '#007aff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalButton: {
    paddingVertical: 12,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
  },
});

export default ProfileCards;
