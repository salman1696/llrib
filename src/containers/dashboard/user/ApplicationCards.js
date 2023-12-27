import React, {useContext, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  Switch,
  View,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  ToastAndroid,
  Platform,
} from 'react-native';
import axios from 'axios';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  blue,
  green,
  primaryBGColor,
  textFieldBorder,
} from '../../../utils/colors';
import {Container, Picker} from 'native-base';
import {useState} from 'react';
import Header from '../../../components/Header';
import PasswordField from '../../../components/PasswordField';
import {AppContext} from '../../../context/AppContext';
import {
  geAdminDetailsAction,
  getDetailsAction,
  setUserApplicationStatusAction,
} from '../../../servercalls/admin';
import {
  application,
  applicationData,
  applicationsData,
} from '../../../utils/strings';
import moment from 'moment';
import BannerNotification from '../../../components/BannerNotification';
import {config as urlConfig} from '../../../config';
import RNFetchBlob from 'rn-fetch-blob';
import {getDocumentsByUserIdUser} from '../../../servercalls/profile';

const ApplicationCards = props => {
  const item = props.route?.params?.item;

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [status, setStatus] = useState();
  const [app, setApplication] = useState('');
  const [inAppAlert, setInAppAlert] = useState(false);
  const [mobileAlerts, setMobileAlerts] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [optionList, setOptionList] = useState(applicationData);
  const [downloading, setDownloading] = useState(false);
  const [enableChangePasswordView, setEnableChangePasswordView] =
    useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMesssage, setErrorMesssage] = useState('');
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState();

  useEffect(() => {
    if (isAdmin) {
      // fetch current user profile information from server
      getApplications();
      console.log('ApplicationSteps', 'ApplicationSteps');
    }
  }, []);

  async function getApplications() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'application',
      '',
    );
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      // Store the complete data object for future use.
      // AsyncStorage.setItem('users', response.data);
      setApplication(response?.data);
      let count = response?.data.completedStepNumber;
      getDocuments(
        'admin/user-profile',
        item?.userProfile?.id,
        state?.user?.accessToken,
        response.data,
      );
      console.log(
        response?.data,
        'Applications data by application id Not inprogres',
      );
      if (Object.keys(response?.data).length != 0) {
        dispatch({
          type: application,
          payload: response?.data,
        });
        console.log('application stored');
        // store data in context api.
      }

      setOptionList(
        optionList.map(elm => {
          if (count > 0) {
            count--;
            return {
              ...elm,
              completed: !elm.completed,
            };
          }
          return elm;
        }),
      );
    } else {
      BannerNotification.show('', response?.data?.title, 'error');
    }
  }

  async function getApplicationPreEmp(appdata) {
    let response = await geAdminDetailsAction(
      state?.user?.accessToken,
      item.id,
      `application/${item.id}/pre-employment-supports`,
    );

    if (response.status == 200) {
      if (Object.keys(response?.data).length != 0) {
        let value = {
          ...appdata,
          emp_type: response?.data[response?.data.length - 1],
        };
        if (appdata?.completedStepNumber > 5) {
          getApplicationEmpTraining(value);
        } else {
          setLoading(false);
        }
        console.log(value, 'Applications pre Emp  data by application id');
        setAppData(value);
        // setOtherRecords(response.data);
        dispatch({
          type: application,
          payload: value,
        });
      }
    } else {
      setLoading(false);

      console.log(response);
      alert(response.data);
    }
  }

  async function getApplicationEmpTraining(appdata) {
    let response = await geAdminDetailsAction(
      state?.user?.accessToken,
      item.id,
      `application/${item.id}/job-training-search-logs`,
    );
    console.log('Response =================traing', appdata);

    if (response.status == 200) {
      setLoading(false);

      if (Object.keys(response?.data).length != 0) {
        let value = {...appdata, emp_training: response?.data[0]};
        setAppData({...appdata, emp_training: response?.data[0]});
        console.log(
          value,
          'Applications Emp Training ===============================?',
        );
        // setOtherRecords(response.data);
        dispatch({
          type: application,
          payload: value,
        });
      }
    } else {
      setLoading(false);
      console.log(response);
      alert(response.data);
    }
  }
  async function getDocuments(endpoint2, id, token, appData) {
    let response = '';

    response = await getDocumentsByUserIdUser(endpoint2, id, token, appData);
    console.log('Response docs ==>', appData);

    if (response.status == 200) {
      console.log('get response of documents=> ', response);
      if (response.data.length !== 0) {
        let value = {...appData, dbDocList: response?.data};
        setAppData({...appData, dbDocList: response?.data});
        setLoading(false);
        if (appData.completedStepNumber > 1) {
          getApplicationPreEmp(value);
        } else {
          setLoading(false);
        }
        console.log(
          {...appData, dbDocList: response?.data},
          'app data===================>',
        );
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);

      alert(response.data.title);
    }
  }

  async function setApplicationStatus(item, selection) {
    console.log('yes in');
    let response = await setUserApplicationStatusAction(
      state?.user?.accessToken,
      item.id,
      {
        id: item.id,
        status: selection,
        userProfile: {
          id: item?.userProfile.id,
        },
      },
    );
    console.log('Response', response);
    if (response.status == 200) {
      console.log(response?.data, 'User status call');
      setStatus(selected);
    } else {
    }
  }

  useEffect(() => {
    if (Object.keys(optionList).length != 0) {
      // store data in context api.
      dispatch({
        type: applicationsData,
        payload: optionList,
      });
    }
  }, [optionList]);

  const OnApplicationStatusChange = selected => {
    Alert.alert(
      'Comfirmation',
      'Do you want to change the application status ?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Proceed',
          onPress: async () => {
            setApplicationStatus(item, selected);
          },
        },
      ],
    );
  };

  const checkFileDownloadPermission = async () => {
    console.log(
      '======================PATHFILE=======================================',
      urlConfig.api.docs_url,
    );
    // Function to check the platform
    // If iOS then start downloading
    // If Android then ask for permission
    setDownloading(true);
    if (Platform.OS === 'ios') {
      downloadFile();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to download file',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Once user grant the permission start downloading
          console.log('Storage Permission Granted.');

          downloadFile();
        } else {
          // If permission denied then show alert
          alert('Storage Permission Not Granted');
          setDownloading(false);
        }
      } catch (err) {
        // To handle permission related exception
        console.warn(err);
      }
    }
  };

  const downloadFile = () => {
    // Main function to download the image
    // Get config and fs from RNFetchBlob
    // config: To pass the downloading related options
    // fs: Directory path where we want our file to download
    const {fs} = RNFetchBlob;
    let config = {
      method: 'get',
      url: `${urlConfig.api.docs_url}/generate/${app?.id}`,
      headers: {
        Authorization: `Bearer ${state?.user?.accessToken}`,
      },
    };

    console.log(config.url, 'url');

    axios(config)
      .then(async response => {
        console.log(JSON.stringify(response.data));
        let fPath = Platform.select({
          ios: fs.dirs.DocumentDir,
          android: fs.dirs.DownloadDir,
        });

        fPath = `${fPath}/residency-deceleration-form.pdf`;
        console.log(fPath, 'fPath');
        if (Platform.OS === 'ios') {
          await fs.createFile(fPath, response.data, 'base64');
        } else {
          await fs.writeFile(fPath, response.data, 'base64');
        }
        setDownloading(false);
        ToastAndroid.show(
          'Document Downloaded Successfully.',
          ToastAndroid.LONG,
        );
      })
      .catch(function (error) {
        setDownloading(false);
        BannerNotification.show(
          '',
          'Failed to download residency deceleration form.',
          'error',
        );
        console.log('==============FileError====', error);
      });
  };
  if (loading) {
    return (
      <ActivityIndicator
        size={'large'}
        color={green}
        style={{justifyContent: 'center', height: '100%'}}
      />
    );
  } else {
    return (
      <>
        <Container>
          <ScrollView>
            <Header />
            <View style={styles.container}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={() => props.navigation.pop()}
                  style={{justifyContent: 'center'}}>
                  <Icon name="arrow-left" size={25} color={green} />
                </TouchableOpacity>
                <View>
                  <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 20,
                        marginRight: 6,
                      }}>
                      Application for Social Assistance
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 7,
                  marginHorizontal: 5,
                }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: 11,
                      marginRight: 5,
                    }}>
                    Submitted Date:
                  </Text>
                  <Text style={{color: 'black', fontSize: 13}}>
                    {app?.submittedOn &&
                      moment.utc(app?.submittedOn).format('YYYY-MM-DD')}
                  </Text>
                </View>
                <View style={{position: 'absolute', right: 0}}>
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate('feedback', {
                        item: item,
                        route: 'application',
                      })
                    }
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="message-reply-text" size={14} color={green} />
                    <Text style={{marginLeft: 7, fontSize: 12, color: green}}>
                      Feedback
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 6,
                }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: 12,
                      marginRight: 5,
                    }}>
                    Review Date:
                  </Text>
                  <Text style={{color: 'black', fontSize: 13}}>
                    {app?.submittedOn &&
                      moment.utc(app?.reviewedOn).format('YYYY-MM-DD')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={checkFileDownloadPermission}
                  disabled={downloading}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  {downloading ? (
                    <ActivityIndicator size={'small'} color={'#006940'} />
                  ) : (
                    <Icon color={green} name="download" size={20} />
                  )}
                  <Text style={{fontSize: 12, color: green}}>Download</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor:
                    app?.status == 'APPROVED'
                      ? '#D4F6E5'
                      : app?.status == 'SUBMITTED'
                      ? '#d4e3f6'
                      : '#FCF0D3',
                  paddingHorizontal: 10,
                  top: 10,
                  width: 180,
                  height: 30,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Picker
                  style={{
                    height: 30,
                    fontSize: 15,
                    color:
                      app.status == 'APPROVED'
                        ? green
                        : app?.status == 'SUBMITTED'
                        ? 'blue'
                        : 'orange',
                  }}
                  enabled={isAdmin ? true : false}
                  mode="dropdown"
                  selectedValue={status}
                  onValueChange={text => {
                    OnApplicationStatusChange(text);
                  }}>
                  <Picker.Item label="Submitted" value={'SUBMITTED'} />
                  <Picker.Item label="Approved" value={'APPROVED'} />
                  <Picker.Item label="In progress" value={'IN_PROGRESS'} />
                </Picker>
                {/* <Text
                style={{
                  fontSize: 10,
                  color:
                    app.status == 'APPROVED'
                      ? green
                      : app?.status == 'SUBMITTED'
                      ? 'blue'
                      : 'orange',
                }}>
                {app?.status}
              </Text>
              <Icon
                name="chevron-down"
                size={20}
                color={
                  app.status == 'APPROVED'
                    ? green
                    : app?.status == 'SUBMITTED'
                    ? 'blue'
                    : 'orange'
                }
              /> */}
              </View>

              <View style={{paddingVertical: 15}}>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate('ApplicationStack', {
                            screen: 'cross_check',
                          })
                        }
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: Dimensions.get('screen').width / 3.5,
                        }}>
                        <Icon
                          name="book-open-variant"
                          size={40}
                          color={green}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          {'El\nCross Check Authorization'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={
                          () =>
                            props.navigation.navigate('ApplicationStack', {
                              screen: 'pre_employment',
                            })

                          // props.navigation.navigate('pre_employment')
                        }
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: Dimensions.get('screen').width / 3.5,
                        }}>
                        <Icon
                          name="badge-account-horizontal-outline"
                          size={40}
                          color={green}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          {'Pre-\nEmployment Support'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate('ApplicationStack', {
                            screen: 'exempted_income',
                            params: {item: item},
                          })
                        }
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: Dimensions.get('screen').width / 3.5,
                        }}>
                        <Icon name="cash-usd" size={40} color={green} />
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          Exempt Income
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate('ApplicationStack', {
                            screen: 'other_support',
                          })
                        }
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: Dimensions.get('screen').width / 3.5,
                        }}>
                        <Icon name="cash-usd" size={40} color={green} />
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          Other Supports
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate('ApplicationStack', {
                            screen: 'residency_declaration',
                            params: {item: item},
                          })
                        }
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: Dimensions.get('screen').width / 3.5,
                        }}>
                        <Icon name="domain" size={40} color={green} />
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          {'On-Reserver\nResidency\nDeclaration'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate('ApplicationStack', {
                            screen: 'employment_training',
                            params: {item: item},
                          })
                        }
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: Dimensions.get('screen').width / 3.5,
                        }}>
                        <Icon name="account-box" size={40} color={green} />
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          Employment and Training Search
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate('ApplicationStack', {
                            screen: 'employment_separation',
                            params: {item: item},
                          })
                        }
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
                          {'Un-\nemployability'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{flex: 0.5, padding: 10}}>
                    <View style={styles.card}>
                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate('ApplicationStack', {
                            screen: 'client_consent',
                            params: {item: item},
                          })
                        }
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: Dimensions.get('screen').width / 3.5,
                        }}>
                        <Icon
                          name="check-box-outline"
                          size={40}
                          color={green}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          Client Consent
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </Container>
      </>
    );
  }
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
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 5,
  },
});

export default ApplicationCards;
