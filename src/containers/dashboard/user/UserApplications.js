import React, { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Alert,
  AsyncStorage,
} from 'react-native';
import Header from '../../../components/Header';
import { blue, green, primaryBGColor } from '../../../utils/colors';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {applications} from '../../../assets/data/userdata';
import { AppContext } from '../../../context/AppContext';
import { getDetailsAction } from '../../../servercalls/admin';
import moment from 'moment';
import {
  createApplication,
  fetchUserApllications,
} from '../../../servercalls/userApplication';
import { useIsFocused } from '@react-navigation/core';
import { AlertMessages, setAppId } from '../../../utils/strings';
import {
  getDocumentFromPresignedUrl,
  getPresignedUrl,
  getPresignedUrlToGetDocuments,
} from '../../../servercalls/fetchFiles';
import { stat } from 'react-native-fs';
import GlobalStyles from '../../../GlobalStyles';
import EmptyContainer from '../../../components/EmptyContainer';
import BannerNotification from '../../../components/BannerNotification';
import { useDispatch, useSelector } from 'react-redux';

const UserApplications = props => {
  const item = props.route?.params?.item;

  // redux
  const _user = useSelector(state => state.userMeta);
  const appDispatch = useDispatch();

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;
  const [applications, setApplication] = useState([]);
  const [canCreate, setCanCreate] = useState(true);
  const [profileImg, setProfileImg] = useState('');

  const focused = useIsFocused();

  useEffect(() => {
    if (state?.user?.isReviewRequired) {
      Alert.alert(
        'Warning',
        'Please review your profile information before creating new application in order to avoid application rejection..',
        [
          {
            text: 'Ok',
            onPress: async () => {
              props.navigation.navigate('profile_cards', {
                item: state?.user,
                img: profileImg,
                isReviewRequired: true,
              });
            },
          },
        ],
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      console.log('##################', isAdmin, state?.user);
      if (focused) {
        if (isAdmin) {
          // fetch current user profile information from server
          getUserApplications();
        } else {
          fetchApplications();
          getDocument(state?.user.id, 'PROFILE', 'PROFILE_PICTURE');
        }
      }
    })();
  }, [focused]);

  const getDocument = async (id, category, type) => {
    let formData = {
      file: state?.user.imageUrl,
    };

    let response = await getPresignedUrlToGetDocuments(
      formData,
      state?.user.accessToken,
    );
    if (response.status === 200) {
      console.log(response, 'url fetched');
      setProfileImg(response.data.url);
    } else {
      console.log(response, 'url fetched err');
    }
  };

  const fetchApplications = async () => {
    console.log('**USER**', state?.user);
    const response = await fetchUserApllications(
      state?.user?.id,
      state?.user?.accessToken,
    );
    console.log('Profile Info', response);

    if (response.status == 200) {
      setApplication(response.data);
      response?.data.map(item => {
        if (
          item.status == 'IN_PROGRESS' ||
          item.status == 'SUBMITTED' ||
          item.status == 'INCOMPLETE'
        ) {
          setCanCreate(false);
        }
      });
    }
  };

  async function getUserApplications() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'user-profile',
      '/applications',
    );
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      setApplication(
        response?.data?.sort(function (a, b) {
          return a.startedOn.localeCompare(b.startedOn);
        }),
      );

      console.log(response?.data, 'Applications data by user id');
    } else {
      alert(response.data.title);
    }
  }

  const createApp = async () => {
    try {
      var payload = {
        completedStepNumber: 0,
        isEiInfoAuthorized: false,
        isExemptCcb: false,
        isExemptGst: false,
        isExemptAmountDirectDeposit: false,
        isOtherSupportCpp: false,
        isOtherSupportChildCare: false,
        otherSupportAmount: 0,
        isResidencyDocUploaded: false,
        isResidencyDocManually: false,
        unemployabilityReason: 'NONE',
        isPregnanent: false,
        isHaveDependant: false,
        isAttendingSchool: false,
        isConsented: false,
        startedOn: new Date().toISOString(),
        status: 'IN_PROGRESS',
        category: 'SOCIAL_ASSIST',
        userProfile: {
          id: state?.user?.id,
        },
      };

      let response = await createApplication(payload, state?.user?.accessToken);
      if (response.status == 200) {
        console.log('Application created succesfully.', response);
        dispatch({
          type: setAppId,
          payload: { id: response.data, step: 0 },
        });
        props.navigation.navigate('application_steps', {
          item: { id: response.data },
        });
      } else {
        // alert('Unable to create application at the moment.');
        BannerNotification.show(
          '',
          'Unable to create application at the moment.',
          'error',
        );
      }
    } catch (err) {
      console.log('Error in application creation.');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primaryBGColor,
        paddingBottom: 280,
      }}>
      <Header
        redirectToUserProfile={() =>
          props.navigation.navigate('profile_cards', {
            item: state?.user,
            img: profileImg,
          })
        }
        isUser={true}
        user={state?.user}
        imgPath={profileImg}
      />
      <View style={styles.container}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
          <View style={{ flex: 0.6, flexDirection: 'row', alignItems: 'center' }}>
            {props.route &&
              props.route.params &&
              props.route.params.return_to_adminView && (
                <TouchableOpacity
                  onPress={() => props.navigation.pop()}
                  style={{ justifyContent: 'center' }}>
                  <Icon name="arrow-left" size={25} color={green} />
                </TouchableOpacity>
              )}
            <Text
              style={{
                flex: 1,
                marginLeft: 5,
                fontSize: 24,
                fontWeight: 'bold',
              }}>
              Applications
            </Text>
          </View>
          <View style={{ flex: 0.4 }}>
            {!isAdmin && (
              <TouchableOpacity
                onPress={createApp}
                disabled={!canCreate}
                style={{ height: 65, borderRadius: 50 }}>
                {canCreate ? (
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={styles.linearGradient}>
                    <Icon name={'plus'} size={20} color="white" />
                    <Text style={{ fontSize: 17, color: 'white' }}>
                      Create new
                    </Text>
                  </LinearGradient>
                ) : (
                  <LinearGradient
                    colors={['grey', 'gray']}
                    style={styles.linearGradient}>
                    <Icon name={'plus'} size={20} color="white" />
                    <Text style={{ fontSize: 17, color: 'white' }}>
                      Create new
                    </Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!state?.user?.hasRequiredDocuments && (
          <View
            style={{ backgroundColor: '#ff922d', padding: 10, borderRadius: 5 }}>
            <Text style={{ color: 'black', fontSize: 14 }}>
              Please upload required document(s) in User Profile to avoid Application rejection! Thank you.
            </Text>
          </View>
        )}
        <View>
          <FlatList
            data={applications}
            ListEmptyComponent={<EmptyContainer />}
            renderItem={item => {
              return (
                <View style={styles.card}>
                  <TouchableOpacity
                    onPress={() => {
                      dispatch({
                        type: setAppId,
                        payload: {
                          id: item?.item?.id,
                          step: item?.item?.completedStepNumber,
                        },
                      });

                      props.navigation.navigate('application_steps', {
                        item: item?.item,
                        status: item?.item.status,
                      });

                      // if (item.status == 'approved') {
                      //   props.navigation.navigate('application_cards');
                      // } else {
                      //   props.navigation.navigate('application_list', {
                      //     status: 'in-progress',
                      //   });
                      // }
                    }}>
                    <View
                      style={{
                        ...GlobalStyles.flexDirectionRow,
                        alignItems: 'flex-start',
                      }}>
                      <Text
                        adjustsFontSizeToFit
                        style={{
                          ...styles.cardTitle,
                          flexWrap: 'wrap',
                        }}>
                        APPLICATION FOR SOCIAL ASSISTANCE
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Text adjustsFontSizeToFit style={styles.label}>
                        {item.item?.submittedOn != null
                          ? 'Submission Date: '
                          : item.item?.reviewedOn != null
                            ? 'Review Date: '
                            : 'Start Date: '}
                      </Text>
                      <Text
                        adjustsFontSizeToFit
                        style={(styles.sub, { color: 'gray', fontSize: 12 })}>
                        {item.item?.submittedOn != null
                          ? moment
                            .utc(item.item.submittedOn)
                            .format('YYYY-MM-DD')
                          : item.item?.reviewedOn != null
                            ? moment
                              .utc(item.item.reviewedOn)
                              .format('YYYY-MM-DD')
                            : moment
                              .utc(item.item.startedOn)
                              .format('YYYY-MM-DD')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 40,
    height: 50,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 15,
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
  cardTitle: {
    color: green,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
  },
  label: {
    color: 'gray',
    fontSize: 12,
    marginBottom: 3,
  },
  sub: {
    color: 'black',
    fontSize: 10,
  },
  btnEdit: {
    padding: 5,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});

export default UserApplications;
