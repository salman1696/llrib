import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Platform,
  View,
  Alert,
  Image,
  ToastAndroid,
  PermissionsAndroid,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
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
import {useMemo} from 'react';
import {submitTrainingForm} from '../../../../servercalls/userApplication';
import {AppContext} from '../../../../context/AppContext';
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
import {config} from '../../../../config';
import {
  getFileExtension,
  getFileName,
  getPathFromUrl,
} from '../../../../helpers/Utils';
import {postDetailsAction} from '../../../../servercalls/profile';
import {
  delProgram,
  getDetailsAction,
  updateProgram,
} from '../../../../servercalls/user';
import {getPresignedUrlToGetDocuments} from '../../../../servercalls/fetchFiles';
import RNFetchBlob from 'rn-fetch-blob';
import BannerNotification from '../../../../components/BannerNotification';

const TrainingForm = props => {
  const appItem = props.route.params.item;

  const [state, dispatch] = useContext(AppContext);

  const [name, setName] = useState('');
  const [community, setCommunity] = useState('');
  const [dateApplied, setDateApplied] = useState(null);

  const [pregancy, setPregancy] = useState(false);
  const [child, setChild] = useState(false);
  const [school, setSchool] = useState(false);
  const [other, setOther] = useState(true);
  const [supportDoc, setSupportDoc] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [addNew, setAddNew] = useState(false);

  const [fetchedUpload, setFetchedUpload] = useState([]);
  const [otherRecords, setOtherRecords] = useState([]);
  const [otherType, setOtherType] = useState('');
  const [programId, setProgramId] = useState('');

  const [isImageViewModal, setImageViewModal] = useState(false);
  const [modelImage, setModelImage] = useState('');
  const [fileName, setFileName] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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
    setPregancy(appItem.isPregnanent);
    setChild(appItem.isHaveDependant);
    setSchool(appItem.isAttendingSchool);
    if (
      !appItem.isPregnanent &&
      !appItem.isHaveDependant &&
      !appItem.isAttendingSchool
    ) {
      setOther(true);
      getApplicationEmpTraining();
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

  const setUplaods = otherRecords => {
    const docSig = appItem.dbDocList.filter(item => {
      return item.category === DocumentCategory.JOB_TRAINING_SEARCH;
    });
    if (docSig.length !== 0) {
      setFetchedUpload(docSig);

      // if (i.type === DocumentType.JOB_POSTING) {
      setOtherRecords(
        otherRecords.map((elm, index) => {
          console.log(elm, '=============000000===========');
          return {...elm, img: docSig[index]};
          // if (elm.isJobSearch === true) {

          // }
        }),
      );
      // }

      // downloadDoc(docSig[0].name, appItem.dbDocList);
    }
  };

  const submit = async () => {
    let response = '';
    const payload = {
      isJobSearch: otherType == 'employer' ? true : false,
      name: name,
      community: community,
      dateApplied: dateApplied,
      application: {
        id: state?.applicationId,
        completedStepNumber: state?.application?.completedStepNumber >= 6 ? state?.application?.completedStepNumber : 6,
        isPregnanent: false,
        isHaveDependant: false,
        isAttendingSchool: false,
      },
      userProfile: {
        id: state?.user?.id,
      },
    };
    console.log('Payload', payload);
    response = await submitTrainingForm(
      payload,
      config.api.employmentTraining,
      'POST',
      state?.user?.accessToken,
      state?.applicationId,
    );
    console.log('Response from Training form submission', response);
    if (response.status === 200) {
      if (other) {
        // props.navigation.pop();
        setAddNew(false);
        showEdit(false);
        dateApplied(null);
        console.log(otherRecords);
      }
    } else {
      BannerNotification.show(
        '',
        AlertMessages.FORM_SUBMISSION_FAILED,
        'error',
      );
    }
  };

  const submitOnNext = async () => {
    let response = '';
    if (other && otherRecords.length < 3) {
      // alert(`Please provide ${3 - otherRecords.length} more records.`);
      BannerNotification.show(
        '',
        `Please provide ${3 - otherRecords.length} more records.`,
        'error',
      );
      return;
    }
    const payload = {
      id: state?.applicationId, //1601,
      completedStepNumber: state?.application?.completedStepNumber >= 6 ? state?.application?.completedStepNumber : 6,
      isPregnanent: pregancy,
      isHaveDependant: child,
      isAttendingSchool: school,
      userProfile: {
        id: state?.user?.id,
      },
    };
    console.log(payload, 'on next payload');
    response = await submitTrainingForm(
      payload,
      config.api.applications,
      'PUT',
      state?.user?.accessToken,
      state?.applicationId,
    );
    console.log('Response from Training form submission', response);
    if (response.status === 200) {
      props.navigation.pop();
    } else {
      BannerNotification.show(
        '',
        AlertMessages.FORM_SUBMISSION_FAILED,
        'error',
      );
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

  async function getApplicationEmpTraining() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      appItem.id,
      '/job-training-search-logs',
    );
    console.log('Response', response);

    if (response.status == 200) {
      if (Object.keys(response?.data).length != 0) {
        console.log(
          response.data,
          'Applications Emp Training data by application id',
        );
        setOtherRecords(response.data);
        setUplaods(response.data);
        // dispatch({
        //   type: application,
        //   payload: value,
        // });
      }
    } else {
      console.log(response);
      alert(response.data);
    }
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

    if (type === 'jobpost') {
      payload.type = DocumentType.JOB_POSTING;
      payload.category = DocumentCategory.JOB_TRAINING_SEARCH;
      payload.name =
        DocumentName.jobPosting +
        '-' +
        (otherRecords.length + 1) +
        '.' +
        extension;
      setSupportDoc('Uploading...');
    } else if (type === 'appform') {
      payload.type = DocumentType.APPLICATION_FORM;
      payload.category = DocumentCategory.JOB_TRAINING_SEARCH;
      payload.name =
        DocumentName.appliactoinForm +
        '-' +
        otherRecords.length +
        '.' +
        extension;
      setSupportDoc('Uploading...');
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

        if (type === 'jobpost') {
          setSupportDoc(payload.name);
        } else {
          setSupportDoc(payload.name);

          //   setUtility(payload.name);
        }
        postDocuments({
          ...payload,
          userProfile: {
            id: state?.user?.id,
          },
        });
      } else {
        alert(
          path?.data?.detail ?? 'Unable to upload document to presigned url.',
        );
      }
    } else {
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }
  };

  const UpdateProgram = async item => {
    try {
      // setUpLoading(true);

      // if (validations()) {

      let response = '';
      if (name == '' || name == null) {
        // alert('Please provide a valid employer name.');
        BannerNotification.show(
          '',
          'Please provide a valid employer name.',
          'error',
        );
        return;
      } else if (community == '' || community == null) {
        // alert('Please provide a valid community.');
        BannerNotification.show(
          '',
          'Please provide a valid community.',
          'error',
        );
        return;
      } else if (dateApplied == '' || dateApplied == null) {
        BannerNotification.show('', 'Please select a valid date.', 'error');
        return;
      }
      if (showEdit) {
        var payload = {
          id: item,
          isJobSearch: true,
          name: name,
          community: community,
          dateApplied: dateApplied,
          application: {
            id: state?.applicationId,
            completedStepNumber: state?.application?.completedStepNumber >= 6 ? state?.application?.completedStepNumber : 6,
            isPregnanent: false,
            isHaveDependant: false,
            isAttendingSchool: false,
          },
          userProfile: {
            id: state?.user?.id,
          },
        };

        let response = await updateProgram(
          payload,
          state?.user?.accessToken,
          item,
        );
        if (response.status === 200) {
          BannerNotification.show(
            '',
            'Data has been successfully updated.',
            'error',
          );

          getApplicationEmpTraining();
          setShowEdit(false);
          setAddNew(false);
        } else {
          // alert('Unable to create education record, please again');
          BannerNotification.show(
            '',
            AlertMessages.FORM_SUBMISSION_FAILED,
            'error',
          );
          console.log('Response from CreateEducation', response);
        }
      }
      // } else {
      //   setUpLoading(false);

      //   alert(AlertMessages.FillField_Validation);
      // }
    } catch (err) {
      // setUpLoading(false);

      alert('Unable to add Education Information ' + err);
    }
  };

  const editItem = item => {
    setProgramId(item?.id);
    setOtherType(item.isJobSearch == true ? 'employer' : 'training');
    setName(item?.name);
    setCommunity(item?.community);
    setDateApplied(item?.dateApplied);
    setSupportDoc(item?.img?.name);
    setShowEdit(true);
  };
  async function deleteProgram(itemId) {
    Alert.alert('Warning', 'Do you want to delete this record?', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          let response = await delProgram(
            state?.user?.accessToken,
            appItem.id,
            itemId,
          );
          if (response.status == 200) {
            console.log('yes pressed');

            getApplicationEmpTraining();
            ToastAndroid.show(
              'Record deleted successfully..',
              ToastAndroid.LONG,
            );
          } else {
            console.log(response);
            alert('err in deleted');
          }
        },
      },
    ]);
  }

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
              Any of these conditions applied to you?
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
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setPregancy(!pregancy)}
                value={pregancy}
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
                Attending School
              </Text>
            </View>
            <View>
              <Switch
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setSchool(!school)}
                value={school}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
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
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setChild(!child)}
                value={child}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
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
                trackColor={{false: '#ccc9c9', true: '#006940'}}
                thumbColor={'white'}
                ios_backgroundColor="#b5b3b3"
                onValueChange={() => setOther(true)}
                value={other}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
              />
            </View>
          </View>
          {other && !showEdit && !addNew && otherRecords.length !== 0 && (
            <>
              <View>
                <Text
                  style={{
                    ...styles.label,
                    fontWeight: 'normal',
                    marginBottom: '8%',
                  }}>
                  Please include information for 3 employers and/or training
                  programs below
                </Text>
              </View>

              <FlatList
                data={otherRecords}
                renderItem={(item, index) => {
                  console.log('Item', item);
                  return (
                    <View key={index} style={styles.card}>
                      <TouchableOpacity
                        onPress={() => editItem(item?.item ?? item)}>
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
                      </TouchableOpacity>

                      <View
                        style={{
                          justifyContent: 'center',
                          position: 'absolute',
                          right: 15,
                          alignSelf: 'center',
                          flex: 0.15,
                        }}>
                        <TouchableOpacity style={{padding: 15}}>
                          <Icon
                            name={'close'}
                            size={25}
                            color={'red'}
                            onPress={() => {
                              deleteProgram(item?.item?.id);
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            </>
          )}
          {other && (showEdit || addNew) && (
            <View>
              <View style={styles.group}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.dropdown}>
                  <Picker
                    style={{width: '100%'}}
                    iosIcon={
                      <Icon name="chevron-down" color={'black'} size={20} />
                    }
                    mode="dropdown"
                    selectedValue={otherType}
                    onValueChange={text => setOtherType(text)}>
                    <Picker.Item label="Select a type" value={''} />
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
                  value={name}
                  onChangeText={text => {
                    setName(text);
                  }}
                />
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Community</Text>
                <View style={styles.dropdown}>
                  <Picker
                    style={{height: 50}}
                    mode="dropdown"
                    selectedValue={community}
                    onValueChange={text => setCommunity(text)}>
                    <Picker.Item value={'LA_RONGE'} label={'La Ronge'} />
                    <Picker.Item value={'HALL_LAKE'} label={'Hall Lake'} />
                    <Picker.Item
                      value={'SUCKER_RIVER'}
                      label={'Sucker River'}
                    />
                  </Picker>
                </View>
              </View>
              <View style={styles.group}>
                <Text style={styles.label}>Date applied</Text>
                <DatePicker
                  editable={true}
                  init={dateApplied === null ? true : false}
                  // borderColor={usernameError ? 'red' : textFieldBorder }
                  value={dateApplied}
                  onChange={date => setDateApplied(date)}
                />
              </View>
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
                    <Text style={styles.cardHeading}>
                      {otherType == 'employer'
                        ? 'Attach copy of job posting'
                        : 'Attach copy of training application'}
                    </Text>
                    <Text style={styles.fileType}>*png, jpg or pdf</Text>
                  </View>
                  {supportDoc && (
                    <TouchableOpacity
                      onPress={() => (
                        setImageViewModal(true),
                        downloadDoc(supportDoc, appItem.dbDocList)
                      )}
                      style={{flexDirection: 'row', paddingVertical: 10}}>
                      <Text style={{textAlign: 'left', flex: 1}}>
                        {supportDoc}
                      </Text>
                      <TouchableOpacity onPress={() => setSupportDoc(null)}>
                        <Icon name="close" size={20} color={'red'} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                  <View style={{marginTop: 15}}>
                    <UploadButton
                      text={'Upload'}
                      onPress={true}
                      onDismiss={(image, i) =>
                        handleDismiss(
                          otherType == 'employer' ? 'jobpost' : 'appform',
                          image,
                          i,
                        )
                      }
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {other && (
            <View style={{marginTop: 15}}>
              <View
                style={{
                  marginTop: 15,
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                {(showEdit || addNew) && (
                  <AddButton
                    // isLoading={upLoading}
                    text={'Cancel'}
                    style={{
                      width: Dimensions.get('screen').width / 2.3,
                      borderColor: 'red',
                    }}
                    textStyle={{color: 'red'}}
                    onPress={() => (
                      //   setDegree(degreeTemp),
                      setShowEdit(false), setAddNew(false)
                    )}
                  />
                )}
                {(otherRecords.length < 3 || showEdit) && (
                  <AddButton
                    text={showEdit ? 'Update' : addNew ? 'Save' : 'Add New'}
                    //    isLoading={upLoading}
                    style={{
                      width:
                        showEdit || addNew
                          ? Dimensions.get('screen').width / 2.3
                          : Dimensions.get('screen').width - 40,
                    }}
                    // text={showEdit == true && addNew ? 'Add New' : 'Save'}
                    onPress={() => {
                      if (!showEdit && !addNew) {
                        setAddNew(true);
                        setName(null);
                        setCommunity(null);
                        setDateApplied(null);
                        setSupportDoc(null);
                        setOtherType('');
                      } else if (showEdit) {
                        console.log(programId, 'program ID');
                        UpdateProgram(programId);
                      } else if (addNew) {
                        if (name == '' || name == null) {
                          BannerNotification.show(
                            '',
                            'Please provide a valid employer name.',
                            'error',
                          );
                          return;
                        } else if (community == '' || community == null) {
                          BannerNotification.show(
                            '',
                            'Please provide a valid community',
                            'error',
                          );
                          return;
                        } else if (dateApplied == '' || dateApplied == null) {
                          BannerNotification.show(
                            '',
                            'Please select a valid date.',
                            'error',
                          );
                          return;
                        } else if (supportDoc == '' || supportDoc == null) {
                          BannerNotification.show(
                            '',
                            'Please upload a document.',
                            'error',
                          );
                          return;
                        }
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
                        setSupportDoc(null);
                        setOtherRecords(items);
                        submit();
                      }

                      //  if (addNew) {
                      //    AddDegree();
                      //  } else if (showEdit) {
                      //    UpdateDegree();
                      //  } else {
                      //    setAddNew(true);
                      //    setDegree([]);
                      //    setType('');
                      //    setIns('');
                      //    setGrade(1);
                      //    setDuration(1);
                      //  }
                    }}
                  />
                )}
              </View>
              <View
                style={{
                  height: 1,
                  marginVertical: 25,
                  width: '100%',
                  backgroundColor: 'lightgray',
                }}
              />
            </View>
          )}
          {
            <View
              style={{
                bottom: 0,
                paddingVertical: 20,
                backgroundColor: primaryBGColor,

                alignItems: 'center',
                marginBottom: other ? 10 : 0,
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
                  onPress={submitOnNext}
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
          }
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

export default TrainingForm;
