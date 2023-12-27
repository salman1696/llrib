import React, {useContext, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {green, primaryBGColor} from '../../../utils/colors';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UploadButton from '../../../components/UploadButton';
import {
  DocumentCategory,
  DocumentName,
  DocumentType,
} from '../../../utils/strings';
import {uploadFile} from '../../../servercalls/uploadFiles';
import {AppContext} from '../../../context/AppContext';
import LinearGradient from 'react-native-linear-gradient';
import {skipAStep} from '../../../servercalls/userApplication';

const Signature = props => {
  const item = props.route?.params?.item;

  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [signature, setSignature] = useState('');
  const [errsignature, seterrSignature] = useState('');

  const validationSignature = () => {
    try {
      let response = true;
      if (signature == '' || signature == null) {
        seterrSignature(true);
        response = false;
      }

      return response;
    } catch (err) {
      console.log('Error in validations', err);
    }
  };

  const handleDismiss = async image => {
    const filename = getFileName(image?.path);
    const extension = getFileExtension(filename);
    // console.log('Payload', filename);
    const payload = {
      type: DocumentType.SIGNATURE,
      category: DocumentCategory.SIGNATURE,
      mimeType: 'image/jpeg',
      name: DocumentName.signature + '.' + extension,
    };

    console.log('Payload', payload);
    let binary = image?.data;

    const presignedUrl = await getPresignedUrl(
      payload,
      state?.user?.accessToken,
    );
    if (presignedUrl.status == 200) {
      const path = await uploadDocumentOnPresignedUrl(
        presignedUrl.data?.url,
        binary,
      );
      if (path.status == 200) {
        // REMINDER: we are showing the IMAGE itself not the name.
        setSignature(image.path);
      } else {
        setSignature(null);
        alert(
          path?.data?.detail ?? 'Unable to upload document to presigned url.',
        );
      }
    } else {
      alert(presignedUrl.data?.detail ?? 'Unable to upload document.');
    }
  };

  const handleSkip = async () => {
    const payload = {
      id: state?.user?.id,
      completedStepNumber: 10,
      userProfile: {
        id: state?.user?.id,
      },
    };
    let response = await skipAStep(
      payload,
      state?.user?.id,
      state?.user?.accessToken,
    );
    if (response.status === 200) {
      props.navigation.navigate('user_dashboard');
    } else {
      console.log('**RESPONSE**', response);
      alert('Unable to skip this step, please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {signature != '' ? (
        <View style={styles.card}>
          <Image
            source={{uri: signature}}
            style={{
              width: '100%',
              height: Dimensions.get('screen').width / 2,
            }}
          />
          <View style={{position: 'absolute', top: 5, right: 5}}>
            <TouchableOpacity
              style={{padding: 5, backgroundColor: 'white'}}
              onPress={() => setSignature('')}>
              <Icon name="close" size={20} color={'red'} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{marginTop: 15}}>
          <UploadButton
            text={'Upload Signature'}
            onDismiss={image => {
              handleDismiss(image);
              seterrSignature(false);
            }}
          />
        </View>
      )}
      {!isAdmin && (
        <View style={{marginTop: 20, marginBottom: 30}}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => {
                props.jumpTo('documents');
              }}
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
                validationSignature()
                  ? alert('Please provide the Signature.')
                  : handleSkip()
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
                  Submit
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryBGColor,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  uploadButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderColor: green,
    borderWidth: 1,
    borderRadius: 5,
  },
  upload_text: {
    fontSize: 18,
    color: green,
  },
  centeredView: {
    flex: 1,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalView: {
    width: 300,
    zIndex: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitleContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#BABABB',
    borderBottomWidth: 1,
  },
  modal_title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  modalButton: {
    width: '100%',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomColor: '#BABABB',
    borderBottomWidth: 1,
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
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    flexDirection: 'row',
    height: 60,
    // width: '100%',
  },
});

export default Signature;
