import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  ToastAndroid
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor} from '../../../../utils/colors';
import Card from '../../../../components/Card';
import UploadButton from '../../../../components/UploadButton';
import Header from '../../../../components/Header';
import {Container, Content, Picker} from 'native-base';
import {AppContext} from '../../../../context/AppContext';
import {submitResidencyForm} from '../../../../servercalls/userApplication';
import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
} from '../../../../utils/strings';
import {
  getPresignedUrl,
  uploadDocumentOnPresignedUrl,
  uploadFile,
} from '../../../../servercalls/uploadFiles';
import {
  getFileExtension,
  getFileName,
  getPathFromUrl,
} from '../../../../helpers/Utils';
import {postDetailsAction} from '../../../../servercalls/profile';
import {getPresignedUrlToGetDocuments} from '../../../../servercalls/fetchFiles';
import RNFetchBlob from 'rn-fetch-blob';
import BannerNotification from '../../../../components/BannerNotification';
import { config as urlConfig } from '../../../../config';

const ResidencyDeclaration = props => {
  const appItem = props.route.params.item;

  const [state, dispatch] = useContext(AppContext);

  const [signedDoc, setSignedDoc] = useState(null);
  const [utility, setUtility] = useState(null);

  const [isImageViewModal, setImageViewModal] = useState(false);
  const [community, setCommunity] = useState('LA_RONGE');
  const [modelImage, setModelImage] = useState('');
  const [fileName, setFileName] = useState('');
  const [formDownloading, setFormDownloading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  console.log("==================ApplicationCompleteStepNumber===============", state?.application?.completedStepNumber) 

  useEffect(() => {
    const docSig = appItem?.dbDocList?.filter(item => {
      return item.type === DocumentType.RESIDENCE_DECLARATION;
    });
    if (docSig.length !== 0) {
      setSignedDoc(docSig[0].name);
      //  downloadDoc(docSig[0].name, appItem.dbDocList);
    }
    const doc = appItem.dbDocList.filter(item => {
      return item.type === DocumentType.UTILITY_BILL;
    });
    if (doc.length !== 0) {
      setUtility(doc[0].name);
      //  downloadDoc(docSig[0].name, appItem.dbDocList);
    }
  }, []);

  const downloadDoc = (file, localList) => {
    console.log(file, localList, 'ddddd');

    console.log(file, '==============FILE-NAME============');
    let currDoc;
    if (localList.length !== 0) {
      console.log(localList, '==============docList=>FOUND============');
      currDoc = localList.filter(i => {
        console.log(i, 'item file');
        return i.name == file;
      });
    }
    console.log(
      currDoc,
      state?.user.id,
      '==============FOUND in local============',
    );
    currDoc[0].path = `app/${appItem.id}/user/${state.user.id}/${currDoc[0].category}/${currDoc[0].type}/${currDoc[0].name}`;
    getDocument(currDoc[0].path);
    setFileName(file);
    return;
    // getDocument(currDoc[0].path);
  };

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
       downloadImage(path);
    } else {
      try {
        setDownloadLoading(true);

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
      });
  };

  const checkFileDownloadPermission = async () => {
    console.log("======================PATHFILE=======================================", urlConfig.api.docs_url)
    // Function to check the platform
    // If iOS then start downloading
    // If Android then ask for permission
    setFormDownloading(true);
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
          setFormDownloading(false);
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
      url: `${urlConfig.api.docs_url}/generate-on-residency`,
      headers: { 
        'Authorization': `Bearer ${state?.user?.accessToken}`
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

     console.log(fPath,'fPath');
     
     if (Platform.OS === 'ios') {
         await fs.createFile(fPath, response.data, "base64");
     } else {
         await fs.writeFile(fPath, response.data, "base64");
     }
     setFormDownloading(false);
     ToastAndroid.show(
        'Document Downloaded Successfully.',
        ToastAndroid.LONG,
      );
    })
    .catch(function (error) {
      setFormDownloading(false);
      BannerNotification.show(
        '',
        'Failed to download residency deceleration form.',
        'error',
      );
      console.log("==============FileError====", error);
    });
  };

  async function postDocuments(payload) {
    let arr = [];
    arr.push(payload);
    setTimeout(async () => {
      console.log(payload, '========payloadtoUpload===========');
      let response = await postDetailsAction(
        state?.user?.accessToken,
        state?.user?.id,
        '/documents',
        arr,
      );
      console.log('Response', response);
      if (response.status == 200) {
        console.log('Uploaded Documents response');
      } else {
        alert(response.data.title);
      }
    }, 1000);
  }

  const handleDismiss = async (type, image, i) => {
    const filename = getFileName(i === 'doc' ? image?.name : image?.path);
    const extension = getFileExtension(filename);
    const payload = {
      type: '',
      category: '',
      mimeType: image.mime ?? 'image/jpeg',
      name: '',
      applicationId: state.applicationId,
    };

    if (type === 'signedDocument') {
      payload.type = DocumentType.RESIDENCE_DECLARATION;
      payload.category = DocumentCategory.ON_RESERVE_RESIDENCE;
      payload.name = DocumentName.residenceDeclaration + '.' + extension;
      setSignedDoc('Uploading...');
    } else if (type === 'utility') {
      payload.type = DocumentType.UTILITY_BILL;
      payload.category = DocumentCategory.ON_RESERVE_RESIDENCE;
      payload.name = DocumentName.utilityBill + '.' + extension;
      setUtility('Uploading...');
    }

    console.log(payload, '========> payload');
    const presignedUrl = await getPresignedUrl(
      payload,
      state?.user?.accessToken,
    );

    console.log('["presigned upload response"]', presignedUrl.status == 200);

    if (presignedUrl.status == 200) {
      const filePathUrl = getPathFromUrl(
        presignedUrl?.data?.url,
        'application',
      );

      const path = await uploadDocumentOnPresignedUrl(
        presignedUrl.data?.url,
        i === 'doc' ? image.uri : image.path,
      );
      if (path.status == 200) {
        console.log('yes inside');

        if (type === 'signedDocument') {
          setSignedDoc(payload.name);
        } else if (type === 'utility') {
          setUtility(payload.name);
        }
        postDocuments({
          ...payload,
          userProfile: {
            id: state?.user?.id,
          },
        });
      } else {
        if (type === 'signedDocument') {
          setSignedDoc(null);
        } else if (type === 'utility') {
          setUtility(null);
        }
        alert(
          path?.data?.detail ?? 'Unable to upload document to presigned url.',
        );
      }
    } else {
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }
  };

  const submit = async () => {
    if (signedDoc == null) {
      BannerNotification.show(
        '',
        'Please upload a residency declaration document.',
        'error',
      );
    } else {
      const payload = {
        id: state?.applicationId, //1601,
        completedStepNumber: state?.application?.completedStepNumber >= 5 ? state?.application?.completedStepNumber : 5,
        community: community,
        isResidencyDocUploaded: signedDoc ? true : false,
        isResidencyDocManually: utility ? true : false,
        userProfile: {
          id: state?.user?.id,
        },
      };
      let response = await submitResidencyForm(
        payload,
        state?.user?.accessToken,
        state?.applicationId,
      );
      if (response.status === 200) {
        props.navigation.pop();
      } else {
        BannerNotification.show(
          '',
          AlertMessages.FORM_SUBMISSION_FAILED,
          'success',
        );
      }
    }
  };

  return (
    <Container>
      <Header />
      <Content
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{flex: 1}}>
        <ScrollView style={{flex: 1}}>
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
            <View style={{alignItems: 'flex-end', marginBottom: 15}}>
              <TouchableOpacity
               onPress={checkFileDownloadPermission}
               disabled={formDownloading}
                style={{
                  paddingHorizontal: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                    {formDownloading ? (
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
                  {'Download Form'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>
                Community <Text style={styles.labelStrick}>*</Text>
              </Text>
              <View style={styles.community}>
                <Picker
                  style={{height: 50, width: '100%'}}
                  mode="dropdown"
                  iosIcon={
                    <Icon name="chevron-down" color={'black'} size={20} />
                  }
                  selectedValue={community}
                  onValueChange={text => setCommunity(text)}>
                  <Picker.Item value={'LA_RONGE'} label={'La Ronge'} />
                  <Picker.Item value={'HALL_LAKE'} label={'Hall Lake'} />
                  <Picker.Item value={'SUCKER_RIVER'} label={'Sucker River'} />
                </Picker>
              </View>
            </View>
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
              {signedDoc && (
                <TouchableOpacity
                  onPress={() => (
                    setImageViewModal(true),
                    downloadDoc(signedDoc, appItem.dbDocList)
                  )}
                  style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text style={{textAlign: 'left', flex: 1}}>{signedDoc}</Text>
                  <TouchableOpacity onPress={() => setSignedDoc(null)}>
                    <Icon name="close" size={20} color={'red'} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              <View style={{marginTop: 15}}>
                <UploadButton
                  text={'Upload'}
                  onPress={true}
                  onDismiss={(image, i) =>
                    handleDismiss('signedDocument', image, i)
                  }
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
                  {'Residence utility bill'}
                </Text>
              </View>
              {utility && (
                <TouchableOpacity
                  onPress={() => (
                    setImageViewModal(true),
                    downloadDoc(utility, appItem.dbDocList)
                  )}
                  style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text style={{textAlign: 'left', flex: 1}}>{utility}</Text>
                  <TouchableOpacity onPress={() => setUtility(null)}>
                    <Icon name="close" size={20} color={'red'} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              <View style={{marginTop: 15}}>
                <UploadButton
                  text={'Upload'}
                  onPress={true}
                  onDismiss={(image, i) => handleDismiss('utility', image, i)}
                />
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
              }}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={() => props.navigation.pop()}
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
                  onPress={submit}
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
        </ScrollView>
      </Content>
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
  community: {
    borderWidth: 1,
    marginTop: 7,
    paddingLeft: 12,
    paddingRight: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  group: {
    marginTop: 25,
    marginBottom: 20,
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
  card: {
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    // height: 150,
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

export default ResidencyDeclaration;
