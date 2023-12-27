import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  PermissionsAndroid,
  Modal,
  Pressable,
  Image,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import Card from '../../../components/Card';
import UploadButton from '../../../components/UploadButton';
import {Picker} from 'native-base';
import Header from '../../../components/Header';
import {
  getDetailsAction,
  getDocumentsByUserIdAdmin,
} from '../../../servercalls/admin';
import {AppContext} from '../../../context/AppContext';
import {
  DocumentCategory,
  DocumentName,
  DocumentType,
  setBankAccount,
  setSignatureBase64,
} from '../../../utils/strings';
import {
  getDocPresignedUrl,
  uploadDocumentOnPresignedUrl,
  uploadFile,
} from '../../../servercalls/uploadFiles';
import {
  getPresignedUrl,
  getPresignedUrlToGetDocuments,
} from '../../../servercalls/fetchFiles';

import {skipAStep} from '../../../servercalls/userApplication';
import {
  getFileExtension,
  getFileName,
  getPathFromUrl,
} from '../../../helpers/Utils';
import RNFS from 'react-native-fs';
import {
  fetchUserDependent,
  getDocumentsByUserIdUser,
  postDetailsAction,
  removeDocumentsByDocId,
} from '../../../servercalls/profile';
import {useIsFocused} from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import ImgToBase64 from 'react-native-image-base64';
import {useDispatch, useSelector} from 'react-redux';
import {updateReviewedStep, updateUserInfo} from '../../../slices/userSlice';
import {updateStepReviewStatus} from '../../../servercalls/user';
import moment from 'moment';
import GlobalStyles from '../../../GlobalStyles';

const UploadDocuments = props => {
  // console.log(props, 'pop');
  const item = props.route?.params?.item;

  const userMeta = useSelector(state => state.userMeta);
  const appDispatch = useDispatch();

  const [state, dispatch] = useContext(AppContext);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [govSingleDoc, setGovSingleDoc] = useState(null);
  const [govDoc, setGovDoc] = useState([]);
  const [errgovDoc, seterrGovDoc] = useState(null);
  const [govType, setGovType] = useState('');
  const [sinDoc, setSinDoc] = useState(null);
  const [sinTaxDoc, setSinTaxDoc] = useState([]);
  const [errsinDoc, seterrSinDoc] = useState(null);
  const [sinType, setSinType] = useState('');
  const [healthCard, setHealthCard] = useState([]);
  const [errhealthCard, seterrHealthCard] = useState(null);
  const [resume, setResume] = useState([]);
  const [errresume, seterrResume] = useState(null);
  const [empDoc, setEmpDoc] = useState(null);
  const [empType, setEmpType] = useState('');
  const [statement, setStatement] = useState([]);
  const [ccb, setCcb] = useState(null);
  const [errstatement, seterrStatement] = useState(false);
  const [hasDependent, setHasDependent] = useState(false);
  const [signature, setSignature] = useState('');
  const [errCcb, seterrCcb] = useState(false);
  const [errEmp, seterrEmp] = useState(false);
  const [errsignature, seterrSignature] = useState(false);
  const [docList, setDocList] = useState([]);
  const [dbDocList, setDbDocList] = useState([]);
  const [isImageViewModal, setImageViewModal] = useState(false);
  const [modelImage, setModelImage] = useState('');
  const [fileName, setFileName] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [uploading, setUploading] = useState({});

  const disabledUpload = Object.values(uploading)?.find(
    uploadingItem => uploadingItem == true,
  );
  const isFocused = useIsFocused();
  console.log(
    '========================Documents======================',
    dbDocList?.length,
  );
  useEffect(() => {
    // setDocList([

    !isAdmin
      ? (getDependentsDetail('/dependents', isAdmin ? item : state?.user),
        getDocuments(
          'user-profiles',
          state?.user?.id,
          state?.user?.accessToken,
        ))
      : getDocuments('admin/user-profile', item.id, state?.user?.accessToken);

    // Return the function to unsubscribe from the event so it gets removed on unmount
  }, [isFocused]);

  async function getDependentsDetail(endpoint2, item) {
    // console.log(state?.user, '[Current user]');
    let response = '';

    if (endpoint2 === '/dependents') {
      response = await fetchUserDependent(item.id, state?.user?.accessToken);
    }
    // setLoading(false);
    if (response.status == 200) {
      if (response.data.length === 0) {
        setHasDependent(false);
      } else {
        setHasDependent(true);
      }
    }
  }

  const validationDocument = () => {
    try {
      let response = true;
      if (govDoc == '' || govDoc == null) {
        seterrGovDoc(true);
        response = false;
      }
      if (sinDoc == '' || sinDoc == null) {
        seterrSinDoc(true);
        response = false;
      }
      if (healthCard == '' || healthCard == null) {
        seterrHealthCard(true);
        response = false;
      }
      if (resume == '' || resume == null) {
        seterrResume(true);
        response = false;
      }
      if (empDoc == '' || empDoc == null) {
        seterrEmp(true);
        response = false;
      }
      if (statement == '' || statement == null) {
        seterrStatement(true);
        response = false;
      }
      if (ccb == '' || ccb == null) {
        seterrCcb(true);
        response = false;
      }
      if (signature == '' || signature == null) {
        seterrSignature(true);
        response = false;
      }

      return response;
    } catch (err) {
      console.log('Error in validations', err);
    }
  };

  async function getDocuments(endpoint2, id, token) {
    let response = '';

    response = await getDocumentsByUserIdUser(endpoint2, id, token);

    if (response.status == 200) {
      console.log('get response of documents=> ', response);
      if (response.data.length !== 0) {
        setDbDocList(response.data);

        ////Signature DOC FETCHED
        const docSig = response.data.filter(item => {
          return item.category === DocumentCategory.SIGNATURE;
        });
        if (docSig.length !== 0) {
          setSignature(docSig[0].name);
        }

        ////GOV DOC FETCHED
        const docGov = response.data.filter(item => {
          return (
            item.category === DocumentCategory.GOVT_ID &&
            item.type !== DocumentType.BIRTH_CERTIFICATE
          );
        });
        if (docGov.length === 0) {
          const docGovBirth = response.data.filter(item => {
            return (
              item.category === DocumentCategory.GOVT_ID &&
              item.type === DocumentType.BIRTH_CERTIFICATE
            );
          });
          console.log(docGovBirth, 'doc birth');
          docGovBirth.length !== 0 &&
            setGovSingleDoc(
              docGovBirth.map(item => {
                return item.name;
              }),
            );
        } else {
          console.log(docGov, 'doc Gov no');
          docGov.length !== 0 &&
            setGovDoc(
              docGov.map(item => {
                return item.name;
              }),
            );
        }
        ////SIN DOC FETCHED
        const docSin = response.data.filter(item => {
          return (
            item.category === DocumentCategory.SIN_VERIFICATION &&
            item.type !== DocumentType.TAX_NOA
          );
        });
        if (docSin.length === 0) {
          const docSinTax = response.data.filter(item => {
            return (
              item.category === DocumentCategory.SIN_VERIFICATION &&
              item.type === DocumentType.TAX_NOA
            );
          });
          setSinTaxDoc(
            docSinTax.map(item => {
              return item.name;
            }),
          );
        } else {
          setSinDoc(
            docSin.map(item => {
              return item.name;
            }),
          );
        }
        ////HealthCard DOC FETCHED
        const docHealthCard = response.data.filter(item => {
          return (
            item.category === DocumentCategory.HEALTH_CARD &&
            item.type === DocumentType.HEALTH_CARD
          );
        });
        if (docHealthCard.length !== 0) {
          setHealthCard(
            docHealthCard.map(item => {
              return item.name;
            }),
          );
        }

        // Resume DOC FETCHED
        const docResume = response.data.filter(item => {
          return (
            item.category === DocumentCategory.RESUME &&
            item.type === DocumentType.RESUME
          );
        });
        console.log(docResume, 'fetched resumes iiii');

        if (docResume.length !== 0) {
          setResume(
            docResume.map(item => {
              return item.name;
            }),
          );
          console.log(resume, 'fetched resumes');
        }
        // EMPLOYMENT DOC FETCHED
        const docEmp = response.data.filter(item => {
          return item.category === DocumentCategory.EMPLOYMENT;
        });
        if (docEmp.length !== 0) {
          setEmpDoc(docEmp[0].name);
        }
        // BANK DOC FETCHED
        const docBnk = response.data.filter(item => {
          return item.category === DocumentCategory.BANK_ACCOUNT;
        });
        if (docBnk.length !== 0) {
          setStatement(
            docBnk.map(item => {
              return item.name;
            }),
          );
        }
        // CCB DOC FETCHED
        const docCCB = response.data.filter(item => {
          return item.category === DocumentCategory.UNEMPLOYABILITY;
        });
        if (docCCB.length !== 0) {
          setCcb(docCCB[0].name);
        }
      }
    } else {
      alert(response.data.title);
    }
  }
  async function postDocuments() {
    setTimeout(async () => {
      console.log(docList, '========Doclist===========');
      let response = await postDetailsAction(
        state?.user?.accessToken,
        state?.user?.id,
        '/documents',
        docList,
      );
      if (response.status == 200) {
        console.log('Uploaded Documents response');
        // props.navigation.navigate('user_dashboard');
        setDocList([]);
        AsyncStorage.setItem('hasDocumentsUploaded', 'false');
        props.navigation.navigate('user_dashboard');
      } else {
        alert(response.data.title);
      }
    }, 1000);
  }
  async function removeDocfromDB(deleteItem) {
    // if (itemId !== undefined) {
    console.log('yes');
    let response = await removeDocumentsByDocId(
      state?.user?.id,
      state?.user?.accessToken,
      deleteItem.id,
    );
  }

  const handleSkip = async () => {
    console.log(!validationDocument(), 'clicked');
    const payload = {
      id: state?.user?.id,
      completedStepNumber: 9,
      userProfile: {
        id: state?.user?.id,
      },
    };
    let response = '';
    setDocList(
      docList.map(item => {
        const itemFound = dbDocList.find(
          o =>
            o.name.substr(0, o.name.indexOf('.')) ===
            item.name.substr(0, item.name.indexOf('.')),
        );
        if (itemFound !== undefined) {
          docList.pop();
          docList.push({
            ...item,
            id: itemFound.id,
          });
        } else {
          return item;
        }
      }),
    );
    if (!validationDocument()) {
      Alert.alert(
        'Warning',
        "If you don't provide required documents, your profile will be incompleted.",
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'Proceed',
            onPress: async () => {
              console.log(docList, 'list of data=============> inner');

              if (docList.length !== 0) {
                postDocuments();
                appDispatch(updateUserInfo(true));
              } else {
                response = await skipAStep(
                  payload,
                  state?.user?.id,
                  state?.user?.accessToken,
                );

                if (response.status === 200) {
                  AsyncStorage.setItem('hasDocumentsUploaded', 'false');
                  props.navigation.navigate('user_dashboard');
                } else {
                  alert('Unable to skip this step, please try again.');
                }
              }
            },
          },
        ],
      );
    } else {
      if (docList.length !== 0) {
        postDocuments();
      } else {
        response = await skipAStep(
          payload,
          state?.user?.id,
          state?.user?.accessToken,
        );

        if (response.status === 200) {
          AsyncStorage.setItem('hasDocumentsUploaded', 'true');
          props.navigation.navigate('user_dashboard');
        } else {
          alert('Unable to skip this step, please try again.');
        }
      }
    }
  };

  // useEffect(() => {
  //   console.log(docList, '======== from local items===========');
  // }, [docList]);

  const handleDismiss = async (type, image, i) => {
    setUploading({...uploading, [type]: true});
    console.log(image, '=====upload to s3');
    const filename = getFileName(i === 'doc' ? image?.name : image?.path);
    // const extension = getFileExtension(i === 'pdf' ? image.name : filename);
    const extension = getFileExtension(filename);
    const payload = {
      type: '',
      category: '',
      mimeType: image.mime ?? 'image/jpeg',
      name: '',
    };
    console.log(extension, 'Extension===========>');

    if (type == 'Gov') {
      payload.type = govType;
      payload.category = DocumentCategory.GOVT_ID;

      if (govType === DocumentType.TREATY_CARD) {
        setGovDoc([...govDoc, 'Uploading...']);
        payload.name =
          DocumentName.treatyCard + '-' + (govDoc.length + 1) + `.${extension}`;
      } else if (govType === DocumentType.BIRTH_CERTIFICATE) {
        setGovSingleDoc('Uploading...');
        payload.name = DocumentName.birthCertificate + `.${extension}`;
      } else if (govType === DocumentType.DRIVING_LICENSE) {
        setGovDoc([...govDoc, 'Uploading...']);
        payload.name =
          DocumentName.drivingLicense +
          '-' +
          (govDoc.length + 1) +
          `.${extension}`;
      } else if (govType === DocumentType.FIREARM_LICENSE) {
        setGovDoc([...govDoc, 'Uploading...']);
        payload.name =
          DocumentName.firearmLicense +
          '-' +
          (govDoc.length + 1) +
          `.${extension}`;
      } else if (govType === DocumentType.ID_CARD) {
        setGovDoc([...govDoc, 'Uploading...']);
        payload.name =
          DocumentName.idCard + '-' + (govDoc.length + 1) + `.${extension}`;
      }
    } else if (type == 'Sin') {
      payload.type = sinType;
      payload.category = DocumentCategory.SIN_VERIFICATION;
      if (sinType === DocumentType.SIN_CARD) {
        payload.name = DocumentName.sinCard + `.${extension}`;
        setSinDoc('Uploading...');
      } else if (sinType === DocumentType.SIN_PAPER) {
        payload.name = DocumentName.sinPaper + `.${extension}`;
        setSinDoc('Uploading...');
      } else if (sinType === DocumentType.GST_ASSESSMENT) {
        payload.name = DocumentName.gstAssessment + `.${extension}`;
        setSinDoc('Uploading...');
      } else if (sinType === DocumentType.CCB_LETTER) {
        payload.name = DocumentName.ccbLetter + `.${extension}`;
        setSinDoc('Uploading...');
      } else if (sinType === DocumentType.TAX_NOA) {
        setSinTaxDoc([...sinTaxDoc, 'Uploading...']);
        payload.name =
          DocumentName.taxNOA + '-' + (sinTaxDoc.length + 1) + `.${extension}`;
      } else if (sinType === DocumentType.ROE) {
        payload.name = DocumentName.roe + `.${extension}`;
        setSinDoc('Uploading...');
      }
    } else if (type == 'health') {
      payload.type = DocumentType.HEALTH_CARD;
      payload.category = DocumentCategory.HEALTH_CARD;
      setHealthCard([...healthCard, 'Uploading...']);
      payload.name =
        DocumentName.healthCard +
        '-' +
        (healthCard.length + 1) +
        `.${extension}`;
    } else if (type == 'resume') {
      payload.type = DocumentType.RESUME;
      payload.category = DocumentCategory.RESUME;

      setResume([...resume, 'Uploading...']);
      console.log(resume, 'resume 1111');
      payload.name =
        DocumentName.resume + '-' + (resume.length + 1) + `.${extension}`;
    } else if (type == 'employment') {
      payload.type = empType;
      payload.category = DocumentCategory.EMPLOYMENT;
      if (empType === DocumentType.ROE) {
        payload.name = DocumentName.roe + `.${extension}`;
      } else if (empType === DocumentType.PAY_STUB) {
        payload.name = DocumentName.paystub + `.${extension}`;
      }
      setEmpDoc('Uploading...');
    } else if (type == 'statement') {
      payload.type = DocumentType.BANK_STATEMENT;
      payload.category = DocumentCategory.BANK_ACCOUNT;
      setStatement([...statement, 'Uploading...']);
      payload.name =
        DocumentName.bankStatement +
        '-' +
        (statement.length + 1) +
        `.${extension}`;
    } else if (type == 'ccb') {
      payload.type = DocumentType.CCB_LETTER;
      payload.category = DocumentCategory.UNEMPLOYABILITY;
      payload.name = DocumentName.ccbLetter + `.${extension}`;
      setCcb('Uploading...');
    } else if (type == 'signature') {
      payload.type = DocumentType.SIGNATURE;
      payload.category = DocumentCategory.SIGNATURE;
      payload.name = DocumentName.signature + `.${extension}`;

      setSignature('Uploading...');
    }

    let binary = image?.path;

    const presignedUrl = await getDocPresignedUrl(
      payload,
      state?.user?.accessToken,
    );

    console.log('["presigned upload response"]', presignedUrl.status == 200);

    if (presignedUrl.status == 200) {
      const filePathUrl = getPathFromUrl(
        presignedUrl?.data?.url,
        'user_profile',
      );

      const path = await uploadDocumentOnPresignedUrl(
        presignedUrl.data?.url,
        i === 'doc' ? image.uri : binary,
        extension,
      );
      if (path?.status == 200) {
        let updateRecord = false;
        console.log('Doclist', docList);
        // docList && docList.length !== 0
        //   ? setDocList(
        //       docList.map(item => {
        //         console.log(
        //           item,
        //           '========loop from DB items===========',
        //           item.name.substr(0, item.name.indexOf('.')) ===
        //             payload.name.substr(0, payload.name.indexOf('.')),
        //         );
        //         if (
        //           item.name.substr(0, item.name.indexOf('.')) ===
        //           payload.name.substr(0, payload.name.indexOf('.'))
        //         ) {
        //           console.log('yes');
        //           return {...item, name: payload.name};
        //         } else {
        //           console.log('no');

        //           docList.push(payload);
        //         }
        //       }),
        //     )
        //   :
        setDocList(list => [
          ...list,
          {
            ...payload,
            userProfile: {
              id: state?.user?.id,
            },
          },
        ]);

        if (type == 'Gov') {
          if (govType === DocumentType.TREATY_CARD) {
            setGovDoc(gd =>
              gd.length === 1
                ? [payload.name]
                : gd.pop() && [...gd, payload.name],
            );
          } else if (govType === DocumentType.BIRTH_CERTIFICATE) {
            setGovSingleDoc(payload.name);
          } else if (govType === DocumentType.DRIVING_LICENSE) {
            setGovDoc(gd =>
              gd.length === 1
                ? [payload.name]
                : gd.pop() && [...gd, payload.name],
            );
          } else if (govType === DocumentType.FIREARM_LICENSE) {
            setGovDoc(gd =>
              gd.length === 1
                ? [payload.name]
                : gd.pop() && [...gd, payload.name],
            );
          } else if (govType === DocumentType.ID_CARD) {
            setGovDoc(gd =>
              gd.length === 1
                ? [payload.name]
                : gd.pop() && [...gd, payload.name],
            );
          }
        } else if (type == 'Sin') {
          if (sinType === DocumentType.SIN_CARD) {
            setSinDoc(payload.name);
          } else if (sinType === DocumentType.SIN_PAPER) {
            setSinDoc(payload.name);
          } else if (sinType === DocumentType.GST_ASSESSMENT) {
            setSinDoc(payload.name);
          } else if (sinType === DocumentType.CCB_LETTER) {
            setSinDoc(payload.name);
          } else if (sinType === DocumentType.TAX_NOA) {
            setSinTaxDoc(gd => gd.length && gd.pop() && [...gd, payload.name]);
          } else if (sinType === DocumentType.ROE) {
            setSinDoc(payload.name);
          }
        } else if (type == 'health') {
          setHealthCard(gd =>
            gd.length === 1
              ? [payload.name]
              : gd.pop() && [...gd, payload.name],
          );
        } else if (type == 'resume') {
          setResume(gd =>
            gd.length === 1
              ? [payload.name]
              : gd.pop() && [...gd, payload.name],
          );
          console.log(resume, 'resume');
        } else if (type == 'employment') {
          if (empType === DocumentType.ROE) {
            setEmpDoc(payload.name);
          } else if (empType === DocumentType.PAY_STUB) {
            setEmpDoc(payload.name);
          }
        } else if (type == 'statement') {
          setStatement(gd => gd.length && gd.pop() && [...gd, payload.name]);
          console.log(statement.length, 'length');
        } else if (type == 'ccb') {
          setCcb(payload.name);
        } else if (type == 'signature') {
          setSignature(payload.name);

          const base64 = '';

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
        alert(
          path?.data?.detail ?? 'Unable to upload document to presigned url.',
        );
        if (type === 'Gov') {
          setGovDoc(null);
        } else if (type === 'Sin') {
          setSinDoc(null);
        } else if (type === 'health') {
          setHealthCard(null);
        } else if (type === 'resume') {
          setResume(null);
        } else if (type === 'employment') {
          setEmpDoc(null);
        } else if (type === 'statement') {
          setStatement(null);
        } else if (type === 'ccb') {
          setCcb(null);
        } else if (type === 'signature') {
          setSignature(null);
        }
      }
      setUploading({...uploading, [type]: false});
    } else {
      setUploading({...uploading, [type]: false});
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }
  };

  const downloadDoc = (file, localList) => {
    let currDoc = dbDocList.filter(item => {
      return item.name === file;
    });
    let currDoclocal;

    if (currDoc.length === 0) {
      if (localList.length !== 0) {
        currDoclocal = localList.filter(i => {
          console.log(i, file, 'item');
          return i?.name === file;
        });
      }
      currDoclocal[0].path = `user/${state.user.id}/${currDoclocal[0].category}/${currDoclocal[0].type}/${currDoclocal[0].name}`;
      getDocument(currDoclocal[0].path);
      setFileName(file);
      return;
    }

    getDocument(currDoc[0].path);
    setFileName(file);
  };

  const checkPermission = async path => {
    // Function to check the platform
    // If iOS then start downloading
    // If Android then ask for permission

    if (Platform.OS === 'ios') {
      downloadImage(path);
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

  const getDocument = async path => {
    setImageLoading(true);

    let response = await getPresignedUrlToGetDocuments(
      {
        file: path,
      },
      state.user?.accessToken,
    );
    if (response.status === 200) {
      setModelImage(response.data.url);
      setImageLoading(false);
    } else {
      setImageLoading(false);
      console.log(response, 'url fetched err');
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
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            'Document downloaded successfully.',
            ToastAndroid.LONG,
          );
        } else {
          alert('Document download successfully.');
        }
        // RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
        setDownloadLoading(false);
        setImageViewModal(false);
      });
  };

  const updateReviewStatus = async () => {
    const payload = {
      isRequiredDocumentsAck: true,
      acknowledgedOn: moment().format('YYYY-MM-dd'),
    };
    const response = await updateStepReviewStatus(
      {isAddressAck: true, id: userMeta?.user?.id},
      userMeta?.user?.accessToken,
      userMeta?.user?.id,
    );
    console.log('response', response);
    if (response.status === 200) {
      appDispatch(
        updateReviewedStep({step: 'isRequiredDocumentsAck', status: true}),
      );
      appDispatch(
        updateReviewedStep({
          step: 'acknowledgedOn',
          status: moment().format('YYYY-MM-dd'),
        }),
      );
      setTimeout(() => {
        props.navigation.pop();
      }, 100);
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps={'handled'}
      style={{backgroundColor: primaryBGColor}}>
      {props.route && props.route?.params?.showHeader && <Header />}

      <View style={styles.container}>
        <View
          style={{
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {props.route &&
            props.route.params &&
            props.route.params.showHeader && (
              <TouchableOpacity
                onPress={() => props.navigation.pop()}
                style={{justifyContent: 'center'}}>
                <Icon name="arrow-left" size={25} color={green} />
              </TouchableOpacity>
            )}
          <Text
            style={{flex: 1, marginLeft: 5, fontWeight: 'bold', fontSize: 20}}>
            {isAdmin ? 'User documents' : 'Upload documents'}
          </Text>
        </View>
        <View>
          <View style={{marginTop: 20}}>
            <View style={styles.card}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                }}>
                <Text style={styles.cardHeading}>
                  Signature <Text style={styles.labelStrick}>*</Text>
                </Text>
                <Text style={styles.fileType}>*png/jpg </Text>
              </View>

              {signature ? (
                <TouchableOpacity
                  onPress={() => (
                    setImageViewModal(true), downloadDoc(signature, docList)
                  )}
                  style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text
                    style={{
                      textAlign: 'left',
                      flex: 1,
                      color: '#000',
                    }}>
                    {signature}
                  </Text>
                  {!isAdmin && (
                    <TouchableOpacity
                      onPress={() => {
                        const deleteItem = dbDocList?.find(
                          doc =>
                            doc?.category === 'SIGNATURE' &&
                            doc?.name === signature,
                        );
                        deleteItem && removeDocfromDB(deleteItem);
                        const filterDocs = dbDocList?.filter(i => {
                          return (
                            i?.category === 'SIGNATURE' && i.name === signature
                          );
                        });

                        setDocList(filterDocs);
                        setSignature(null);
                      }}>
                      {!errsignature && (
                        <Icon name="close" size={20} color={'red'} />
                      )}
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ) : (
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      marginTop: 3,
                      color: '#222',
                    }}>
                    {'Upload signature with white background'}
                  </Text>
                </View>
              )}

              {!isAdmin && (
                <View style={{marginTop: 15}}>
                  <UploadButton
                    text={'Upload'}
                    disabled={disabledUpload}
                    loading={uploading.signature}
                    onPress={true}
                    onDismiss={(image, i) => {
                      handleDismiss('signature', image, i);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
          <View>
            <View style={styles.card}>
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <Text style={styles.cardHeading}>
                  Government ID <Text style={styles.labelStrick}>*</Text>
                </Text>
                <Text style={styles.fileType}>*png, jpg or pdf</Text>
              </View>
              {govDoc.length !== 0 ? (
                govDoc.map(item => {
                  return (
                    <TouchableOpacity
                      onPress={() => (
                        setImageViewModal(true), downloadDoc(item, docList)
                      )}
                      style={{flexDirection: 'row', paddingVertical: 10}}>
                      <Text style={{textAlign: 'left', color: '#000', flex: 1}}>
                        {item}
                      </Text>
                      {!isAdmin && (
                        <TouchableOpacity
                          onPress={() => {
                            const deleteItem = dbDocList?.find(
                              doc =>
                                doc?.category === 'GOVT_ID' &&
                                doc.name === item,
                            );
                            deleteItem && removeDocfromDB(deleteItem);
                            setGovDoc(
                              govDoc.filter(ir_item => {
                                return ir_item !== item;
                              }),
                            );
                            setDocList(
                              dbDocList?.filter(i => {
                                return (
                                  i?.category === 'GOVT_ID' &&
                                  i.name !== govSingleDoc
                                );
                              }),
                            );
                          }}>
                          <Icon name="close" size={20} color={'red'} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : govSingleDoc ? (
                <TouchableOpacity
                  onPress={() => (
                    setImageViewModal(true),
                    downloadDoc(govSingleDoc[0], docList)
                  )}
                  style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text style={{textAlign: 'left', flex: 1}}>
                    {govSingleDoc}
                  </Text>
                  {!isAdmin && (
                    <TouchableOpacity
                      onPress={() => {
                        const deleteItem = dbDocList?.find(
                          doc =>
                            doc?.category === 'GOVT_ID' &&
                            doc.name === govSingleDoc,
                        );
                        deleteItem && removeDocfromDB(deleteItem);
                        setDocList(
                          dbDocList?.filter(i => {
                            return (
                              i?.category === 'GOVT_ID' &&
                              i.name !== govSingleDoc
                            );
                          }),
                        );

                        setGovSingleDoc(null);
                      }}>
                      <Icon name="close" size={20} color={'red'} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ) : (
                !isAdmin && (
                  <>
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          marginTop: 3,
                          color: '#222',
                        }}>
                        {
                          'Ex. SGI License/ID, Treaty card, Firearm card, Birth certificate (upload both sides where applicable)'
                        }
                      </Text>
                    </View>
                    <View style={styles.dropdown}>
                      <Picker
                        iosIcon={
                          <Icon name="chevron-down" color={'black'} size={20} />
                        }
                        mode="dropdown"
                        style={{width: '100%'}}
                        selectedValue={govType}
                        onValueChange={setGovType}>
                        <Picker.Item
                          label="Select a Government Document"
                          value={''}
                        />
                        <Picker.Item
                          label="Birth Certificate"
                          value={'BIRTH_CERTIFICATE'}
                        />
                        <Picker.Item
                          label="Driving License"
                          value={'DRIVING_LICENSE'}
                        />
                        <Picker.Item
                          label="Firearm License"
                          value={'FIREARM_LICENSE'}
                        />
                        <Picker.Item
                          label="SGI License/ID Card"
                          value={'ID_CARD'}
                        />
                        <Picker.Item
                          label="Treaty Card"
                          value={'TREATY_CARD'}
                        />
                      </Picker>
                    </View>
                  </>
                )
              )}
              {!isAdmin && (
                <View style={{marginTop: 15}}>
                  <UploadButton
                    text={'Upload'}
                    disabled={disabledUpload}
                    loading={uploading.Gov}
                    onPress={() =>
                      govType === '' &&
                      (govDoc.length == 0 || govSingleDoc == null)
                        ? alert('Please select the type of the document...')
                        : govDoc.length === 2
                        ? alert(
                            'Please remove the uploads in order upload new file',
                          )
                        : true
                    }
                    onDismiss={(image, i) => {
                      handleDismiss('Gov', image, i);
                      seterrGovDoc(false);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
          <View>
            <View style={styles.card}>
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <Text style={styles.cardHeading}>
                  SIN Verification <Text style={styles.labelStrick}>*</Text>
                </Text>
                <Text style={styles.fileType}>*png, jpg or pdf</Text>
              </View>
              {sinTaxDoc.length !== 0 ? (
                sinTaxDoc.map(item => {
                  return (
                    <TouchableOpacity
                      onPress={() => (
                        setImageViewModal(true), downloadDoc(item, docList)
                      )}
                      style={{flexDirection: 'row', paddingVertical: 10}}>
                      <Text style={{textAlign: 'left', color: '#000', flex: 1}}>
                        {item}
                      </Text>
                      {!isAdmin && (
                        <TouchableOpacity
                          onPress={() => {
                            const deleteItem = dbDocList?.find(
                              doc =>
                                doc?.category === 'SIN_VERIFICATION' &&
                                doc.name === item,
                            );
                            deleteItem && removeDocfromDB(deleteItem);
                            setSinTaxDoc(
                              sinTaxDoc.filter(ir_item => {
                                return ir_item !== item;
                              }),
                            );
                            setDocList(
                              dbDocList?.filter(i => {
                                return (
                                  i?.category === 'SIN_VERIFICATION' &&
                                  i?.name !== item
                                );
                              }),
                            );
                          }}>
                          <Icon name="close" size={20} color={'red'} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : sinDoc ? (
                <TouchableOpacity
                  onPress={() => (
                    setImageViewModal(true), downloadDoc(sinDoc[0], docList)
                  )}
                  style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text style={{textAlign: 'left', flex: 1}}>{sinDoc}</Text>
                  {!isAdmin && (
                    <TouchableOpacity
                      onPress={() => {
                        const deleteItem = dbDocList?.find(
                          doc =>
                            doc?.category === 'SIN_VERIFICATION' &&
                            doc.name === sinDoc[0],
                        );
                        deleteItem && removeDocfromDB(deleteItem);
                        setDocList(
                          dbDocList?.filter(i => {
                            return (
                              i?.category === 'SIN_VERIFICATION' &&
                              i?.name !== sinDoc[0]
                            );
                          }),
                        );
                        setSinDoc(null);
                      }}>
                      <Icon name="close" size={20} color={'red'} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ) : (
                !isAdmin && (
                  <>
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          marginTop: 3,
                          color: '#222',
                        }}>
                        {
                          'Ex. CCB, GST, Income Tax NOA, SIN Card, SIN Paper (upload both sides where applicable)'
                        }
                      </Text>
                    </View>
                    <View style={styles.dropdown}>
                      <Picker
                        mode="dropdown"
                        iosIcon={
                          <Icon name="chevron-down" color={'black'} size={20} />
                        }
                        style={{width: '100%'}}
                        selectedValue={sinType}
                        onValueChange={setSinType}>
                        <Picker.Item
                          label="Select a SIN Verification"
                          value={''}
                        />
                        <Picker.Item
                          label="CCB"
                          value={DocumentType.CCB_LETTER}
                        />
                        <Picker.Item
                          label="GST"
                          value={DocumentType.GST_ASSESSMENT}
                        />
                        <Picker.Item
                          label="Income Tax NOA"
                          value={DocumentType.TAX_NOA}
                        />
                        <Picker.Item label="ROE" value={DocumentType.ROE} />
                        <Picker.Item
                          label="SIN Card"
                          value={DocumentType.SIN_CARD}
                        />
                        <Picker.Item
                          label="SIN Paper"
                          value={DocumentType.SIN_PAPER}
                        />
                      </Picker>
                    </View>
                  </>
                )
              )}
              {!isAdmin && (
                <View style={{marginTop: 15}}>
                  <UploadButton
                    text={'Upload'}
                    disabled={disabledUpload}
                    loading={uploading.Sin}
                    onPress={() =>
                      sinType === '' && (sinDoc === null || sinTaxDoc === null)
                        ? alert('Please select the type of the document...')
                        : true
                    }
                    onDismiss={(image, i) => {
                      handleDismiss('Sin', image, i);
                      seterrSinDoc(false);
                    }}
                    // onDismiss={image => console.log('Sin', image)}
                  />
                </View>
              )}
            </View>
          </View>
          <View>
            <View style={styles.card}>
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <Text style={styles.cardHeading}>
                  Health Card <Text style={styles.labelStrick}>*</Text>
                </Text>
                <Text style={styles.fileType}>*png, jpg or pdf</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 3,
                    color: '#222',
                  }}>
                  {'Upload both sides'}
                </Text>
              </View>
              {healthCard.length !== 0 &&
                healthCard.map(item => {
                  return (
                    <TouchableOpacity
                      onPress={() => (
                        setImageViewModal(true), downloadDoc(item, docList)
                      )}
                      style={{flexDirection: 'row', paddingVertical: 10}}>
                      <Text style={{textAlign: 'left', color: '#000', flex: 1}}>
                        {item}
                      </Text>
                      {!isAdmin && (
                        <TouchableOpacity
                          onPress={() => {
                            const deleteItem = dbDocList?.find(
                              doc =>
                                doc?.category === 'HEALTH_CARD' &&
                                doc.name === item,
                            );
                            deleteItem && removeDocfromDB(deleteItem);
                            setHealthCard(
                              healthCard.filter(ir_item => {
                                return ir_item !== item;
                              }),
                            );
                            setDocList(
                              dbDocList?.filter(i => {
                                return (
                                  i?.category === 'HEALTH_CARD' &&
                                  i?.name !== item
                                );
                              }),
                            );
                          }}>
                          <Icon name="close" size={20} color={'red'} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              {!isAdmin && (
                <View style={{marginTop: 15}}>
                  <UploadButton
                    text={'Upload'}
                    disabled={disabledUpload}
                    loading={uploading.health}
                    onPress={() =>
                      healthCard.length === 2
                        ? alert(
                            'Please remove the uploads in order upload new file',
                          )
                        : true
                    }
                    onDismiss={(image, i) => {
                      handleDismiss('health', image, i);
                      seterrHealthCard(false);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
          <View>
            <View style={styles.card}>
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <Text style={styles.cardHeading}>
                  Resume <Text style={styles.labelStrick}>*</Text>
                </Text>
                <Text style={styles.fileType}>*png, jpg or pdf</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 3,
                    color: '#222',
                  }}>
                  {''}
                </Text>
              </View>
              {resume.length !== 0 &&
                resume?.map(item => {
                  return (
                    <TouchableOpacity
                      onPress={() => (
                        setImageViewModal(true), downloadDoc(item, docList)
                      )}
                      style={{flexDirection: 'row', paddingVertical: 10}}>
                      <Text style={{textAlign: 'left', flex: 1}}>{item}</Text>
                      {!isAdmin && (
                        <TouchableOpacity
                          onPress={() => {
                            const deleteItem = dbDocList?.find(
                              doc =>
                                doc?.category === 'RESUME' && doc.name === item,
                            );
                            deleteItem && removeDocfromDB(deleteItem);
                            setResume(
                              resume.filter(ir_item => {
                                return ir_item !== item;
                              }),
                            );
                            setDocList(
                              dbDocList?.filter(i => {
                                return (
                                  i?.category === 'RESUME' && i?.name !== item
                                );
                              }),
                            );
                          }}>
                          <Icon name="close" size={20} color={'red'} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              {!isAdmin && (
                <View style={{marginTop: 15}}>
                  <UploadButton
                    onPress={true}
                    disabled={disabledUpload}
                    loading={uploading.resume}
                    text={'Upload'}
                    onDismiss={(image, i) => {
                      handleDismiss('resume', image, i);
                      seterrResume(false);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
          <View style={{marginVertical: 10}}>
            <View style={styles.card}>
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <Text style={styles.cardHeading}>
                  Employment <Text style={styles.labelStrick}>*</Text>
                </Text>
                <Text style={styles.fileType}>*png, jpg or pdf</Text>
              </View>
              {empDoc ? (
                <TouchableOpacity
                  onPress={() => (
                    setImageViewModal(true), downloadDoc(empDoc, docList)
                  )}
                  style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text style={{textAlign: 'left', flex: 1}}>{empDoc}</Text>
                  {!isAdmin && (
                    <TouchableOpacity
                      onPress={() => {
                        const deleteItem = dbDocList?.find(
                          doc =>
                            doc?.category === 'EMPLOYMENT' &&
                            doc.name === empDoc,
                        );
                        deleteItem && removeDocfromDB(deleteItem);
                        setDocList(
                          dbDocList?.filter(i => {
                            return (
                              i?.category === 'EMPLOYMENT' && i.name !== empDoc
                            );
                          }),
                        );
                        setEmpDoc(null);
                      }}>
                      <Icon name="close" size={20} color={'red'} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ) : (
                !isAdmin && (
                  <>
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          marginTop: 3,
                          color: '#222',
                        }}>
                        {
                          'Ex. ROE, Paystub (upload both sides where applicable)'
                        }
                      </Text>
                    </View>
                    <View style={styles.dropdown}>
                      <Picker
                        mode="dropdown"
                        style={{width: '100%'}}
                        iosIcon={
                          <Icon name="chevron-down" color={'black'} size={20} />
                        }
                        selectedValue={empType}
                        onValueChange={setEmpType}>
                        <Picker.Item
                          label="Select a Employment Document"
                          value={''}
                        />
                        <Picker.Item label="ROE" value={DocumentType.ROE} />
                        <Picker.Item
                          label="Paystub"
                          value={DocumentType.PAY_STUB}
                        />
                      </Picker>
                    </View>
                  </>
                )
              )}
              {!isAdmin && (
                <View style={{marginTop: 15}}>
                  <UploadButton
                    disabled={disabledUpload}
                    loading={uploading.employment}
                    onPress={() =>
                      empType === '' &&
                      (empDoc === null || sinTaxDoc.length === 0)
                        ? alert('Please select the type of the document...')
                        : true
                    }
                    text={'Upload'}
                    onDismiss={(image, i) =>
                      handleDismiss('employment', image, i)
                    }
                  />
                </View>
              )}
            </View>
          </View>
          {userMeta?.bankAccount?.length > 0 && (
            <View>
              <View style={styles.card}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                  }}>
                  <Text style={styles.cardHeading}>
                    Bank Statement <Text style={styles.labelStrick}>*</Text>
                  </Text>
                  <Text style={styles.fileType}>*png, jpg or pdf </Text>
                </View>

                {statement.length !== 0 ? (
                  statement.map(item => {
                    return (
                      <TouchableOpacity
                        onPress={() => (
                          setImageViewModal(true), downloadDoc(item, docList)
                        )}
                        style={{flexDirection: 'row', paddingVertical: 10}}>
                        <Text
                          style={{textAlign: 'left', color: '#000', flex: 1}}>
                          {item}
                        </Text>
                        {!isAdmin && (
                          <TouchableOpacity
                            onPress={() => {
                              const deleteItem = dbDocList?.find(
                                doc =>
                                  doc?.category === 'BANK_ACCOUNT' &&
                                  doc.name === item,
                              );
                              deleteItem && removeDocfromDB(deleteItem);
                              setStatement(
                                statement.filter(ir_item => {
                                  return ir_item !== item;
                                }),
                              );

                              setDocList(
                                dbDocList?.filter(i => {
                                  return (
                                    i?.category === 'BANK_ACCOUNT' &&
                                    i?.name !== item
                                  );
                                }),
                              );
                            }}>
                            <Icon name="close" size={20} color={'red'} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        marginTop: 3,
                        color: '#222',
                      }}>
                      {'Upload last 4 weeks bank statement'}
                    </Text>
                  </View>
                )}
                {!isAdmin && (
                  <View style={{marginTop: 15}}>
                    <UploadButton
                      disabled={disabledUpload}
                      loading={uploading.statement}
                      onPress={true}
                      text={'Upload'}
                      onDismiss={(image, i) => {
                        handleDismiss('statement', image, i);
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
          )}
          {hasDependent || isAdmin ? (
            sinDoc === 'ccb-letter' ? null : (
              <View>
                <View style={styles.card}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                    }}>
                    <Text style={styles.cardHeading}>
                      Canada Child Benefit{' '}
                      <Text style={styles.labelStrick}>*</Text>
                    </Text>
                    <Text style={styles.fileType}>*png, jpg or pdf </Text>
                  </View>

                  {ccb ? (
                    <TouchableOpacity
                      onPress={() => (
                        setImageViewModal(true), downloadDoc(ccb, docList)
                      )}
                      style={{flexDirection: 'row', paddingVertical: 10}}>
                      <Text
                        style={{
                          textAlign: 'left',
                          flex: 1,
                          color: '#000',
                        }}>
                        {ccb}
                      </Text>
                      {!isAdmin && (
                        <TouchableOpacity
                          onPress={() => {
                            const deleteItem = dbDocList?.find(
                              doc =>
                                doc?.category === 'UNEMPLOYABILITY' &&
                                doc.name === ccb,
                            );
                            deleteItem && removeDocfromDB(deleteItem);
                            setDocList(
                              dbDocList?.filter(i => {
                                return (
                                  i?.category === 'UNEMPLOYABILITY' &&
                                  i.name !== ccb
                                );
                              }),
                            );
                            setCcb(null);
                          }}>
                          {!errstatement && (
                            <Icon name="close" size={20} color={'red'} />
                          )}
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          marginTop: 3,
                          color: '#222',
                        }}>
                        {'Ex. ccb certificate'}
                      </Text>
                    </View>
                  )}
                  {!isAdmin && (
                    <View style={{marginTop: 15}}>
                      <UploadButton
                        disabled={disabledUpload}
                        loading={uploading.ccb}
                        text={'Upload'}
                        onPress={true}
                        onDismiss={(image, i) => {
                          handleDismiss('ccb', image, i);
                        }}
                      />
                    </View>
                  )}
                </View>
              </View>
            )
          ) : null}
        </View>
        {/* )} */}
        {!isAdmin &&
          props.route?.params?.isReviewRequired &&
          !userMeta?.reviewedSteps?.isRequiredDocumentsAck && (
            <>
              <View>
                <TouchableOpacity
                  onPress={updateReviewStatus}
                  style={{width: '100%', borderRadius: 50}}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={[
                      GlobalStyles.flexDirectionRow,
                      GlobalStyles.linearGradient,
                    ]}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                      I Acknowledge
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        {!isAdmin && (
          <View style={{marginTop: 10, marginBottom: 30}}>
            <View style={{flexDirection: 'row'}}>
              {!isAdmin && props?.isProfileConfig && (
                <TouchableOpacity
                  onPress={() => {
                    if (state?.profile?.maritalStatus === 'SINGLE') {
                      props.scrollToNext(6);
                      props.jumpTo('asset');
                    } else {
                      props.scrollToNext(6);
                      props.jumpTo('familyInfo');
                    }
                  }}
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    marginRight: 12,
                    borderRadius: 50,
                  }}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={[
                      GlobalStyles.flexDirectionRow,
                      GlobalStyles.linearGradient,
                    ]}>
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
              )}
              <TouchableOpacity
                onPress={() => handleSkip()}
                style={{
                  width: props?.isProfileConfig
                    ? Dimensions.get('screen').width / 2.3
                    : Dimensions.get('screen').width / 1.13,
                  borderRadius: 50,
                }}>
                <LinearGradient
                  colors={['#0B7E51', '#006940']}
                  style={[
                    GlobalStyles.flexDirectionRow,
                    GlobalStyles.linearGradient,
                  ]}>
                  <Text
                    style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
                    Finish
                  </Text>
                  <View style={{position: 'absolute', right: 20}}>
                    <Icon name={'chevron-right'} size={25} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
                <Icon name={'close'} color={'red'} size={23} />
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
              ) : (fileName.substr(0, fileName.indexOf('.')) === 'signature' &&
                  isAdmin) ||
                fileName.split('.')[1] === 'pdf' ? (
                <View
                  style={{
                    width: '100%',
                    height: '65%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{fontSize: 17, color: '#cc0000'}}>
                    View restricted...
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
                  style={[
                    GlobalStyles.flexDirectionRow,
                    GlobalStyles.linearGradient,
                  ]}>
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
    </ScrollView>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
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
  group: {
    marginTop: 20,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    height: 65,
  },
  groupInner: {
    alignItems: 'center',
    marginTop: 20,
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
  cardHeading: {
    flex: 0.7,
    fontSize: 18,
    fontWeight: 'bold',
  },
  labelStrick: {
    fontSize: 16,
    color: 'red',
    fontWeight: '100',
  },
  fileType: {
    flex: 0.3,
    alignSelf: 'flex-end',
    textAlign: 'right',
    fontSize: 12,
    color: 'lightgray',
    paddingBottom: 3,
  },
  description: {
    fontSize: 12,
    marginTop: 3,
  },
  // linearGradient: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderRadius: 40,
  //   flexDirection: 'row',
  //   height: 60,
  //   // width: '100%',
  // },
});

export default UploadDocuments;
