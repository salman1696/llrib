import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { green } from '../utils/colors';
// import Modal, { ModalButton, ModalContent, ModalTitle, SlideAnimation } from 'react-native-modals';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker, { types } from 'react-native-document-picker';

const UploadButton = props => {
  const { onDismiss, onPress, loading, disabled } = props;

  const [showModal, setShowModal] = useState(false);

  function openGallery() {
    ImagePicker.openPicker({
      width: 400,
      height: 300,
      cropping: true,
      includeBase64: true,
    }).then(image => {
      console.log(image);
      setShowModal(false);
      onDismiss(image, 'img');
      // setSignature(image.path);
    });
  }

  function openCamera() {
    ImagePicker.openCamera({
      width: 400,
      height: 300,
      cropping: true,
      includeBase64: true,
    }).then(image => {
      // console.log(image);
      setShowModal(false);
      onDismiss(image, 'img');
      // setSignature(image.path);
    });
  }

  async function docPicker() {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles, DocumentPicker.types.images],
        // type: [DocumentPicker.types.pdf],
        // copyTo: 'documentDirectory',
        // DocumentPicker.types.pdf
      });

      onDismiss(res[0], 'doc');
      setShowModal(false);
    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        console.log('user cancelled uploading photo.');
      } else {
        //For Unknown Error
        alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  }

  return (
    <View style={{ zIndex: 2 }}>
      <TouchableOpacity
        style={styles.button}
        disabled={disabled}
        onPress={() => setShowModal(onPress)}>
        {loading ? (
          <ActivityIndicator size={'small'} color={green} />
        ) : (
          <Text style={styles.buttonText}>{props.text}</Text>
        )}
      </TouchableOpacity>
      {showModal && (
        <Modal animationType="fade" transparent={true} visible={showModal}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modal_title}>Upload Document</Text>
              </View>
              <Pressable style={styles.modalButton} onPress={openCamera}>
                <Text style={styles.textStyle}>Take a photo</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={openGallery}>
                <Text style={styles.textStyle}>Choose from gallery</Text>
              </Pressable>
           {Platform.OS==='ios' &&   <Pressable style={styles.modalButton} onPress={docPicker}>
                <Text style={styles.textStyle}>Choose from Phone</Text>
              </Pressable>}

              <Pressable
                style={[styles.modalButton, { borderBottomWidth: 0 }]}
                onPress={() => setShowModal(false)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        // <Modal useNativeDriver={true}  visible={true}
        //     modalAnimation={new SlideAnimation({
        //         slideFrom: 'bottom',
        //     })}>
        //         <ModalContent  style={{width: 300, backgroundColor: 'lightgray'}}>
        //             <View style={{width: 300, marginLeft: -20}}>
        //                 <View style={{justifyContent:'center',
        //                 alignItems:'center', marginTop: -5,
        //                 paddingBottom: 15, borderBottomColor: "gray", borderBottomWidth: 1}}>
        //                     <Text style={styles.modal_title}>{props.ModelTitle ? props.ModelTitle : "Upload"}</Text>
        //                 </View>
        //                 <ModalButton
        //                     style={{marginVertical: 10}}
        //                     bordered
        //                     text="Take a photo"
        //                     onPress={openCamera}
        //                 />
        //                 <ModalButton
        //                     style={{marginVertical: 10}}
        //                     text="Choose from gallery"
        //                     onPress={openGallery}
        //                 />
        //                 <ModalButton
        //                     style={{marginVertical: 10}}
        //                     text="Cancel"
        //                     onPress={() => { setShowModal(false) }}
        //                 />
        //             </View>
        //         </ModalContent>
        //     </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: green,
  },
  buttonText: {
    fontSize: 16,
    color: green,
    fontWeight: 'bold',
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
  centeredView: {
    flex: 1,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  modalView: {
    width: 300,
    zIndex: 4,
    backgroundColor: '#CDCDCD',
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
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: '#007aff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default UploadButton;
