import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  ToastAndroid,
  PermissionsAndroid
} from 'react-native';
import axios from 'axios';
import Header from '../../../../components/Header';
import {green, primaryBGColor} from '../../../../utils/colors';
import BannerNotification from '../../../../components/BannerNotification';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  createApplication,
  getApplicationByIdAction,
} from '../../../../servercalls/userApplication';
import {AppContext} from '../../../../context/AppContext';
import moment from 'moment';
import {
  application,
  applicationData,
  applicationUserData,
} from '../../../../utils/strings';
import RNFetchBlob from 'rn-fetch-blob';
import { config as urlConfig } from '../../../../config';
import Toast from 'react-native-simple-toast';
import {useIsFocused} from '@react-navigation/native';
import {getDetailsAction} from '../../../../servercalls/user';
import {getDocumentsByUserIdUser} from '../../../../servercalls/profile';

const Steps = props => {
  const isFocused = useIsFocused();
  const [state, dispatch] = useContext(AppContext);
  const item = props.route?.params?.item;
  const status = props.route?.params?.status;
  const [downloading, setDownloading] = useState(false)
  const [loading, setLoading] = useState(true);
  const [optionList, setOptionList] = useState(applicationUserData);
  const [appData, setAppData] = useState({});


  const getAppById = async id => {
    let response = await getApplicationByIdAction(state?.user.accessToken, id);
    if (response.status === 200) {
      console.log("#################", response.data.status);
      setAppData(response.data);
      setupComplete(response.data.completedStepNumber);
      getDocuments(
        'user-profiles',
        state?.user?.id,
        state?.user?.accessToken,
        response.data,
      );
    } else {
      console.log(response, 'url fetched err');
    }
  };
  async function getApplicationPreEmp(appdata) {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      '/pre-employment-supports',
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
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      '/job-training-search-logs',
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

  useEffect(() => {
    if (item) {
      getAppById(item?.id);
    }
  }, [isFocused]);

 

  const setupComplete = currentStep => {
    let count = currentStep;

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
  };

  useEffect(() => {
    if (Object.keys(optionList).length != 0) {
      // store data in context api.
      dispatch({
        type: applicationUserData,
        payload: optionList,
      });
    }
  }, [optionList]);

  const checkFileDownloadPermission = async () => {
    console.log("======================PATHFILE=======================================", urlConfig.api.docs_url)
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


  const downloadFile= () => {
    // Main function to download the image
    // Get config and fs from RNFetchBlob
    // config: To pass the downloading related options
    // fs: Directory path where we want our file to download
    const { fs } = RNFetchBlob;
    let config = {
      method: 'get',
      url: `${urlConfig.api.docs_url}/generate/${state?.application?.id}`,
      headers: { 
        'Authorization':  `Bearer ${state?.user?.accessToken}`
      }
    };
    
    axios(config)
    .then(async(response) => {
      console.log(JSON.stringify(response.data));
      let fPath = Platform.select({
        ios: fs.dirs.DocumentDir,
        android: fs.dirs.DownloadDir,
     });
     
     fPath = `${fPath}/residency-deceleration-form.pdf`;
     
     if (Platform.OS === 'ios') {
         await fs.createFile(fPath, response.data, "base64");
     } else {
         await fs.writeFile(fPath, response.data, "base64");
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
      console.log("==============FileError====", error);
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
      <ScrollView style={styles.container}>
        <Header />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
            paddingHorizontal: 20,
          }}>
          <View style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 5,
              }}>
              <TouchableOpacity
                onPress={() => props.navigation.pop()}
                style={{
                  marginLeft: -5,
                  justifyContent: 'center',
                }}>
                <Icon name="arrow-left" size={25} color={green} />
              </TouchableOpacity>
              <Text
                adjustsFontSizeToFit
                style={{marginLeft: 5, fontSize: 20, fontWeight: 'bold'}}>
                Application for Social Assistance
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {item?.startedOn && (
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text
                    style={{fontSize: 14, color: 'lightgray', marginRight: 5}}>
                    Start Date:
                  </Text>
                  <Text style={{fontSize: 14}}>
                    {moment.utc(item.startedOn).format('YYYY-MM-DD')}
                  </Text>
                </View>
              )}
              {(props?.route?.params) &&
                props?.route?.params?.status === 'IN_PROGRESS' && (
                  <View style={{}}>
                    <View
                      adjustsFontSizeToFit
                      style={{
                        ...styles.statusContainer,
                        backgroundColor: '#FCF0D3',
                      }}>
                      <Text
                        adjustsFontSizeToFit
                        style={{
                          color: '#EFB321',
                          textTransform: 'capitalize',
                          fontSize: 10,
                        }}>
                        In Progress
                      </Text>
                    </View>
                  </View>
                )}
            </View>
          </View>
        </View>
        {state?.application?.status !== "IN_PROGRESS" && <View style={{alignItems: 'flex-end', marginBottom: 15, marginRight: 15}}>
          <TouchableOpacity
            onPress={checkFileDownloadPermission}
            disabled={downloading}
            style={{
              paddingHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
                {downloading ? (
                <ActivityIndicator size={'small'} color={'#006940'} />
              ) : (
                <Icon color={green} name="download" size={22} />
              )}
            
            <Text
              style={{
                color: green,
                fontSize: 16,
                fontWeight: 'bold',
              }}>
              {'Download'}
            </Text>
          </TouchableOpacity>
      </View>}
        <View style={{paddingHorizontal: 20, paddingVertical: 20}}>
          {optionList.map(elm => (
            <TouchableOpacity
              disabled={
                elm.step_id <= parseInt(appData.completedStepNumber + 1 ?? 0)
                  ? false
                  : true
              }
              style={styles.card}
              onPress={() => {
                props.navigation.navigate(elm.nav, {item: appData});
              }}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                {elm.completed && (
                  <Icon
                    name="check-circle-outline"
                    size={25}
                    style={{right: 5}}
                    color={elm.completed ? green : 'black'}
                  />
                )}
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    flexWrap: 'wrap',
                    color:
                      elm.step_id == parseInt(appData.completedStepNumber + 1)
                        ? 'black'
                        : elm.step_id <
                            parseInt(appData.completedStepNumber + 1) &&
                          elm.completed
                        ? green
                        : 'gray',
                  }}>
                  {elm.name}
                </Text>
              </View>
              <View>
                <Icon
                  name="chevron-right"
                  size={25}
                  color={elm.completed ? green : 'black'}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: primaryBGColor},
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
    flexDirection:'row',
    alignItems:'center'
  },
  cardTitle: {
    color: green,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});

export default Steps;
