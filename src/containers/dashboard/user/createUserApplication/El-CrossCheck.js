import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../../utils/colors';
import Header from '../../../../components/Header';
import {Container, Content, Picker} from 'native-base';
// import CheckBox from '@react-native-community/checkbox';
import {CheckBox} from 'native-base';
import {submitElCrossCheck} from '../../../../servercalls/userApplication';
import {postDetailsAction, removeDocumentsByDocId} from '../../../../servercalls/profile';
import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
  setSignatureBase64,
} from '../../../../utils/strings';
import {AppContext} from '../../../../context/AppContext';
import {
  getDocumentsById,
  getDocumentsByUserId,
} from '../../../../servercalls/profile';
import UploadButton from '../../../../components/UploadButton';
import {
  getFileExtension,
  getFileName,
  getPathFromUrl,
} from '../../../../helpers/Utils';
import {
  getDocPresignedUrl,
  uploadDocumentOnPresignedUrl,
} from '../../../../servercalls/uploadFiles';
import ImgToBase64 from 'react-native-image-base64';
import {getPresignedUrlToGetDocuments} from '../../../../servercalls/fetchFiles';
import BannerNotification from '../../../../components/BannerNotification';
import StyleConfig from '../../../../StyleConfig';


export const PROFILE_DOCUMENT_CATEGORY = [
  'SIGNATURE',
  'RESUME',
  'EMPLOYMENT',
  'BANK_ACCOUNT',
  'HEALTH_CARD',
  'GOVT_ID',
  'SIN_VERIFICATION',
  'UNEMPLOYABILITY',
];


const ElCrossCheck = props => {
  const appItem = props.route.params.item;

  const [state, dispatch] = useContext(AppContext);

  let imagepath;
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(appItem.isEiInfoAuthorized);
  const [signature, setSignature] = useState(null);
  const [signatureId, setSignatureId] = useState('');
  const [user, setUser] = useState(state?.user?.firstName + " " + state?.user?.lastName ?? '');
  console.log("state", appItem.isEiInfoAuthorized, appItem);
  console.log("==================ApplicationCompleteStepNumber===============", state?.application?.completedStepNumber)
  useEffect(() => {
    const docSig = appItem?.dbDocList?.filter(item => {
      return item.category === DocumentCategory.SIGNATURE;
    });
    console.log("DocSign", docSig);
    if (docSig && docSig?.length !== 0) {
      downloadDoc(docSig[0].name, appItem.dbDocList);
    }
  }, []);

 
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    let response = await getDocumentsByUserId(
      state?.user?.id,
      state?.user?.accessToken,
    );
    if (response.status === 200) {
      // get document one by one and store it in the respective states.
      response.data.map(item => {
        if (item.type === DocumentType.SIGNATURE) {
          setSignatureId(item.id);
        }
      });
    }
  };

 



  const createRecord = async () => {
    if (consent == false) {
      alert(AlertMessages.CONSENT_VALIDATION);
      BannerNotification.show('', AlertMessages.CONSENT_VALIDATION, 'error');
    } else if (signature == null) {
      BannerNotification.show('', AlertMessages.SIGNATURE_VALIDATION, 'error');
    } else {
      const payload = {
        id: state?.applicationId,
        completedStepNumber: state?.application?.completedStepNumber >= 1 ? state?.application?.completedStepNumber : 1,
        isEiInfoAuthorized: true,
        userProfile: {
          id: state?.user?.id,
        },
      };
      let response = await submitElCrossCheck(
        payload,
        state?.applicationId,
        state?.user?.accessToken,
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

  const handleDismiss = async (type, image, i) => {
    setLoading(true);
    console.log(image, '=====upload to s3');
    const filename = getFileName(i === 'doc' ? image?.name : image?.path);
    // const extension = getFileExtension(i === 'pdf' ? image.name : filename);
    const extension = getFileExtension(filename);
    const payload = {
      type: '',
      category: '',
      mimeType: image.mime ?? 'image/jpeg',
      name: '',
      applicationId: state.applicationId,
    };
    console.log(payload, 'Extension===========>');

    payload.type = DocumentType.SIGNATURE;
    payload.category = DocumentCategory.SIGNATURE;
    payload.name = DocumentName.signature + '-' + signature + `.${extension}`;

    let binary = image?.path;
    console.log(payload, 'payload');

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
        i === 'doc' ? image.uri : binary,
        extension,
      );
      if (path?.status == 200) {
        if (type == 'Sig') {
          setSignature(i === 'doc' ? image.uri : binary);
          setLoading(false);

          console.log(image.path, 'imagepath================>');
          ImgToBase64.getBase64String(i === 'doc' ? image.uri : image.path)
            .then(base64String => {
              dispatch({
                type: setSignatureBase64,
                payload: {img: base64String},
              });
              console.log(base64String);
            })
            .catch(err => console.log(err));
        }
        if (path?.status == 200) {
          postDocuments({
            ...payload,
            userProfile: {
              id: state?.user?.id,
            },
          });
        }
      } else {
        setLoading(false);
      }
    } else {
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
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

  async function removeDocfromDB() {
    if (signatureId) {
      let response = await removeDocumentsByDocId(
        state?.user?.id,
        state?.user?.accessToken,
        signatureId,
      );
      if (response.status == 200) {
        setSignature(null);
        dispatch({
          type: setSignatureBase64,
          payload: {img: null},
        });
      }
      else {
        alert(response.data.title);
      }
    }
    else {
      setSignature(null);
      dispatch({
        type: setSignatureBase64,
        payload: {img: null},
      });
    }
  }
  

  const downloadDoc = (file, localList) => {
    console.log(file, '==============FILE-NAME============');
    let currDoc;
    if (localList.length !== 0) {
      console.log(localList, '==============docList=>FOUND============');
      currDoc = localList.filter(i => {
        console.log(i, 'item');
        return i.name == file;
      });
    }
    console.log(
      currDoc,
      state?.user.id,
      '==============FOUND in local============',
    );
    currDoc[0].path = `user/${state.user.id}/${currDoc[0].category}/${currDoc[0].type}/${currDoc[0].name}`;
    getDocument(currDoc[0].path);
    return;

    // getDocument(currDoc[0].path);
  };

  const getDocument = async path => {
    // setImageLoading(true);

    let response = await getPresignedUrlToGetDocuments(
      {
        file: path,
      },
      state.user?.accessToken,
    );
    if (response.status === 200) {
      setSignature(response.data.url);
      // setImageLoading(false);
      console.log(response.data.url, 'looooggggg');
    } else {
      // setImageLoading(false);
      console.log(response, 'url fetched err');
    }
  };

  return (
    <Container>
      <ScrollView
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{}}>
        <Header />
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
              <Icon name="arrow-left" size={30} color={green} />
            </TouchableOpacity>
            <Text style={{fontWeight: 'bold', fontSize: 22, marginLeft: 8}}>
              El Cross Check Authorization
            </Text>
          </View>
          <View style={{marginBottom: 25, marginTop: 13}}>
            <Text
              style={{
                color: green,
                fontSize: 20,
                textTransform: 'uppercase',
                lineHeight: 25,
              }}>
              Specific Authorization to exchange, obtain or release information.
            </Text>
          </View>
          <View>
            <Text style={{textAlign: 'justify', lineHeight: 25}}>
              I{' '}
              <Text
                style={{
                  textDecorationLine: 'underline',
                  paddingHorizontal: 20,
                }}>
                {' '}
                {user}{' '}
              </Text>{' '}
              {
                'hereby authorize Lac la Ronge Indian Band Social Development to contact Service Canada at\n W-T-PPSB-STP-EI-AE-SERVICES-PRESTATIONS-DE-SERVICE-GD@servicecanada.gc.ca'
              }
            </Text>
            <Text
              style={{fontWeight: 'bold', marginVertical: 20, lineHeight: 25}}>
              To be used to determine my eligibility and/or entitlement for
              social assistance.
            </Text>
            <Text style={{marginVertical: 10, lineHeight: 25}}>
              With regard to my application or re-application for social
              assistance submitted to Social Development office, Box 480, La
              Ronge,SK. S0J 1L0
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 20,
              marginRight: 30,
            }}>
            <CheckBox
              color={green}
              checked={consent}
              onPress={() => {
                setConsent(!consent);
              }}
              style={styles.checkbox}
            />
            <Text style={{lineHeight: 25, textAlign: 'justify'}}>
              I understand the information transmitted or received will be
              treated as strictly confidential. Nothing in this release form
              authorizes a second party receiving information to release it or
              exchange it further without my specific permissions.{' '}
            </Text>
          </View>
          <View style={{marginVertical: 10}}>
            {signature != '' && signature != null ? (
              <View style={styles.card}>
                <Image
                  source={{
                    uri: signature,
                  }}
                  style={{
                    width: '100%',
                    height: Dimensions.get('screen').width / 3.5,
                  }}
                />
                <View style={{position: 'absolute', top: 5, right: 5}}>
                  <TouchableOpacity
                    style={{padding: 5, backgroundColor: 'white'}}
                    onPress={removeDocfromDB}>
                    <Icon name="close" size={20} color={'red'} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <UploadButton
                loading={loading}
                text={'Add signature'}
                onPress={true}
                onDismiss={(image, i) => {
                  console.log(image, 'Recevieved Iamge', i);
                  handleDismiss('Sig', image, i);
                  // seterrSinDoc(false);
                }}
              />
            )}
          </View>
          {/* <View style={{marginVertical: 10}}>
            {(signature != '' && signature != null) ||
            state.signatureBase64 !== null ? (
              <View style={styles.card}>
                {state.signatureBase64 ? (
                  <Image
                    source={{
                      uri:
                        signature === null
                          ? `data:image/png;base64,${state.signatureBase64.img}`
                          : imagepath,
                    }}
                    style={{
                      width: '100%',
                      height: Dimensions.get('screen').width / 3.5,
                    }}
                  />
                ) : (
                  downloadDoc(DocumentName.signature, appItem.dbDocList)
                )}
                <View style={{position: 'absolute', top: 5, right: 5}}>
                  <TouchableOpacity
                    style={{padding: 5, backgroundColor: 'white'}}
                    onPress={() => {
                      setSignature(null);
                      dispatch({
                        type: setSignatureBase64,
                        payload: {img: null},
                      });
                    }}>
                    <Icon name="close" size={20} color={'red'} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <UploadButton
                loading={loading}
                text={'Add signature'}
                onPress={true}
                onDismiss={(image, i) => {
                  console.log(image, 'Recevieved Iamge', i);
                  handleDismiss('Sig', image, i);
                  // seterrSinDoc(false);
                }}
              />
            )}
          </View> */}
          <View
            style={{
              alignSelf: 'flex-end',
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
                onPress={createRecord}
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  fileType: {flex: 0.4, fontSize: 12, color: 'lightgray', paddingBottom: 3},
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
  checkbox: {
    borderRadius: StyleConfig.dimensions.borderRadius,
    marginLeft: StyleConfig.dimensions.margin * -0.3,
    paddingLeft: StyleConfig.dimensions.margin * -1,
    marginRight: StyleConfig.dimensions.margin * 0.75,
    paddingBottom: StyleConfig.dimensions.margin * -2,
  },
  addButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderColor: green,
    borderWidth: 1,
    borderRadius: 5,
  },
  addbutton_text: {
    fontSize: 18,
    color: green,
  },
});

export default ElCrossCheck;
