import React, {useContext, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor} from '../../../../utils/colors';
import Card from '../../../../components/Card';
import UploadButton from '../../../../components/UploadButton';
import Header from '../../../../components/Header';
import {Container, Content} from 'native-base';
import {AppContext} from '../../../../context/AppContext';
import {useEffect} from 'react/cjs/react.development';
import Toast from 'react-native-simple-toast';
import RNFetchBlob from 'rn-fetch-blob';
import {getFileExtension} from '../../../../helpers/Utils';
import {getPresignedUrlToGetDocuments} from '../../../../servercalls/fetchFiles';

const ResidencyDeclarationForm = props => {
  const [state, dispatch] = useContext(AppContext);
  const [modelImage, setModelImage] = useState('');
  const [fileName, setFileName] = useState('');
  const [imageViewModal, setImageViewModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [appData, setAppData] = useState({});
  const {item} = props?.route?.params;
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;
  const appItem = state?.application;
  const step = 5;
  let mApplication = '';
  let nextCompleted = false;
  useEffect(() => {
    state.applicationData.map(elm => {
      if (elm.step_id === step) {
        mApplication = elm;
      }
      if (elm.step_id === step + 1) {
        nextCompleted = elm?.completed;
      }
    });
    // console.log(nextCompleted);
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
        setImageViewModal(false);
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
      category: 'ON_RESERVE_RESIDENCE',
      file: null,
      id: 5009,
      name: 'utility-bill.jpg',
      path: 'user/4254/ON_RESERVE_RESIDENCE/UTILITY_BILL/utility-bill.jpg',
      type: 'UTILITY_BILL',
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
    <Container>
      <Content
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{flex: 1}}>
        <Header />
        <View style={styles.container}>
          <View
            style={{
              marginBottom: 10,
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
              On-Reserve Residency Declaration
            </Text>
          </View>
          {!isAdmin && (
            <View style={{alignItems: 'flex-end', marginBottom: 15}}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon color={green} name="download" size={22} />
                <Text style={{color: green, fontSize: 16, fontWeight: 'bold'}}>
                  {'Download Form'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Text
                adjustsFontSizeToFit
                style={{...styles.cardHeading, flex: 1}}>
                On-Reserve Residency Declaration Form
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                paddingTop: 3,
              }}>
              <Text adjustsFontSizeToFit style={styles.description}>
                Signed by the landlord
              </Text>
              <Text adjustsFontSizeToFit style={styles.fileType}>
                *png, jpg or pdf
              </Text>
            </View>
            <View style={{marginTop: 15}}>
              <UploadButton
                text={!isAdmin ? 'Upload' : 'View'}
                onPress={() => {}}
              />
            </View>
          </View>
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.cardHeading}>
                Utility Bill <Text style={styles.fileType}>(Optional)</Text>
              </Text>
              <Text style={styles.fileType}>*png, jpg or pdf</Text>
            </View>
            <View>
              <Text style={{fontSize: 12, marginTop: 3}}>
                Residence utility bill
              </Text>
            </View>
            <View style={{marginTop: 15}}>
              <UploadButton
                text={!isAdmin ? 'Upload' : 'View'}
                onPress={() => {
                  setImageViewModal(true);
                  downloadDoc();
                }}
              />
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
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
                    style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
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
                        state.applicationData[step - 1]?.next_nav,
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
                    style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={imageViewModal}>
          <View style={{...styles.centeredView}}>
            <View style={styles.modalView}>
              <View style={{position: 'absolute', top: 7, right: 7}}>
                <TouchableOpacity
                  style={{padding: 10}}
                  onPress={() => {
                    setImageViewModal(false);
                  }}>
                  <Icon
                    onPress={() => {
                      setImageViewModal(false);
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
                      <Text style={{fontSize: 18, color: 'white'}}>
                        Download
                      </Text>
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
      </Content>
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
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    height: 150,
    borderColor: '#ededed',
    borderWidth: 1,
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileType: {
    flex: 0.5,
    fontSize: 12,
    color: 'lightgray',
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  description: {
    flex: 0.5,
    fontSize: 12,
    // marginTop: 3,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    flexDirection: 'row',
    height: 55,
    width: '100%',
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

export default ResidencyDeclarationForm;
