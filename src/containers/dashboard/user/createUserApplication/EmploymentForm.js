import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Modal,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../../utils/colors';
import Card from '../../../../components/Card';
import UploadButton from '../../../../components/UploadButton';
import Header from '../../../../components/Header';
import {Container, Content, Picker} from 'native-base';
import {AppContext} from '../../../../context/AppContext';
import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
} from '../../../../utils/strings';
import {submitUnEmploymentForm} from '../../../../servercalls/userApplication';
import {
  getDocPresignedUrl,
  uploadDocumentOnPresignedUrl,
  uploadFile,
} from '../../../../servercalls/uploadFiles';
import {
  getFileExtension,
  getFileName,
  getPathFromUrl,
} from '../../../../helpers/Utils';
import {postDetailsAction} from '../../../../servercalls/profile';
import RNFetchBlob from 'rn-fetch-blob';
import {getPresignedUrlToGetDocuments} from '../../../../servercalls/fetchFiles';
import BannerNotification from '../../../../components/BannerNotification';

const EmploymentForm = props => {
  const appItem = props.route.params.item;

  const [state, dispatch] = useContext(AppContext);

  const [reason, setReason] = useState('');
  const [healthDoc, setHealthDoc] = useState(null);

  const [isImageViewModal, setImageViewModal] = useState(false);
  const [modelImage, setModelImage] = useState('');
  const [fileName, setFileName] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  console.log("==================ApplicationCompleteStepNumber===============", state?.application?.completedStepNumber)

  useEffect(() => {
    setReason(appItem?.unemployabilityReason);
  }, []);

  useEffect(() => {
    const docSig = appItem?.dbDocList?.filter(item => {
      return (
        item.category === DocumentCategory.UNEMPLOYABILITY &&
        item.type === appItem?.unemployabilityReason
      );
    });
    console.log(docSig, 'doooooc');
    if (docSig?.length !== 0) {
      docSig && setHealthDoc(docSig[0]?.name);
      //  downloadDoc(docSig[0].name, appItem.dbDocList);
    }
  }, []);

  const downloadDoc = (file, localList) => {
    console.log(file, '==============FILE-NAME============');
    let currDoc;
    if (localList?.length !== 0) {
      console.log(localList, '==============docList=>FOUND============');
      currDoc = localList?.filter(i => {
        console.log(i, 'item file');
        return i?.name == file;
      });
    }
    console.log(
      currDoc,
      state?.user.id,
      '==============FOUND in local============',
    );
    currDoc[0].path = `app/${appItem?.id}/user/${state?.user.id}/${currDoc[0].category}/${currDoc[0].type}/${currDoc[0].name}`;
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
    console.log('presssed');

    if (Platform.OS === 'ios') {
      // downloadImage();
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
        // console.log('res -> ', 'res');
        ToastAndroid.show(
          'Document Downloaded Successfully.',
          ToastAndroid.LONG,
        );
        // RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
        setDownloadLoading(false);
        setImageViewModal(false);
      });
  };

  const submit = async () => {
    if (reason == false) {
      BannerNotification.show('', AlertMessages.CONSENT_VALIDATION, 'error');
    } else if (reason && reason !== "NONE" && healthDoc == null) {
      BannerNotification.show('', 'Please upload a document.', 'error');
    } else {
      const payload = {
        id: state?.applicationId, //1601,
        completedStepNumber: state?.application?.completedStepNumber >= 7 ? state?.application?.completedStepNumber : 7,
        unemployabilityReason: reason,
        userProfile: {
          id: state?.user?.id,
        },
      };
      let response = await submitUnEmploymentForm(
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

  async function postDocuments(payload) {
    console.log(payload, 'paylaod');

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
        // props.navigation.navigate('user_dashboard');
        // setDocList([]);
        // AsyncStorage.setItem('hasDocumentsUploaded', 'false');
        // props.navigation.navigate('user_dashboard');
      } else {
        alert(response.data.title);
      }
    }, 1000);
  }

  const handleDismiss = async (type, image, i) => {
    console.log(image);
    const filename = getFileName(i === 'doc' ? image?.name : image?.path);
    // const extension = getFileExtension(i === 'pdf' ? image.name : filename);
    const extension = getFileExtension(filename);
    const payload = {
      type:
        reason == 'ATTEND_SCHOOL'
          ? DocumentType.ATTEND_SCHOOL
          : reason == 'HAVE_DEPENDENT'
          ? DocumentType.HAVE_DEPENDENT
          : DocumentType.MEDICAL_CONDITION,
      category: DocumentCategory.UNEMPLOYABILITY,

      mimeType: image.mime ?? 'image/jpeg',
      name:
        reason == 'ATTEND_SCHOOL'
          ? DocumentName.attendSchool + `.${extension}`
          : reason == 'HAVE_DEPENDENT'
          ? DocumentName.haveDependent + `.${extension}`
          : DocumentName.medicalCondition + `.${extension}`,

      applicationId: state.applicationId,
    };
    setHealthDoc('Uploading...');
    console.log(payload, 'Extension===========>');

    const presignedUrl = await getDocPresignedUrl(
      payload,
      state?.user?.accessToken,
    );

    console.log('["presigned upload response"]', presignedUrl.status == 200);

    if (presignedUrl.status == 200) {
      const filePathUrl = getPathFromUrl(
        presignedUrl?.data?.url,
        'application',
      );
      console.log(i === 'doc' ? image.uri : image.path);
      const path = await uploadDocumentOnPresignedUrl(
        presignedUrl.data?.url,
        i === 'doc' ? image.uri : image.path,
        extension,
      );
      if (path?.status == 200) {
        setHealthDoc(payload.name);
        postDocuments({
          ...payload,
          userProfile: {
            id: state?.user?.id,
          },
        });
      }
    } else {
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }

    return;

    // Commented by _SA => Reason: Not fexible in our case
    // var formData = new FormData();
    // const path = image.path.split('/');
    // // const filename = path[path.length - 1];
    // setHealthDoc('Uploading...');

    // formData.append('name', filename);
    // formData.append('category', DocumentCategory.SIN_VERIFICATION);
    // formData.append('type', DocumentType.GST_ASSESSMENT);
    // formData.append('file', {
    //   name: filename,
    //   type: image.mime,
    //   uri:
    //     Platform.OS === 'ios' ? image.path.replace('file://', '') : image.path,
    // });
    // formData.append('userProfile.id', state?.user?.id);
    // formData.append('application.id', state?.applicationId);
    // console.log('**GOV DOCUMENT**', formData);
    // (async () => {
    //   let response = await uploadDocument(formData);
    //   if (response) {
    //     setHealthDoc(filename);
    //   } else {
    //     setHealthDoc(null);
    //     alert(
    //       'Unable to upload document at the moment, please try again later.',
    //     );
    //   }
    // })();
  };

  return (
    <Container>
      <Header />
      <Content
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{flex: 1}}>
        <View style={styles.container}>
          <View
            style={{
              marginBottom: 25,
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
                fontSize: 22,
              }}>
              Unemployability
            </Text>
          </View>
          <View style={styles.group}>
            <Text style={styles.label}>
              Please select the reason of unemployment
            </Text>
            <View style={styles.dropdown}>
              <Picker
                style={{width: '100%'}}
                iosIcon={<Icon name="chevron-down" color={'black'} size={20} />}
                mode="dropdown"
                selectedValue={reason}
                onValueChange={text => setReason(text)}>
                <Picker.Item label="Select a reason" value={''} />
                <Picker.Item
                  label="None"
                  value={'NONE'}
                />
                <Picker.Item
                  label="Attending school, cannot work"
                  value={'ATTEND_SCHOOL'}
                />
                <Picker.Item
                  label="Have dependent children"
                  value={'HAVE_DEPENDENT'}
                />
                <Picker.Item
                  label="Medically not able to work"
                  value={'MEDICAL_CONDITION'}
                />
              </Picker>
            </View>
          </View>
          {!!reason && reason !== '' && reason !== 'NONE' && <View>
            <View style={{marginBottom: 10, marginTop: 30}}>
            <Text style={styles.label}>Please upload supporting document</Text>
          </View>
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Text style={styles.cardHeading}>
                {reason == 'MEDICAL_CONDITION'
                  ? 'Medical Form'
                  : reason == 'HAVE_DEPENDENT'
                  ? 'CCB / NOA'
                  : 'Registration Form'}
              </Text>
              <Text style={styles.fileType}>*png, jpg or pdf</Text>
            </View>
            {reason == 'MEDICAL_CONDITION' && (
              <View>
                <Text style={styles.description}>Signed by the Physician</Text>
              </View>
            )}
            {reason == 'ATTEND_SCHOOL' && (
              <View>
                <Text style={styles.description}>
                  Confirmation of registration from school
                </Text>
              </View>
            )}
            {healthDoc && (
              <TouchableOpacity
                onPress={() => (
                  setImageViewModal(true),
                  downloadDoc(healthDoc, appItem.dbDocList)
                )}
                style={{flexDirection: 'row', paddingVertical: 10}}>
                <Text style={{textAlign: 'left', flex: 1}}>{healthDoc}</Text>
                <TouchableOpacity onPress={() => setHealthDoc(null)}>
                  <Icon name="close" size={20} color={'red'} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            <View style={{marginTop: 15}}>
              <UploadButton
                text={'Upload'}
                onPress={true}
                onDismiss={(image, i) =>
                  handleDismiss('healthDocument', image, i)
                }
              />
            </View>
          </View>
          </View>
          }
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
                    style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
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
  card: {
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
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
    fontSize: 18,
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
    height: 55,
    width: '100%',
  },
  group: {
    marginTop: 10,
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

export default EmploymentForm;
