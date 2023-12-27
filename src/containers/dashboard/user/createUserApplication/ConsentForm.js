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
import {AppContext} from '../../../../context/AppContext';
import {finalConsent} from '../../../../servercalls/userApplication';
import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
  setSignatureBase64,
} from '../../../../utils/strings';
import moment from 'moment';
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

const PROFILE_DOCUMENT_CATEGORY = [
  'SIGNATURE',
  'RESUME',
  'EMPLOYMENT',
  'BANK_ACCOUNT',
  'HEALTH_CARD',
  'GOVT_ID',
  'SIN_VERIFICATION',
  'UNEMPLOYABILITY',
];

const ConsentForm = props => {
  const appItem = props.route.params.item;

  const [state, dispatch] = useContext(AppContext);
  const [documents, setDocuments] = useState(null)
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [user, setUser] = useState(state?.user?.firstName + " " + state?.user?.lastName  ?? '');
  const [signature, setSignature] = useState(
    state.signatureBase64 ? state.signatureBase64.img : null,
  );
  const [signatureId, setSignatureId] = useState(null);
  const allowSubmit = PROFILE_DOCUMENT_CATEGORY?.every((cat) =>
    documents?.find((doc) => doc?.category === cat)
    );

      console.log("==============AllowSubmit==================", allowSubmit, documents)

  useEffect(() => {
    fetchDocuments();
    setConsent(appItem?.isConsented);
  }, []);

  useEffect(() => {
    const docSig = appItem.dbDocList.filter(item => {
      return item.category === DocumentCategory.SIGNATURE;
    });
    if (docSig.length !== 0) {
      downloadDoc(docSig[0].name, appItem.dbDocList);
    }
  }, []);

  const downloadDoc = (file, localList) => {
    let currDoc;
    if (localList.length !== 0) {
      currDoc = localList.filter(i => {
        console.log(i, 'item');
        return i.name == file;
      });
    }
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

  const submit = async () => {
    if (consent == false) {
      BannerNotification.show('', AlertMessages.CONSENT_VALIDATION, 'error');
    } else {
      const payload = {
        id: state?.applicationId, //1601,
        completedStepNumber: 8,
        isConsented: consent,
        status: 'SUBMITTED',
        submittedOn: new Date(),

        userProfile: {
          id: state?.user?.id,
        },
      };
      let response = await finalConsent(
        payload,
        state?.user?.accessToken,
        state?.applicationId,
      );
      if (response.status === 200) {
        props.navigation.pop();
      } else {
        // alert('Unable to submit the form, please try again.');
        BannerNotification.show(
          '',
          AlertMessages.FORM_SUBMISSION_FAILED,
          'error',
        );
      }
    }
  };

  const fetchDocuments = async () => {
    let response = await getDocumentsByUserId(
      state?.user?.id,
      state?.user?.accessToken,
    );
    if (response.status === 200) {
      setDocuments(response?.data)
      // get document one by one and store it in the respective states.
      response.data.map(item => {
        if (item.type === DocumentType.SIGNATURE) {
          setSignatureId(item.id);
        }
      });
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
      } else {
        setLoading(false);
      }
    } else {
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }
  };

  const fetchSignature = async () => {
    let response = await getDocumentsById(
      signatureId,
      state?.user?.accessToken,
    );
    if (response.status === 200) {
      // get document one by one and store it in the respective states.
      if (response.data) {
        setSignature(response.data.bytes);
      }
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
              <Icon name="arrow-left" size={25} color={green} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                marginLeft: 5,
                fontWeight: 'bold',
                fontSize: 22,
              }}>
              Client Consent Form
            </Text>
          </View>
          {!allowSubmit && <View>
          <Text
              style={{
                marginVertical: 10,
                fontSize: 14,
                lineHeight: 25,
                textAlign: 'justify',
                color: "#f07d12"
              }}>
             <Icon name="alert" size={20} color={"#f07d12"} /> In order to submit application, please upload required documents in profile documents section.
              </Text>
          </View>}
          <View>
            <Text
              style={{
                marginVertical: 10,
                fontSize: 14,
                lineHeight: 25,
                textAlign: 'justify',
              }}>
              I give my consent to authorize Lac La Ronge Indian Band Social
              Development department to obtain any information from any person,
              agency or organization to determine and/or verify my eligibility
              for benefits or service under the Income Assistance Program. I
              understand that this authorization includes information such as
              source and amount of my needs, income, financial resources,
              assets, employment records, marital status, medical records, and
              living arrangements of myself or family members sand amount of
              benefits or my entitlement to benefits under other programs. I
              understand examples include, but are not restricted to,
              information or documents from: Maintenance Enforcement, Human
              Resources and Skill Development Canada (Employment Insurance),
              Workers' Compensation Board, Saskatchewan Government Insurance,
              Saskatchewan Social Services, Provincial Training Allowance, any
              bank, credit union or other financial institution, any landlord
              and current and past employers.
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
            <Text
              style={{
                lineHeight: 25,
                fontSize: 14,
                textAlign: 'justify',
              }}>
              I also understand that it is my responsibility to inform the Lac
              La Ronge Indian Band Social Development immediately of any changes
              whatsoever in the information provided. I understand that it is a
              serious matter to provide fake information and/or fail to report
              any changes in the information provided. I declare that all the
              information provided is true and complete and I make this solemn
              declaration believing it to be true and knowing that it is of the
              same force and effect as if made by any oath. I understand that I
              have the right to appeal any decision made with respect to my
              application for income assistance.
            </Text>
          </View>
          <View style={{flexDirection: 'row', marginBottom: 10}}>
            <Text style={{fontWeight: 'bold', fontSize: 16, marginRight: 10}}>
              Name:
            </Text>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>
              {user ?? 'John Doe'}
            </Text>
          </View>
          <View style={{flexDirection: 'row', marginBottom: 20}}>
            <Text style={{fontWeight: 'bold', fontSize: 16, marginRight: 20}}>
              Date:
            </Text>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>
              {moment().format('L')}
            </Text>
          </View>
          <View style={{marginVertical: 10}}>
            {signature != '' && signature != null && (
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
                {/* <View style={{position: 'absolute', top: 5, right: 5}}>
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
                </View> */}
              </View>
            ) 
            // : (
            //   <UploadButton
            //     loading={loading}
            //     text={'Add signature'}
            //     onPress={true}
            //     onDismiss={(image, i) => {
            //       console.log(image, 'Recevieved Iamge', i);
            //       handleDismiss('Sig', image, i);
            //       // seterrSinDoc(false);
            //     }}
            //   />
            // )
          }
          </View>
          {/* <View style={{marginVertical: 10}}>
            {(signature != '' && signature != null) ||
            (state.signatureBase64 !== null &&
              state.signatureBase64.img !== null) ? (
              <View style={styles.card}>
                <Image
                  source={{
                    uri:
                      state.signatureBase64 === null
                        ? signature
                        : `data:image/png;base64,${state.signatureBase64.img}`,
                  }}
                  style={{
                    width: '100%',
                    height: Dimensions.get('screen').width / 3.5,
                  }}
                />
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
                onPress={submit}
                disabled={!allowSubmit}
                style={{
                  width: Dimensions.get('screen').width / 2.3,
                  borderRadius: 50,
                }}>
                <LinearGradient
                  colors={['#0B7E51', '#006940']}
                  style={styles.linearGradient}>
                  <Text
                    style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
                    Submit
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

export default ConsentForm;
