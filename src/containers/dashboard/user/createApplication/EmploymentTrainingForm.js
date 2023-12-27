import React, {useContext} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../../utils/colors';
import InputField from '../../../../components/InputField';
import AddButton from '../../../../components/AddButton';
import {useState} from 'react';
import UploadButton from '../../../../components/UploadButton';
import Header from '../../../../components/Header';
import {Container, Picker, Switch} from 'native-base';
import DatePicker from '../../../../components/CustomDatePicker';
import {useMemo} from 'react';
import {AppContext} from '../../../../context/AppContext';
import {useEffect} from 'react/cjs/react.development';
import Toast from 'react-native-simple-toast';
import moment from 'moment';
import GlobalStyles from '../../../../GlobalStyles';
import {
  fetchUserDependent,
  getDocumentsByUserIdUser,
  postDetailsAction,
  removeDocumentsByDocId,
} from '../../../../servercalls/profile';
import {DocumentCategory} from '../../../../utils/strings';
import RNFetchBlob from 'rn-fetch-blob';
import {getFileExtension} from '../../../../helpers/Utils';
import {getPresignedUrlToGetDocuments} from '../../../../servercalls/fetchFiles';

const EmploymentTrainingForm = props => {
  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;
  const {item} = props?.route?.params;
  const step = 6;
  let mApplication = '';
  let nextCompleted = false;
  useEffect(() => {
    state.applicationData.map(elm => {
      if (elm.step_id === step) {
        mApplication = elm;
      }
      if (elm.step_id === step + 1) {
        nextCompleted = elm.completed;
      }
    });
    // console.log(nextCompleted);
  }, []);
  useEffect(() => {}, []);

  const [name, setName] = useState('');
  const [community, setCommunity] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date());
  const [fileName, setFileName] = useState('');
  const [modelImage, setModelImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [pregancy, setPregancy] = useState(false);
  const [child, setChild] = useState(false);
  const [school, setSchool] = useState(false);
  const [other, setOther] = useState(true);
  const [isImageViewModal, setIsImageViewModal] = useState(false);

  const [otherRecords, setOtherRecords] = useState([]);
  const [otherType, setOtherType] = useState('employer');
  const [incomeFile, setIncomeFile] = useState('');

  useMemo(() => {
    if (pregancy || child || school) {
      setOther(false);
    } else if (pregancy == false && child == false && school == false) {
      setOther(true);
    }
  }, [pregancy, child, school]);

  useMemo(() => {
    if (other) {
      setPregancy(false);
      setChild(false);
      setSchool(false);
    }
  }, [other]);

  useEffect(() => {
    if (isAdmin) {
      console.log(state, 'state');
      setPregancy(state.application?.isPregnanent);
      setSchool(state.application?.isAttendingSchool);
      setChild(state.application?.isHaveDependant);
      setName(state.application?.emp_training?.name);
      setCommunity(state.application?.emp_training?.community);
      setDateApplied(
        new Date(state.application?.emp_training?.dateApplied) ?? new Date(),
      );
    }
  }, []);

  const getDocument = async path => {
    setImageLoading(true);
    let response = await getPresignedUrlToGetDocuments(
      {
        file: path,
      },
      state.user?.accessToken,
    );
    if (response.status === 200) {
      console.log(response.data.url, 'looooggggg');
      setModelImage(response.data.url);
      setImageLoading(false);
    } else {
      setImageLoading(false);
      console.log(response, 'url fetched err');
    }
  };

  const checkPermission = async path => {
    // Function to check the platform
    // If iOS then start downloading
    // If Android then ask for permission

    if (Platform.OS === 'ios') {
      downloadImage();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to download Photos',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Once user grant the permission start downloading
          console.log('Storage Permission Granted.');

          downloadImage(path);
          setDownloadLoading(false);
        } else {
          // If permission denied then show alert
          alert('Storage Permission Not Granted');
          setDownloadLoading(false);
        }
      } catch (err) {
        // To handle permission related exception
        console.warn(err);
      }
    }
  };

  const downloadImage = path => {
    setDownloadLoading(true);
    // Main function to download the image

    // To add the time suffix in filename
    let date = new Date();
    // Image URL which we want to download
    let image_URL = path;
    // Getting the extention of the file
    let ext = getFileExtension(image_URL);
    ext = '.' + ext;
    console.log(ext);
    // Get config and fs from RNFetchBlob
    // config: To pass the downloading related options
    // fs: Directory path where we want our image to download
    const {config, fs} = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        // Related to the Android only
        useDownloadManager: true,
        notification: true,
        path:
          PictureDir +
          '/image_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          ext,
        description: 'Image',
      },
    };
    console.log('calling');
    config(options)
      .fetch('GET', image_URL)
      .then(res => {
        // Showing alert after successful downloading
        console.log('res -> ', res);
        ToastAndroid.show(
          'Document Downloaded Successfully.',
          ToastAndroid.LONG,
        );
        // RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
        setDownloadLoading(false);
        setIsImageViewModal(false);
      })
      .catch(err => {
        setDownloadLoading(false);
        console.log(err, 'aaaerr');
      });
  };
  const downloadDoc = () => {
    let currDoc = {
      application: null,
      bytes: null,
      category: 'JOB_TRAINING_SEARCH',
      file: null,
      id: 5006,
      name: 'proof-document-1.jpg',
      path: 'user/4254/JOB_TRAINING_SEARCH/JOB_POSTING/proof-document-1.jpg',
      type: 'JOB_POSTING',
    };
    console.log(
      currDoc,
      state?.user.id,
      '==============FOUND in local============',
    );
    currDoc.path = `app/${item.id}/user/${item.userProfile.id}/${currDoc.category}/${currDoc.type}/${currDoc.name}`;
    getDocument(currDoc?.path);
    setFileName(currDoc?.name);
    return;
    // getDocument(currDoc[0].path);
  };

  return (
    <Container style={{}}>
      <ScrollView>
        <Header />
        <View style={styles.container}>
          <View
            style={{
              marginVertical: 13,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => props.navigation.pop()}
              style={{
                justifyContent: 'center',
              }}>
              <Icon name="arrow-left" size={25} color={green} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                marginLeft: 5,
                fontWeight: 'bold',
                fontSize: 20,
              }}>
              Employment and Training Search
            </Text>
          </View>
          <View style={styles.group}>
            <Text style={{...styles.label, fontWeight: 'normal'}}>
              {!isAdmin
                ? '  Any of these conditions applied to you?'
                : 'Conditions applied'}
            </Text>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <View
              style={{
                marginRight: 5,
                width: 7,
                height: 7,
                backgroundColor: 'black',
                borderRadius: 10,
              }}
            />
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>Pregancy</Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#E5E5E5', true: '#006940'}}
                thumbColor={pregancy ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => !isAdmin && setPregancy(!pregancy)}
                value={pregancy}
              />
            </View>
          </View>

          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <View
              style={{
                marginRight: 5,
                width: 7,
                height: 7,
                backgroundColor: 'black',
                borderRadius: 10,
              }}
            />
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                Attending School
              </Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#E5E5E5', true: '#006940'}}
                thumbColor={school ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => !isAdmin && setSchool(!school)}
                value={school}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 5,
            }}>
            <View
              style={{
                marginRight: 5,
                width: 7,
                height: 7,
                backgroundColor: 'black',
                borderRadius: 10,
              }}
            />
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                Taking care of child 12 months or less
              </Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#E5E5E5', true: '#006940'}}
                thumbColor={child ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => !isAdmin && setChild(!child)}
                value={child}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 15,
            }}>
            <View
              style={{
                marginRight: 5,
                width: 7,
                height: 7,
                backgroundColor: 'black',
                borderRadius: 10,
              }}
            />
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>None</Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#E5E5E5', true: '#006940'}}
                thumbColor={other ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => !isAdmin && setOther(!other)}
                value={other}
              />
            </View>
          </View>
          {other && otherRecords && (
            <FlatList
              data={otherRecords}
              renderItem={(item, index) => {
                console.log('Item', item);
                return (
                  <View key={index} style={styles.card}>
                    <View>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 18,
                          marginBottom: 4,
                        }}>
                        {item.item.name}
                      </Text>
                      <Text style={{fontSize: 12}}>
                        community: {item.item.community}
                      </Text>
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: 20,
                        bottom: 0,
                      }}>
                      <TouchableOpacity style={{padding: 15}}>
                        <Icon name="border-color" size={25} color={green} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
          {other && otherRecords.length < 3 && (
            <View>
              <View style={styles.group}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.dropdown}>
                  <Picker
                    style={{width: '100%'}}
                    mode="dropdown"
                    iosIcon={
                      <Icon name="chevron-down" color={'black'} size={20} />
                    }
                    enabled={isAdmin ? false : true}
                    selectedValue={otherType}
                    onValueChange={text => setOtherType(text)}>
                    <Picker.Item label="Employer" value={'employer'} />
                    <Picker.Item label="Training Program" value={'training'} />
                  </Picker>
                </View>
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>
                  {otherType == 'employer'
                    ? 'Name of Employer'
                    : 'Name of Training Program'}
                </Text>
                <InputField
                  // borderColor={usernameError ? 'red' : textFieldBorder }
                  placeholder={'Enter name'}
                  onChangeText={text => {
                    setName(text);
                  }}
                  value={name}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Community</Text>
                <InputField
                  // borderColor={usernameError ? 'red' : textFieldBorder }
                  placeholder={'Enter community name'}
                  onChangeText={text => {
                    setCommunity(text);
                  }}
                  value={community}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Date applied</Text>
                <DatePicker
                  disabled={isAdmin}
                  // borderColor={usernameError ? 'red' : textFieldBorder }
                  onChange={date => setDateApplied(date)}
                  value={moment.utc(new Date()).format('YYYY-MM-DD')}
                />
              </View>
              <View style={styles.group}>
                <Text style={{...styles.label, fontWeight: 'normal'}}>
                  {!isAdmin
                    ? 'Please upload related document'
                    : 'Related documents'}
                </Text>
              </View>
              <View style={{marginTop: 10}}>
                <View style={styles.card}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                    }}>
                    <Text style={styles.cardHeading}>Supporting Document</Text>
                    <Text style={styles.fileType}>*png, jpg or pdf</Text>
                  </View>
                  <View style={{marginTop: 15}}>
                    <UploadButton
                      text={!isAdmin ? 'Upload' : 'View'}
                      onPress={() => {
                        setIsImageViewModal(true);
                        downloadDoc();
                      }}
                    />
                  </View>
                </View>
              </View>
              {!isAdmin && (
                <View style={{marginTop: 10}}>
                  <AddButton
                    text={'Add'}
                    onPress={() => {
                      var d = {
                        type: otherType,
                        name: name,
                        community: community,
                        dateApplied: dateApplied,
                      };
                      var items = [...otherRecords];
                      items.push(d);
                      setName(null);
                      setCommunity(null);
                      setDateApplied(null);
                      setOtherRecords(items);
                    }}
                  />
                </View>
              )}
              <View
                style={{
                  paddingVertical: 20,
                  backgroundColor: primaryBGColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate(
                        state.applicationData[step - 1]?.back_nav,
                      )
                    }
                    style={{
                      width: Dimensions.get('screen').width / 2.3,
                      marginRight: 12,
                      borderRadius: 50,
                    }}>
                    <LinearGradient
                      colors={['#0B7E51', '#006940']}
                      style={styles.linearGradient}>
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
                      state.applicationData[step].completed
                        ? props.navigation.navigate(
                            state.applicationData[step - 1].next_nav,
                          )
                        : Toast.show('Next step is incompleted ', Toast.LONG);
                    }}
                    style={{
                      width: Dimensions.get('screen').width / 2.3,
                      borderRadius: 50,
                    }}>
                    <LinearGradient
                      colors={['#0B7E51', '#006940']}
                      style={styles.linearGradient}>
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
            </View>
          )}
          {other == false ||
            (otherRecords.length >= 3 && (
              <View
                style={{
                  paddingVertical: 20,
                  backgroundColor: primaryBGColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: other ? 10 : 0,
                }}>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate(
                        state.applicationData[step - 1]?.back_nav,
                      )
                    }
                    style={{
                      width: Dimensions.get('screen').width / 2.3,
                      marginRight: 12,
                      borderRadius: 50,
                    }}>
                    <LinearGradient
                      colors={['#0B7E51', '#006940']}
                      style={styles.linearGradient}>
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
                    onPress={() =>
                      nextCompleted
                        ? props.navigation.navigate(
                            state.applicationData[step]?.next_nav,
                          )
                        : Toast.show('Next step is incompleted ', Toast.LONG)
                    }
                    style={{
                      width: Dimensions.get('screen').width / 2.3,
                      borderRadius: 50,
                    }}>
                    <LinearGradient
                      colors={['#0B7E51', '#006940']}
                      style={styles.linearGradient}>
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
            ))}
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isImageViewModal}>
        <View style={{...styles.centeredView}}>
          <View style={styles.modalView}>
            <View style={{position: 'absolute', top: 7, right: 7}}>
              <TouchableOpacity
                style={{padding: 10}}
                onPress={() => {
                  setIsImageViewModal(false);
                }}>
                <Icon
                  onPress={() => {
                    setIsImageViewModal(false);
                  }}
                  name={'close'}
                  color={'red'}
                  size={23}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                alignItems: 'center',
                width: Dimensions.get('window').width - 40,
                marginVertical: 40,
                paddingHorizontal: 25,
              }}>
              <Text style={styles.modal_title}>Document View</Text>
              <Text style={styles.modal_title_image}>{fileName}</Text>
              {imageLoading ? (
                <ActivityIndicator
                  size={'small'}
                  color={green}
                  style={{width: '100%', height: '55%', marginVertical: 15}}
                />
              ) : fileName.split('.')[1] === 'pdf' ? (
                <View
                  style={{
                    width: '100%',
                    height: '65%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{fontSize: 17, color: '#cc0000'}}>
                    {'View restricted...'}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: '55%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: 15,
                  }}>
                  <Image
                    source={{uri: modelImage}}
                    style={{width: '100%', height: '100%'}}
                  />
                </View>
              )}

              <TouchableOpacity
                onPress={() => checkPermission(modelImage)}
                style={{
                  height: 65,
                  width: 200,
                  borderRadius: 50,
                }}>
                <LinearGradient
                  colors={['#0B7E51', '#006940']}
                  style={styles.linearGradient}>
                  {downloadLoading ? (
                    <ActivityIndicator size={'small'} color={'#fff'} />
                  ) : (
                    <Text style={{fontSize: 18, color: 'white'}}>Download</Text>
                  )}
                  <View style={{position: 'absolute', right: 10}}>
                    <Icon name={'chevron-right'} size={30} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
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
    flex: 0.6,
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
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    flexDirection: 'row',
    height: 60,
    // width: '100%',
  },
  group: {
    marginTop: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
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
  centeredView: {
    flex: 1,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalView: {
    width: Dimensions.get('screen').width / 1.1,
    zIndex: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    height: '58%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modal_title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 5,
  },
  modal_title_image: {
    fontWeight: '400',
    fontSize: 15,
  },
  modal_sub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default EmploymentTrainingForm;
