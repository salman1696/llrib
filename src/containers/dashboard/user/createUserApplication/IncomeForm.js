import React, {useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../../utils/colors';
import InputField from '../../../../components/InputField';
import AddButton from '../../../../components/AddButton';
import UploadButton from '../../../../components/UploadButton';
import Header from '../../../../components/Header';
import {Container, Picker, Switch} from 'native-base';
import DatePicker from '../../../../components/CustomDatePicker';
import {
  skipApplicationSkep,
  submitExemptIncomeInfo,
} from '../../../../servercalls/userApplication';
import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
} from '../../../../utils/strings';
import {AppContext} from '../../../../context/AppContext';
import {
  uploadFile,
  getDocPresignedUrl,
  uploadDocumentOnPresignedUrl,
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

const IncomeForm = props => {
  const appItem = props.route.params.item;

  const [state, dispatch] = useContext(AppContext);

  const [ccb, setCcb] = useState(false);
  const [gst, setGST] = useState(false);
  const [deposite, setDeposite] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [isImageViewModal, setImageViewModal] = useState(false);
  const [modelImage, setModelImage] = useState('');
  const [fileName, setFileName] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  let img;

  console.log(
    '==================ApplicationCompleteStepNumber===============',
    state?.application?.completedStepNumber,
  );

  useEffect(() => {
    setCcb(appItem?.isExemptCcb);
    setGST(appItem?.isExemptGst);
    setDeposite(appItem?.isExemptAmountDirectDeposit);
  }, []);

  useEffect(() => {
    console.log(appItem, 'ooooo');
    const docSig = appItem?.dbDocList?.filter(item => {
      return item.category === DocumentCategory.TAX_NOA;
    });
    if (docSig && docSig?.length !== 0) {
      setAssessment(docSig[0].name);
      // setFileName(docSig[0].path);
      //  downloadDoc(docSig[0].name, appItem.dbDocList);
    }
  }, []);

  const downloadDoc = (file, localList) => {
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
    getDocument(currDoc[0]?.path);
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

  const handleSkip = async () => {
    const payload = {
      id: state?.applicationId,
      completedStepNumber:
        state?.application?.completedStepNumber >= 3
          ? state?.application?.completedStepNumber
          : 3,
      userProfile: {
        id: state?.user?.id,
      },
    };
    let response = await skipApplicationSkep(
      payload,
      state?.applicationId,
      state?.user?.accessToken,
    );
    if (response.status === 200) {
      props.navigation.pop();
    } else {
      alert('Unable to skip this step, please try again.');
    }
  };

  const submit = async () => {
    if (ccb == false && gst == false && deposite == false) {
      BannerNotification.show('', 'Please select an option.', 'error');
    } else if (assessment == null) {
      BannerNotification.show(
        '',
        'Please upload an assessment document.',
        'error',
      );
    } else {
      const payload = {
        id: state?.applicationId, //1601,
        completedStepNumber:
          state?.application?.completedStepNumber >= 3
            ? state?.application?.completedStepNumber
            : 3,
        isExemptCcb: ccb,
        isExemptGst: gst,
        isExemptAmountDirectDeposit: deposite,
        userProfile: {
          id: state?.user?.id,
        },
      };
      let response = await submitExemptIncomeInfo(
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
          'error',
        );
      }
    }
  };

  const uploadDocument = async formData => {
    let success = false;
    try {
      let response = await uploadFile(formData, state?.user?.accessToken);
      console.log('**RESPONSE**', response);
      if (response.status === 200) {
        success = true;
      }
    } catch (err) {
      console.log('Error in uploading Profile image', err);
    }
    return success;
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
    console.log(image, '=====upload to s3');
    const filename = getFileName(i === 'doc' ? image?.name : image?.path);
    // const extension = getFileExtension(i === 'pdf' ? image.name : filename);
    const extension = getFileExtension(filename);
    const payload = {
      type: DocumentType.TAX_NOA,
      category: DocumentCategory.TAX_NOA,
      mimeType: image.mime ?? 'image/jpeg',
      name: DocumentName.taxNOA + `.${extension}`,
      applicationId: state.applicationId,
    };
    setAssessment('Uploading...');
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

      const path = await uploadDocumentOnPresignedUrl(
        presignedUrl.data?.url,
        i === 'doc' ? image.uri : image.path,
        extension,
      );
      if (path?.status == 200) {
        setAssessment(payload.name);
        postDocuments({
          ...payload,
          userProfile: {
            id: state?.user?.id,
          },
        });
      }
    } else {
      setAssessment(null);
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }
    return;

    // commented by _SA , old code
    // var formData = new FormData();
    // if (type == 'assessment') {
    //   const path = image.path.split('/');
    //   const filename = path[path.length - 1];
    //   setAssessment('Uploading...');

    //   formData.append('name', filename);
    //   formData.append('category', DocumentCategory.SIN_VERIFICATION);
    //   formData.append('type', DocumentType.GST_ASSESSMENT);
    //   formData.append('file', {
    //     name: filename,
    //     type: image.mime,
    //     uri:
    //       Platform.OS === 'ios'
    //         ? image.path.replace('file://', '')
    //         : image.path,
    //   });
    //   formData.append('userProfile.id', state?.user?.id);
    //   formData.append('application.id', state?.applicationId);
    //   console.log('**GOV DOCUMENT**', formData);
    //   (async () => {
    //     let response = await uploadDocument(formData);
    //     if (response) {
    //       setAssessment(filename);
    //     } else {
    //       setAssessment(null);
    //       alert(
    //         'Unable to upload document at the moment, please try again later.',
    //       );
    //     }
    //   })();
    // }
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
              Exempted Income
            </Text>
            <TouchableOpacity
              onPress={handleSkip}
              style={{paddingHorizontal: 10}}>
              <Text
                style={{
                  color: green,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                {'Skip >>'}
              </Text>
            </TouchableOpacity>
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
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>CCB</Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setCcb(!ccb)}
                value={ccb}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
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
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>GST</Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setGST(!gst)}
                value={gst}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
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
                Direct deposit
              </Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setDeposite(!deposite)}
                value={deposite}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
              />
            </View>
          </View>
          <View>
            <View style={styles.group}>
              <Text style={{...styles.label, fontWeight: 'normal'}}>
                Please upload related document
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
                  <Text style={styles.cardHeading}>Notice of assessment</Text>
                  <Text style={styles.fileType}>*png, jpg or pdf</Text>
                </View>
                {assessment && (
                  <TouchableOpacity
                    onPress={() => (
                      setImageViewModal(true),
                      downloadDoc(assessment, appItem.dbDocList)
                    )}
                    style={{flexDirection: 'row', paddingVertical: 10}}>
                    <Text style={{textAlign: 'left', flex: 1}}>
                      {assessment}
                    </Text>
                    <TouchableOpacity onPress={() => setAssessment(null)}>
                      <Icon name="close" size={20} color={'red'} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                <View style={{marginTop: 15}}>
                  <UploadButton
                    text={'Upload'}
                    onPress={true}
                    onDismiss={(image, i) =>
                      handleDismiss('assessment', image, i)
                    }
                  />
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              paddingVertical: 20,
              backgroundColor: primaryBGColor,
              justifyContent: 'center',
              alignItems: 'center',
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
    marginTop: 25,
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

export default IncomeForm;
