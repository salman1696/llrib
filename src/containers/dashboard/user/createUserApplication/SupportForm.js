import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../../utils/colors';
import InputField from '../../../../components/InputField';
import AddButton from '../../../../components/AddButton';
import UploadButton from '../../../../components/UploadButton';
import Header from '../../../../components/Header';
import {Container, Picker, Switch} from 'native-base';
import DatePicker from '../../../../components/CustomDatePicker';
import {AppContext} from '../../../../context/AppContext';
import {skipApplicationSkep, submitOtherSupportForm} from '../../../../servercalls/userApplication';
import {
  AlertMessages,
  DocumentCategory,
  DocumentName,
  DocumentType,
} from '../../../../utils/strings';
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
import BannerNotification from '../../../../components/BannerNotification';

const SupportForm = props => {
  const appItem = props.route.params.item;

  const [state, dispatch] = useContext(AppContext);

  const [amount, setAmount] = useState(0);

  const [cpp, setCpp] = useState(false);
  const [childMaintenance, setChildMaintenance] = useState(false);
  const [verification, setVerification] = useState(null);
  console.log("==================ApplicationCompleteStepNumber===============", state?.application?.completedStepNumber)
  useEffect(() => {
    setAmount(appItem?.otherSupportAmount);
    setCpp(appItem?.isOtherSupportCpp);
    setChildMaintenance(appItem?.isOtherSupportChildCare);
  }, []);

  const submit = async () => {
    if (cpp == false && childMaintenance == false) {
      // alert('Please select an option.');
      BannerNotification.show('', 'Plese select an option.', 'error');
    } else if (amount == '' || amount == null || amount < 0) {
      // alert('Amount must be more than 0.');
      BannerNotification.show('', 'Amount must be more than 0.', 'error');
    } else {
      const payload = {
        id: state?.applicationId, //1601,
        completedStepNumber: state?.application?.completedStepNumber >= 4 ? state?.application?.completedStepNumber : 4,
        isOtherSupportCpp: cpp,
        isOtherSupportChildCare: childMaintenance,
        otherSupportAmount: amount,
        userProfile: {
          id: state?.user?.id,
        },
      };
      let response = await submitOtherSupportForm(
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
      } else {
        alert(response.data.title);
      }
    }, 1000);
  }

  // const uploadDocument = async formData => {
  //   let success = false;
  //   try {
  //     let response = await uploadFile(formData, state?.user?.accessToken);
  //     console.log('**RESPONSE**', response);
  //     if (response.status === 200) {
  //       success = true;
  //     }
  //   } catch (err) {
  //     console.log('Error in uploading Profile image', err);
  //   }
  //   return success;
  // };

  const handleSkip = async () => {
    const payload = {
      id: state?.applicationId,
      completedStepNumber: state?.application?.completedStepNumber >= 4 ? state?.application?.completedStepNumber : 4,
      userProfile: {
        id: state?.user?.id,
      },
    };
    console.log('Skip Payload', payload);
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

  const handleDismiss = async (type, image, i) => {
    const filename = getFileName(i === 'doc' ? image?.name : image?.path);
    // const extension = getFileExtension(i === 'pdf' ? image.name : filename);
    const extension = getFileExtension(filename);
    const payload = {
      type: DocumentType.GST_ASSESSMENT,
      category: DocumentCategory.SIN_VERIFICATION,
      mimeType: image.mime ?? 'image/jpeg',
      name: DocumentName.verification + `.${extension}`,
      applicationId: state.applicationId,
    };
    setVerification('Uploading...');

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
        setVerification(payload.name);
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

    var formData = new FormData();
    if (type == 'verification') {
      const path = image.path.split('/');
      const filename = path[path.length - 1];
      setVerification('Uploading...');

      formData.append('name', filename);
      formData.append('category', DocumentCategory.SIN_VERIFICATION);
      formData.append('type', DocumentType.GST_ASSESSMENT);
      formData.append('file', {
        name: filename,
        type: image.mime,
        uri:
          Platform.OS === 'ios'
            ? image.path.replace('file://', '')
            : image.path,
      });
      formData.append('userProfile.id', state?.user?.id);
      formData.append('application.id', state?.applicationId);
      console.log('**GOV DOCUMENT**', formData);
      (async () => {
        let response = await uploadDocument(formData);
        if (response) {
          setVerification(filename);
        } else {
          setVerification(null);
          alert(
            'Unable to upload document at the moment, please try again later.',
          );
        }
      })();
    }
  };

  console.log(amount, '==========================> ammount');
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
              Other Supports
            </Text>
            <TouchableOpacity style={{paddingHorizontal: 10}} onPress={handleSkip}>
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
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>CPP</Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setCpp(!cpp)}
                value={cpp}
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
              Child Expanse and Child Allowance
              </Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setChildMaintenance(!childMaintenance)}
                value={childMaintenance}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
              />
            </View>
          </View>
          <View>
            <View style={styles.group}>
              <Text style={styles.label}>Enter Amount</Text>
              <View
                style={{
                  ...styles.textfield,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name="currency-usd"
                  color={'black'}
                  size={25}
                  style={{marginHorizontal: 7}}
                />
                <TextInput
                  value={amount}
                  keyboardType={'number-pad'}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 250}}
                  style={{paddingVertical: Platform.OS == 'ios' ? 12 : 0, width: "85%"}}
                  onChangeText={text => {
                    setAmount(text);
                  }}
                />
              </View>
            </View>

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
  textfield: {
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    borderRadius: 5,
    color: 'black',
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
});

export default SupportForm;
